'use server';

import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { WhatsappConfig } from '@/types/database.types';
import { sendWhatsAppHttp, runCronNotificationCheck } from '@/app/actions/whatsapp';

// Helper de segurança para validar se o requisitante é super_admin ativo
async function checkSuperAdminPermission(supabaseAdmin: ReturnType<typeof createServerClient>) {
  const cookieStore = await cookies();
  const token = cookieStore.get('sb-access-token')?.value;

  if (!token) {
    throw new Error('Não autorizado: Sessão ausente.');
  }

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) {
    throw new Error('Não autorizado: Sessão inválida.');
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('perfis_usuarios')
    .select('role, status_acesso')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    throw new Error('Erro ao validar permissões do usuário.');
  }

  if (profile.role !== 'super_admin') {
    throw new Error('Acesso negado: Permissão restrita ao proprietário do SaaS.');
  }

  if (profile.status_acesso === false) {
    throw new Error('Acesso negado: Seu usuário está bloqueado.');
  }

  return user;
}

// Limpa o número de telefone para formato brasileiro (DDI + DDD + Número apenas)
function cleanPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if ((digits.length === 10 || digits.length === 11) && !digits.startsWith('55')) {
    return '55' + digits;
  }
  return digits;
}

interface CriarEmpresaEClienteParams {
  nome_fantasia: string;
  cnpj: string;
  nome_mestre: string;
  email: string;
  password?: string;
  whatsapp_contato?: string;
}

/**
 * Cria a empresa na tabela empresas e o usuário administrador 'mestre' no auth.users, vinculando-os.
 */
export async function criarEmpresaECliente(dados: CriarEmpresaEClienteParams) {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return {
        success: false,
        error: 'Chave SUPABASE_SERVICE_ROLE_KEY ausente. Defina-a para gerenciar a autenticação admin.'
      };
    }

    const supabaseAdmin = createServerClient();
    await checkSuperAdminPermission(supabaseAdmin);

    if (!dados.nome_fantasia.trim()) return { success: false, error: 'O nome fantasia é obrigatório.' };
    if (!dados.cnpj.trim()) return { success: false, error: 'O CNPJ é obrigatório.' };
    if (!dados.nome_mestre.trim()) return { success: false, error: 'O nome do usuário responsável é obrigatório.' };
    if (!dados.email.trim()) return { success: false, error: 'O e-mail é obrigatório.' };

    const emailFormatado = dados.email.trim().toLowerCase();
    const cnpjFormatado = dados.cnpj.replace(/\D/g, '');
    const senhaDefinida = dados.password?.trim() || 'HublyMestre2026!';

    // 1. Verificar se o CNPJ já está cadastrado
    const { data: cnpjExists } = await supabaseAdmin
      .from('empresas')
      .select('id')
      .eq('cnpj', cnpjFormatado)
      .maybeSingle();

    if (cnpjExists) {
      return { success: false, error: 'Este CNPJ já está cadastrado.' };
    }

    // 2. Criar a empresa no banco de dados
    const { data: novaEmpresa, error: empresaError } = await supabaseAdmin
      .from('empresas')
      .insert({
        nome_fantasia: dados.nome_fantasia.trim(),
        cnpj: cnpjFormatado,
        status_assinatura: 'ativa'
      })
      .select()
      .single();

    if (empresaError || !novaEmpresa) {
      console.error('Erro ao criar empresa:', empresaError);
      return { success: false, error: empresaError?.message || 'Erro ao criar registro da empresa.' };
    }

    // 3. Criar o usuário responsável no Supabase Auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: emailFormatado,
      password: senhaDefinida,
      email_confirm: true,
      user_metadata: {
        name: dados.nome_mestre.trim(),
        nome_completo: dados.nome_mestre.trim(),
        role: 'mestre',
        status_acesso: true,
        empresa_id: novaEmpresa.id
      }
    });

    if (authError) {
      console.error('Erro ao criar usuário mestre no Auth:', authError);
      // Rollback da empresa criada
      await supabaseAdmin.from('empresas').delete().eq('id', novaEmpresa.id);
      return { success: false, error: authError.message || 'Erro ao criar conta de acesso do mestre.' };
    }

    const novoUserId = authUser.user?.id;
    if (!novoUserId) {
      await supabaseAdmin.from('empresas').delete().eq('id', novaEmpresa.id);
      return { success: false, error: 'Erro ao gerar o ID de usuário no Supabase.' };
    }

    // 4. Garantir que o perfil global foi criado em perfis_usuarios
    const { data: perfilExistente } = await supabaseAdmin
      .from('perfis_usuarios')
      .select('id')
      .eq('id', novoUserId)
      .maybeSingle();

    if (!perfilExistente) {
      const { error: profileError } = await supabaseAdmin
        .from('perfis_usuarios')
        .insert({
          id: novoUserId,
          nome_completo: dados.nome_mestre.trim(),
          email: emailFormatado,
          role: 'mestre',
          status_acesso: true,
          empresa_id: novaEmpresa.id,
          senha_temp: senhaDefinida
        });

      if (profileError) {
        console.error('Erro ao criar perfil mestre:', profileError);
        await supabaseAdmin.auth.admin.deleteUser(novoUserId);
        await supabaseAdmin.from('empresas').delete().eq('id', novaEmpresa.id);
        return { success: false, error: 'Erro ao criar o perfil do usuário responsável.' };
      }
    } else {
      // Atualizar o perfil caso já tenha sido criado pelo trigger handle_new_user
      await supabaseAdmin
        .from('perfis_usuarios')
        .update({
          nome_completo: dados.nome_mestre.trim(),
          role: 'mestre',
          empresa_id: novaEmpresa.id,
          status_acesso: true,
          senha_temp: senhaDefinida
        })
        .eq('id', novoUserId);
    }

    // 5. Criar (ou garantir) o vínculo em empresa_membros (N:N)
    //    O trigger handle_new_user já deve ter criado, mas garantimos aqui por segurança.
    const { error: membroError } = await supabaseAdmin
      .from('empresa_membros')
      .upsert({
        user_id:      novoUserId,
        empresa_id:   novaEmpresa.id,
        role:         'mestre',
        status_acesso: true,
      }, { onConflict: 'user_id,empresa_id' });

    if (membroError) {
      console.warn('[criarEmpresaECliente] Aviso: erro ao criar empresa_membros:', membroError.message);
      // Não é fatal — o trigger já pode ter criado
    }

    // 6. Criar configuração do WhatsApp se whatsapp_contato for informado
    if (dados.whatsapp_contato?.trim()) {
      const cleanPhone = dados.whatsapp_contato.replace(/\D/g, '');
      if (cleanPhone) {
        try {
          const { data: allConfigs } = await supabaseAdmin
            .from('whatsapp_config')
            .select('id')
            .order('id', { ascending: false });
          const nextId = allConfigs && allConfigs.length > 0 ? Math.max(...allConfigs.map((c: any) => c.id)) + 1 : 1;

          await supabaseAdmin
            .from('whatsapp_config')
            .insert({
              id: nextId,
              empresa_id: novaEmpresa.id,
              whatsapp_contato: cleanPhone,
              ativo: false,
              api_provider: 'evolution',
              antecedencia_minutos: 60,
              mensagem_template: 'Olá {nome_tecnico}, sua próxima visita técnica para o cliente {cliente_nome} no endereço {endereco_obra} será daqui a {antecedencia} (agendada para às {horario_visita}).',
              updated_at: new Date().toISOString()
            });
        } catch (waErr) {
          console.error('Erro ao configurar whatsapp inicial da nova empresa:', waErr);
        }
      }
    }

    return {
      success: true,
      data: {
        empresa: novaEmpresa,
        usuarioId: novoUserId
      }
    };
  } catch (err: any) {
    console.error('Erro no criarEmpresaECliente:', err);
    return { success: false, error: err.message || 'Erro inesperado ao criar empresa e cliente.' };
  }
}

/**
 * Altera a senha de qualquer usuário usando o Supabase Auth Admin.
 */
export async function atualizarSenhaUsuario(userId: string, novaSenha: string) {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return { success: false, error: 'Chave SUPABASE_SERVICE_ROLE_KEY ausente.' };
    }

    const supabaseAdmin = createServerClient();
    await checkSuperAdminPermission(supabaseAdmin);

    if (!novaSenha || novaSenha.trim().length < 6) {
      return { success: false, error: 'A senha deve conter no mínimo 6 caracteres.' };
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: novaSenha.trim()
    });

    if (error) {
      console.error('Erro ao alterar senha do usuário:', error);
      return { success: false, error: error.message || 'Erro ao redefinir a senha do usuário.' };
    }

    // Salvar nova senha limpa no perfil público para visualização pelo super admin
    await supabaseAdmin
      .from('perfis_usuarios')
      .update({ senha_temp: novaSenha.trim() })
      .eq('id', userId);

    return { success: true };
  } catch (err: any) {
    console.error('Erro no atualizarSenhaUsuario:', err);
    return { success: false, error: err.message || 'Erro inesperado ao alterar a senha.' };
  }
}

/**
 * Altera o status da assinatura de uma empresa no banco de dados.
 */
export async function alterarStatusAssinatura(empresaId: string, status: 'ativa' | 'inadimplente' | 'cancelada') {
  try {
    const supabaseAdmin = createServerClient();
    await checkSuperAdminPermission(supabaseAdmin);

    const { error } = await supabaseAdmin
      .from('empresas')
      .update({ status_assinatura: status })
      .eq('id', empresaId);

    if (error) {
      console.error('Erro ao atualizar status da assinatura:', error);
      return { success: false, error: error.message || 'Erro ao alterar o status da assinatura.' };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Erro no alterarStatusAssinatura:', err);
    return { success: false, error: err.message || 'Erro inesperado ao atualizar a assinatura.' };
  }
}

/**
 * Retorna todas as empresas cadastradas no sistema, o usuário mestre e algumas métricas básicas de uso.
 */
export async function getSaaSEmpresas() {
  try {
    const supabaseAdmin = createServerClient();
    await checkSuperAdminPermission(supabaseAdmin);

    // 1. Buscar todas as empresas
    const { data: empresas, error: empresasError } = await supabaseAdmin
      .from('empresas')
      .select('*')
      .order('criado_em', { ascending: false });

    if (empresasError) {
      throw empresasError;
    }

    // 2. Para cada empresa, buscar o usuário com a role 'mestre' e contar registros
    const empresasComMetricas = await Promise.all(
      empresas.map(async (empresa) => {
        // Obter usuário mestre
        const { data: mestre } = await supabaseAdmin
          .from('perfis_usuarios')
          .select('id, nome_completo, email, senha_temp')
          .eq('empresa_id', empresa.id)
          .eq('role', 'mestre')
          .limit(1)
          .maybeSingle();

        // Obter WhatsApp de contato público da empresa
        const { data: whatsConfig } = await supabaseAdmin
          .from('whatsapp_config')
          .select('whatsapp_contato')
          .eq('empresa_id', empresa.id)
          .maybeSingle();

        // Contar leads
        const { count: leadsCount } = await supabaseAdmin
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('empresa_id', empresa.id);

        // Contar projetos
        const { count: projectsCount } = await supabaseAdmin
          .from('projects')
          .select('*', { count: 'exact', head: true })
          .eq('empresa_id', empresa.id);

        return {
          ...empresa,
          whatsapp_contato: whatsConfig?.whatsapp_contato || null,
          mestre: mestre ? {
            id: mestre.id,
            nome: mestre.nome_completo,
            email: mestre.email,
            senha_temp: mestre.senha_temp
          } : null,
          metricas: {
            leads: leadsCount || 0,
            projetos: projectsCount || 0
          }
        };
      })
    );

    return { success: true, data: empresasComMetricas };
  } catch (err: any) {
    console.error('Erro no getSaaSEmpresas:', err);
    return { success: false, error: err.message || 'Erro inesperado ao listar empresas.' };
  }
}

interface AtualizarEmpresaParams {
  nome_fantasia: string;
  cnpj: string;
  whatsapp_contato?: string | null;
}

/**
 * Atualiza os dados cadastrais de uma empresa (nome fantasia e CNPJ).
 */
export async function atualizarEmpresa(empresaId: string, dados: AtualizarEmpresaParams) {
  try {
    const supabaseAdmin = createServerClient();
    await checkSuperAdminPermission(supabaseAdmin);

    if (!dados.nome_fantasia.trim()) return { success: false, error: 'O nome fantasia é obrigatório.' };
    if (!dados.cnpj.trim()) return { success: false, error: 'O CNPJ é obrigatório.' };

    const cnpjFormatado = dados.cnpj.replace(/\D/g, '');

    // Verificar se outro cadastro já possui esse CNPJ
    const { data: cnpjExists } = await supabaseAdmin
      .from('empresas')
      .select('id')
      .eq('cnpj', cnpjFormatado)
      .neq('id', empresaId)
      .maybeSingle();

    if (cnpjExists) {
      return { success: false, error: 'Este CNPJ já está cadastrado em outra empresa.' };
    }

    const { error } = await supabaseAdmin
      .from('empresas')
      .update({
        nome_fantasia: dados.nome_fantasia.trim(),
        cnpj: cnpjFormatado,
      })
      .eq('id', empresaId);

    if (error) {
      console.error('Erro ao atualizar empresa:', error);
      return { success: false, error: error.message || 'Erro ao atualizar dados da empresa.' };
    }

    // 2. Atualizar ou inserir na tabela whatsapp_config o whatsapp_contato
    if (dados.whatsapp_contato !== undefined) {
      const cleanPhone = dados.whatsapp_contato ? dados.whatsapp_contato.replace(/\D/g, '') : '';
      
      const { data: existing } = await supabaseAdmin
        .from('whatsapp_config')
        .select('id')
        .eq('empresa_id', empresaId)
        .maybeSingle();

      if (existing) {
        const { error: waError } = await supabaseAdmin
          .from('whatsapp_config')
          .update({
            whatsapp_contato: cleanPhone || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);
        if (waError) {
          console.error('Erro ao atualizar whatsapp_contato:', waError);
          return { success: false, error: waError.message || 'Erro ao atualizar WhatsApp de contato.' };
        }
      } else if (cleanPhone) {
        const { data: allConfigs } = await supabaseAdmin
          .from('whatsapp_config')
          .select('id')
          .order('id', { ascending: false });
        const nextId = allConfigs && allConfigs.length > 0 ? Math.max(...allConfigs.map((c: any) => c.id)) + 1 : 1;

        const { error: waError } = await supabaseAdmin
          .from('whatsapp_config')
          .insert({
            id: nextId,
            empresa_id: empresaId,
            whatsapp_contato: cleanPhone,
            ativo: false,
            api_provider: 'evolution',
            antecedencia_minutos: 60,
            mensagem_template: 'Olá {nome_tecnico}, sua próxima visita técnica para o cliente {cliente_nome} no endereço {endereco_obra} será daqui a {antecedencia} (agendada para às {horario_visita}).',
            updated_at: new Date().toISOString()
          });
        if (waError) {
          console.error('Erro ao criar whatsapp_contato:', waError);
          return { success: false, error: waError.message || 'Erro ao salvar WhatsApp de contato.' };
        }
      }
    }

    return { success: true };
  } catch (err: any) {
    console.error('Erro no atualizarEmpresa:', err);
    return { success: false, error: err.message || 'Erro inesperado ao atualizar a empresa.' };
  }
}

/**
 * Alterna manualmente o status da assinatura de uma empresa para bloqueio/desbloqueio.
 */
export async function alternarBloqueioEmpresa(
  empresaId: string,
  novoStatus: 'ativa' | 'inadimplente' | 'cancelada'
) {
  try {
    const supabaseAdmin = createServerClient();
    await checkSuperAdminPermission(supabaseAdmin);

    const { error } = await supabaseAdmin
      .from('empresas')
      .update({ status_assinatura: novoStatus })
      .eq('id', empresaId);

    if (error) {
      console.error('Erro ao alternar bloqueio da empresa:', error);
      return { success: false, error: error.message || 'Erro ao alterar status da assinatura.' };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Erro no alternarBloqueioEmpresa:', err);
    return { success: false, error: err.message || 'Erro inesperado ao alternar bloqueio.' };
  }
}

interface SalvarFaturamentoCustomizadoParams {
  mensalidade_customizada: number | null;
  desconto_mensal: number;
  motivo_desconto: string | null;
}

/**
 * Define ou remove o valor da mensalidade personalizada e descontos para uma empresa.
 */
export async function salvarFaturamentoCustomizado(
  empresaId: string,
  dados: SalvarFaturamentoCustomizadoParams
) {
  try {
    const supabaseAdmin = createServerClient();
    await checkSuperAdminPermission(supabaseAdmin);

    const { error } = await supabaseAdmin
      .from('empresas')
      .update({
        mensalidade_customizada: dados.mensalidade_customizada,
        desconto_mensal: dados.desconto_mensal,
        motivo_desconto: dados.motivo_desconto || null
      })
      .eq('id', empresaId);

    if (error) {
      console.error('Erro ao salvar faturamento customizado:', error);
      return { success: false, error: error.message || 'Erro ao atualizar faturamento da empresa.' };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Erro no salvarFaturamentoCustomizado:', err);
    return { success: false, error: err.message || 'Erro inesperado ao salvar faturamento.' };
  }
}

/**
 * Exclui permanentemente uma empresa com DEEP CLEANSE completo:
 *   1. Apaga todos os arquivos físicos do Supabase Storage (PDFs, imagens)
 *   2. Apaga usuários do auth.users respeitando N:N:
 *      - Se o usuário pertence APENAS a esta empresa → deleta do Auth
 *      - Se pertence a outras empresas também → apenas remove o vínculo (cascade)
 *   3. Deleta a empresa → cascade limpa leads, projetos, visitas, etc.
 */
export async function excluirEmpresa(empresaId: string) {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return { success: false, error: 'Chave SUPABASE_SERVICE_ROLE_KEY ausente.' };
    }

    const supabaseAdmin = createServerClient();
    await checkSuperAdminPermission(supabaseAdmin);

    // ─── PASSO 1: Limpar Supabase Storage ─────────────────────────────────────
    // Estratégia dupla:
    //   A) Listar arquivos com prefixo empresa_id/ (estrutura organizada)
    //   B) Varrer coluna pdf_proposta_url das visits para capturar paths avulsos

    const BUCKET = 'documentos_crm';

    // 1A. Listagem por prefixo (path: empresa_id/...)
    try {
      const { data: storageFiles } = await supabaseAdmin.storage
        .from(BUCKET)
        .list(empresaId, { limit: 1000, sortBy: { column: 'name', order: 'asc' } });

      if (storageFiles && storageFiles.length > 0) {
        const filePaths = storageFiles.map((f) => `${empresaId}/${f.name}`);
        const { error: removeError } = await supabaseAdmin.storage
          .from(BUCKET)
          .remove(filePaths);
        if (removeError) {
          console.warn(`[Deep Cleanse] Aviso ao remover arquivos do Storage (prefixo):`, removeError.message);
        } else {
          console.log(`[Deep Cleanse] ${filePaths.length} arquivo(s) removido(s) do Storage (prefixo).`);
        }
      }
    } catch (storageErr: any) {
      console.warn('[Deep Cleanse] Aviso na listagem do Storage por prefixo:', storageErr.message);
    }

    // 1B. Varrer pdf_proposta_url nas visitas desta empresa para capturar paths avulsos
    try {
      const { data: visitsWithPdf } = await supabaseAdmin
        .from('visits')
        .select('pdf_proposta_url')
        .eq('empresa_id', empresaId)
        .not('pdf_proposta_url', 'is', null);

      if (visitsWithPdf && visitsWithPdf.length > 0) {
        // Extrair o path relativo a partir da URL pública do Supabase
        // Formato: .../storage/v1/object/public/documentos_crm/{path}
        const avulsePaths: string[] = visitsWithPdf
          .map((v) => {
            const url: string = v.pdf_proposta_url || '';
            const marker = `/object/public/${BUCKET}/`;
            const idx = url.indexOf(marker);
            return idx !== -1 ? decodeURIComponent(url.substring(idx + marker.length)) : null;
          })
          .filter((p): p is string => !!p && !p.startsWith(`${empresaId}/`)); // apenas os avulsos

        if (avulsePaths.length > 0) {
          const { error: avulseErr } = await supabaseAdmin.storage
            .from(BUCKET)
            .remove(avulsePaths);
          if (avulseErr) {
            console.warn('[Deep Cleanse] Aviso ao remover arquivos avulsos:', avulseErr.message);
          } else {
            console.log(`[Deep Cleanse] ${avulsePaths.length} arquivo(s) avulso(s) removido(s).`);
          }
        }
      }
    } catch (pdfErr: any) {
      console.warn('[Deep Cleanse] Aviso ao varrer pdf_proposta_url:', pdfErr.message);
    }

    // ─── PASSO 2: Coletar membros via empresa_membros (N:N) ───────────────────
    const { data: membros, error: membrosError } = await supabaseAdmin
      .from('empresa_membros')
      .select('user_id')
      .eq('empresa_id', empresaId);

    if (membrosError) {
      console.error('[Deep Cleanse] Erro ao buscar membros:', membrosError);
      return { success: false, error: 'Erro ao buscar membros da empresa para exclusão.' };
    }

    // ─── PASSO 3: Deletar usuários do Auth (somente os exclusivos desta empresa) ─
    if (membros && membros.length > 0) {
      for (const membro of membros) {
        // Verificar quantas empresas este usuário possui no total
        const { count: totalEmpresas } = await supabaseAdmin
          .from('empresa_membros')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', membro.user_id);

        if ((totalEmpresas ?? 0) <= 1) {
          // Usuário EXCLUSIVO desta empresa → deletar do Auth (cascade remove perfis_usuarios + empresa_membros)
          console.log(`[Deep Cleanse] Deletando usuário exclusivo do Auth: ${membro.user_id}`);
          const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(membro.user_id);
          if (authDeleteError) {
            console.error(`[Deep Cleanse] Erro ao deletar usuário ${membro.user_id} do Auth:`, authDeleteError.message);
          }
        } else {
          // Usuário COMPARTILHADO (pertence a outras empresas também)
          // O ON DELETE CASCADE da empresa_membros removerá apenas o vínculo com esta empresa.
          // O usuário continuará existindo nas outras empresas.
          console.log(`[Deep Cleanse] Usuário ${membro.user_id} pertence a outras empresas — apenas vínculo removido.`);
        }
      }
    }

    // ─── PASSO 4: Deletar a empresa (cascade limpa todos os dados do banco) ────
    const { error: empresaDeleteError } = await supabaseAdmin
      .from('empresas')
      .delete()
      .eq('id', empresaId);

    if (empresaDeleteError) {
      console.error('[Deep Cleanse] Erro ao deletar empresa:', empresaDeleteError);
      return { success: false, error: `Erro ao deletar empresa: ${empresaDeleteError.message}` };
    }

    console.log(`[Deep Cleanse] ✅ Empresa ${empresaId} e todos os seus dados foram eliminados com sucesso.`);
    return { success: true };
  } catch (err: any) {
    console.error('[Deep Cleanse] Erro inesperado no excluirEmpresa:', err);
    return { success: false, error: err.message || 'Erro inesperado ao excluir empresa.' };
  }
}

/**
 * Obtém a configuração de WhatsApp de uma empresa específica (Super Admin)
 */
export async function getWhatsappConfigForSuperAdmin(
  empresaId: string
): Promise<{ success: boolean; data?: WhatsappConfig; error?: string }> {
  try {
    const supabase = createServerClient();
    await checkSuperAdminPermission(supabase);

    const { data, error } = await supabase
      .from('whatsapp_config')
      .select('*')
      .eq('empresa_id', empresaId)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      // Retorna configuração padrão vinculada à empresa
      return {
        success: true,
        data: {
          id: 0,
          ativo: false,
          api_provider: 'evolution',
          api_url: '',
          api_key: '',
          instancia: '',
          antecedencia_minutos: 60,
          mensagem_template: 'Olá {nome_tecnico}, sua próxima visita técnica para o cliente {cliente_nome} no endereço {endereco_obra} será daqui a {antecedencia} (agendada para às {horario_visita}).',
          headers_customizados: null,
          payload_customizado: null,
          whatsapp_contato: '',
          empresa_id: empresaId,
          updated_at: new Date().toISOString(),
        } as unknown as WhatsappConfig
      };
    }

    return { success: true, data: data as WhatsappConfig };
  } catch (err: any) {
    console.error('Erro ao obter whatsapp_config para superadmin:', err);
    return { success: false, error: err.message || 'Erro ao carregar configurações de WhatsApp.' };
  }
}

/**
 * Salva a configuração de WhatsApp de uma empresa específica (Super Admin)
 */
export async function saveWhatsappConfigForSuperAdmin(
  empresaId: string,
  updates: Partial<Omit<WhatsappConfig, 'id' | 'updated_at'>>
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerClient();
    await checkSuperAdminPermission(supabase);

    const { data: existing } = await supabase
      .from('whatsapp_config')
      .select('id')
      .eq('empresa_id', empresaId)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('whatsapp_config')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
      if (error) throw error;
    } else {
      const { data: allConfigs } = await supabase
        .from('whatsapp_config')
        .select('id')
        .order('id', { ascending: false });
      const nextId = allConfigs && allConfigs.length > 0 ? Math.max(...allConfigs.map((c: any) => c.id)) + 1 : 1;

      const { error } = await supabase
        .from('whatsapp_config')
        .insert({
          id: nextId,
          ...updates,
          empresa_id: empresaId,
          updated_at: new Date().toISOString(),
        });
      if (error) throw error;
    }

    return { success: true };
  } catch (err: any) {
    console.error('Erro ao salvar whatsapp_config para superadmin:', err);
    return { success: false, error: err.message || 'Erro ao salvar configurações de WhatsApp.' };
  }
}

/**
 * Envia uma mensagem de teste utilizando a configuração de WhatsApp de uma empresa específica (Super Admin)
 */
export async function testWhatsappSendForSuperAdmin(
  empresaId: string,
  phone: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerClient();
    await checkSuperAdminPermission(supabase);

    const { data: config, error } = await supabase
      .from('whatsapp_config')
      .select('*')
      .eq('empresa_id', empresaId)
      .maybeSingle();

    if (error) throw error;
    if (!config || !config.api_url) {
      return { success: false, error: 'A URL da API de WhatsApp não está configurada para esta empresa.' };
    }

    const cleanPhone = cleanPhoneNumber(phone);
    if (!cleanPhone || cleanPhone.length < 10) {
      return { success: false, error: 'Número de telefone inválido. Informe o DDD e o número.' };
    }

    const result = await sendWhatsAppHttp({
      api_provider: config.api_provider,
      api_url: config.api_url,
      api_key: config.api_key,
      instancia: config.instancia,
      headers_customizados: config.headers_customizados,
      payload_customizado: config.payload_customizado,
      phone: cleanPhone,
      message,
    });

    return result;
  } catch (err: any) {
    console.error('Erro no envio de teste superadmin:', err);
    return { success: false, error: err.message || 'Erro inesperado ao disparar teste.' };
  }
}

/**
 * Dispara manualmente a verificação de notificações de visitas da empresa selecionada (Super Admin)
 */
export async function triggerManualCheckForSuperAdmin(
  empresaId: string
): Promise<{ success: boolean; sentCount?: number; skippedCount?: number; error?: string }> {
  try {
    const supabase = createServerClient();
    await checkSuperAdminPermission(supabase);

    const res = await runCronNotificationCheck(empresaId);
    if (!res.success) {
      return { success: false, error: res.error };
    }
    return { success: true, sentCount: res.sentCount, skippedCount: res.skippedCount };
  } catch (err: any) {
    console.error('Erro no triggerManualCheck superadmin:', err);
    return { success: false, error: err.message || 'Erro inesperado na verificação manual.' };
  }
}



