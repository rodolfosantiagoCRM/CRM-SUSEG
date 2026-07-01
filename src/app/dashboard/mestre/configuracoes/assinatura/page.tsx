'use client';

import React, { useState, useEffect } from 'react';
import { getFaturamentoDados, iniciarCheckoutAssinatura, updateEmpresaNome } from '@/actions/faturamento';
import { Fatura, PlanoSaaS } from '@/types/database.types';
import { getWhatsappConfig, saveWhatsappConfig } from '@/app/actions/whatsapp';

export default function AssinaturaPage() {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Dados do faturamento
  const [empresa, setEmpresa] = useState<any>(null);
  const [faturas, setFaturas] = useState<Fatura[]>([]);
  const [planos, setPlanos] = useState<PlanoSaaS[]>([]);

  // Estado para editar nome da empresa
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const [updatingName, setUpdatingName] = useState(false);

  // Estado para WhatsApp de contato público
  const [whatsappContato, setWhatsappContato] = useState('');
  const [savingWhatsapp, setSavingWhatsapp] = useState(false);

  const handleUpdateName = async () => {
    if (!tempName.trim()) {
      showToast('O nome da empresa não pode ser vazio.', 'error');
      return;
    }
    setUpdatingName(true);
    try {
      const res = await updateEmpresaNome(tempName);
      if (res.success) {
        showToast('Nome da empresa atualizado com sucesso!');
        setEmpresa((prev: any) => prev ? { ...prev, nome_fantasia: tempName.trim() } : prev);
        setIsEditingName(false);
      } else {
        showToast(res.error || 'Erro ao atualizar o nome da empresa.', 'error');
      }
    } catch (err: any) {
      console.error(err);
      showToast('Erro de rede ao atualizar o nome da empresa.', 'error');
    } finally {
      setUpdatingName(false);
    }
  };

  const handleSaveWhatsapp = async () => {
    setSavingWhatsapp(true);
    try {
      const res = await saveWhatsappConfig({
        whatsapp_contato: whatsappContato.trim(),
      });
      if (res.success) {
        showToast('WhatsApp de contato do site atualizado com sucesso!');
      } else {
        showToast(res.error || 'Erro ao salvar WhatsApp.', 'error');
      }
    } catch (err: any) {
      showToast('Erro de conexão ao salvar WhatsApp.', 'error');
    } finally {
      setSavingWhatsapp(false);
    }
  };

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getFaturamentoDados();
      if (res.success) {
        setEmpresa(res.empresa);
        setFaturas(res.faturas || []);
        setPlanos(res.planos || []);
      } else {
        setError(res.error || 'Erro ao carregar dados do faturamento.');
      }

      // Carregar WhatsApp público
      try {
        const waConfig = await getWhatsappConfig();
        setWhatsappContato(waConfig.whatsapp_contato || '');
      } catch (waErr) {
        console.warn('Erro ao carregar whatsApp de contato:', waErr);
      }
    } catch (err: any) {
      console.error(err);
      setError('Erro crítico ao carregar dados do faturamento.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCheckout = async (planoId: string) => {
    setActionLoading(planoId);
    try {
      const res = await iniciarCheckoutAssinatura(planoId);
      if (res.success && res.url) {
        showToast('Link de checkout gerado! Redirecionando...');
        // Redireciona o usuário para o Mercado Pago com segurança
        window.location.href = res.url;
      } else {
        showToast(res.error || 'Erro ao iniciar checkout de assinatura.', 'error');
      }
    } catch (err: any) {
      console.error(err);
      showToast('Ocorreu um erro ao conectar com o gateway de pagamento.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FCFBFA] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-[#0a4ee4]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm text-gray-400 font-semibold font-sans">Carregando painel de assinatura...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FCFBFA] p-6 md:p-10 font-sans flex items-center justify-center">
        <div className="max-w-md w-full bg-white border border-gray-200 rounded-3xl p-8 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center mx-auto text-rose-500 shadow-sm">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-black text-gray-900">Falha ao Carregar Faturamento</h2>
          <p className="text-sm text-gray-500 leading-relaxed">{error}</p>
          <button
            onClick={loadData}
            className="w-full py-3 bg-[#0a4ee4] hover:bg-orange-600 text-white font-bold rounded-2xl transition-all shadow-md shadow-orange-500/20 cursor-pointer text-sm"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  // Mapear o status atual da assinatura
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'ativa':
        return {
          label: 'Ativa',
          bgColor: 'bg-emerald-50 border-emerald-200 text-emerald-700',
          dotColor: 'bg-emerald-500',
        };
      case 'inadimplente':
        return {
          label: 'Aguardando Pagamento',
          bgColor: 'bg-amber-50 border-amber-200 text-amber-700',
          dotColor: 'bg-amber-500',
        };
      case 'cancelada':
      default:
        return {
          label: 'Suspensa',
          bgColor: 'bg-rose-50 border-rose-200 text-rose-700',
          dotColor: 'bg-rose-500',
        };
    }
  };

  const statusConfig = getStatusConfig(empresa?.status_assinatura);

  // Encontrar plano ativo (se houver assinatura_mp_id e planos)
  const planoAtivo = planos.find(p => empresa?.assinatura_mp_id && p.mp_plan_id) || planos[0];

  return (
    <div className="min-h-screen bg-[#FCFBFA] text-gray-900 p-6 md:p-10 font-sans selection:bg-[#0a4ee4] selection:text-white">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <span className="w-2.5 h-7 rounded-full bg-gradient-to-b from-orange-500 to-amber-500 inline-block shrink-0" />
              Faturamento & Assinatura SaaS
            </h1>
            <p className="text-sm text-gray-500 mt-1">Gerencie a assinatura do seu workspace e consulte o histórico de cobranças do HUBLY PRO CRM.</p>
          </div>
        </div>

        {/* Toast Alert */}
        {toast && (
          <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl transition-all duration-300 text-white text-sm font-bold ${
            toast.type === 'error' ? 'bg-rose-600 border border-rose-500' : 'bg-gray-900 border border-gray-800'
          }`}>
            {toast.type === 'error' ? (
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            )}
            {toast.msg}
          </div>
        )}

        {/* Status Card & Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card de Status da Assinatura */}
          <div className="md:col-span-2 bg-white border border-gray-200/80 rounded-3xl p-6 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full translate-x-6 -translate-y-6 group-hover:scale-110 transition-transform duration-300" />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Status da Assinatura</span>
                <span className={`px-3 py-1 rounded-full border text-xs font-bold flex items-center gap-1.5 ${statusConfig.bgColor}`}>
                  <span className={`w-2 h-2 rounded-full ${statusConfig.dotColor} inline-block`} />
                  {statusConfig.label}
                </span>
              </div>
              
              <div className="pt-2">
                <h3 className="text-xl font-bold text-gray-900">
                  {empresa?.status_assinatura === 'ativa' 
                    ? `Plano Contratado: ${planoAtivo?.nome || 'Pro Mensal'}` 
                    : 'Sem Assinatura Ativa'}
                </h3>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed max-w-lg">
                  {empresa?.status_assinatura === 'ativa' 
                    ? 'Sua assinatura está ativa e configurada via débito recorrente no Mercado Pago. O acesso aos recursos estratégicos e painéis de liderança está totalmente liberado.' 
                    : 'Sua conta está sem um plano ativo ou pendente de pagamento. Para liberar o acesso total ao sistema de gestão de visitas e relatórios, ative seu plano no botão abaixo.'}
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                {planoAtivo && (
                  <button
                    onClick={() => handleCheckout(planoAtivo.id)}
                    disabled={actionLoading !== null}
                    className="px-5 py-3 bg-[#0a4ee4] hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm rounded-xl transition-all shadow-md shadow-orange-500/15 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {actionLoading === planoAtivo.id ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Conectando...
                      </>
                    ) : (
                      <>
                        <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        {empresa?.status_assinatura === 'ativa' ? 'Atualizar Cartão/Assinatura' : 'Assinar Plano Pro Agora'}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Card Resumo do Workspace */}
          <div className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Minha Organização</span>
              <div className="flex items-center justify-between gap-2 group/title min-h-[32px]">
                {isEditingName ? (
                  <div className="flex items-center gap-1.5 w-full">
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      disabled={updatingName}
                      className="flex-1 px-2.5 py-1 text-sm font-semibold text-gray-900 bg-gray-50 border border-gray-250 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0a4ee4] focus:border-[#0a4ee4]"
                      maxLength={100}
                    />
                    <button
                      onClick={handleUpdateName}
                      disabled={updatingName}
                      className="p-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-lg transition-colors cursor-pointer"
                      title="Salvar"
                    >
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setIsEditingName(false)}
                      disabled={updatingName}
                      className="p-1 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-500 rounded-lg transition-colors cursor-pointer"
                      title="Cancelar"
                    >
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <>
                    <h4 className="text-lg font-black text-gray-900 truncate" title={empresa?.nome_fantasia}>
                      {empresa?.nome_fantasia || 'Nome da Empresa'}
                    </h4>
                    <button
                      onClick={() => {
                        setTempName(empresa?.nome_fantasia || '');
                        setIsEditingName(true);
                      }}
                      className="p-1 text-gray-400 hover:text-[#0a4ee4] hover:bg-gray-50 rounded-lg transition-all opacity-0 group-hover/title:opacity-100 focus:opacity-100 cursor-pointer"
                      title="Editar nome da empresa"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
              
              <div className="space-y-2 pt-2 text-xs">
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-400 font-medium">Ciclo de Faturamento:</span>
                  <span className="text-gray-800 font-bold">Mensal</span>
                </div>
                
                {empresa?.mensalidade_customizada !== null ? (
                  <>
                    <div className="flex justify-between border-b border-gray-50 pb-2">
                      <span className="text-gray-400 font-medium">Valor Base (Plano):</span>
                      <span className="text-gray-500 line-through">{planoAtivo ? formatCurrency(planoAtivo.valor) : 'R$ 99,90'}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-50 pb-2">
                      <span className="text-gray-400 font-medium">Preço Especial (Workspace):</span>
                      <span className="text-violet-700 font-bold">{formatCurrency(Number(empresa.mensalidade_customizada))}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between border-b border-gray-50 pb-2">
                    <span className="text-gray-400 font-medium">Valor recorrente:</span>
                    <span className="text-gray-800 font-bold">{planoAtivo ? formatCurrency(planoAtivo.valor) : 'R$ 99,90'}</span>
                  </div>
                )}

                {Number(empresa?.desconto_mensal || 0) > 0 && (
                  <div className="flex flex-col border border-emerald-550/10 bg-emerald-500/5 p-2 rounded-lg gap-1.5 animate-fade-in">
                    <div className="flex justify-between text-xs text-emerald-800 font-bold">
                      <span>Campanha Ativa:</span>
                      <span className="truncate max-w-[120px]" title={empresa.motivo_desconto}>{empresa.motivo_desconto || 'Desconto Promocional'}</span>
                    </div>
                    <div className="flex justify-between text-xs text-emerald-600 font-bold">
                      <span>Desconto Aplicado:</span>
                      <span>-{formatCurrency(Number(empresa.desconto_mensal))}</span>
                    </div>
                  </div>
                )}

                {(empresa?.mensalidade_customizada !== null || Number(empresa?.desconto_mensal || 0) > 0) && (
                  <div className="flex justify-between border-b border-gray-50 pb-2 font-bold bg-violet-600/5 p-2 rounded-lg">
                    <span className="text-violet-600">Valor Final Líquido:</span>
                    <span className="text-violet-950 font-black">
                      {formatCurrency(
                        Math.max(
                          0,
                          (empresa?.mensalidade_customizada !== null ? Number(empresa.mensalidade_customizada) : (planoAtivo ? Number(planoAtivo.valor) : 99.90)) -
                          Number(empresa?.desconto_mensal || 0)
                        )
                      )}
                    </span>
                  </div>
                )}

                <div className="flex justify-between pb-2">
                  <span className="text-gray-400 font-medium">Plataforma SaaS:</span>
                  <span className="text-orange-600 font-black uppercase">Hubly Pro</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center gap-2 text-[10px] text-gray-400 leading-normal">
              <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Transações processadas via infraestrutura segura do Mercado Pago.
            </div>
          </div>

        </div>

        {/* WhatsApp de Contato do Site */}
        <div className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp de Contato do Site
            </h3>
            <p className="text-xs text-gray-500 mt-1">Defina o número de telefone que os clientes irão acionar ao clicar no WhatsApp no site principal da SUSEG.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-end max-w-lg">
            <div className="flex-1 space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Número do WhatsApp (com DDI e DDD)</label>
              <input
                type="text"
                value={whatsappContato}
                onChange={(e) => setWhatsappContato(e.target.value)}
                placeholder="Ex: 5541999999999"
                className="w-full bg-gray-50 border border-gray-250 focus:border-[#0a4ee4] focus:ring-2 focus:ring-[#0a4ee4]/10 rounded-xl px-4 py-2.5 text-gray-800 placeholder-gray-400 outline-none transition-all text-xs"
              />
            </div>
            <button
              onClick={handleSaveWhatsapp}
              disabled={savingWhatsapp}
              className="px-6 py-2.5 bg-emerald-550 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center cursor-pointer min-h-[38px]"
            >
              {savingWhatsapp ? 'Salvando...' : 'Salvar WhatsApp'}
            </button>
          </div>
          <p className="text-[10px] text-gray-400 font-bold">
            * Use apenas números, começando com 55 (ex: 5541999999999). Evite espaços, hifens ou parênteses.
          </p>
        </div>

        {/* Planos Disponíveis (Exibe caso o status não seja Ativo para facilitar a assinatura direta) */}
        {empresa?.status_assinatura !== 'ativa' && planos.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              Selecione o plano ideal para sua empresa
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {planos.map((plano) => (
                <div 
                  key={plano.id} 
                  className={`bg-white border-2 rounded-3xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group transition-all ${
                    plano.nome.includes('Pro') 
                      ? 'border-orange-500 scale-102 shadow-orange-500/5' 
                      : 'border-gray-200/80 hover:border-orange-300'
                  }`}
                >
                  {plano.nome.includes('Pro') && (
                    <div className="absolute top-0 right-0 bg-orange-500 text-white font-bold text-[9px] uppercase px-3 py-1 rounded-bl-xl tracking-wider">
                      Recomendado
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-base font-black text-gray-900">{plano.nome}</h4>
                      <p className="text-[11px] text-gray-400 mt-1">Acesso completo ao CRM corporativo.</p>
                    </div>

                    <div className="py-2">
                      {(empresa?.mensalidade_customizada !== null || Number(empresa?.desconto_mensal || 0) > 0) ? (
                        <div className="space-y-1">
                          <div className="flex items-baseline gap-1">
                            <span className="text-gray-400 line-through text-lg">{formatCurrency(plano.valor)}</span>
                            <span className="text-3xl font-black text-violet-600">
                              {formatCurrency(
                                Math.max(
                                  0,
                                  (empresa.mensalidade_customizada !== null ? Number(empresa.mensalidade_customizada) : Number(plano.valor)) -
                                  Number(empresa.desconto_mensal || 0)
                                )
                              )}
                            </span>
                            <span className="text-xs text-gray-400 font-bold">/mês</span>
                          </div>
                          {Number(empresa?.desconto_mensal || 0) > 0 && (
                            <div className="text-[10px] text-emerald-600 font-bold">
                              Campanha: {empresa.motivo_desconto || 'Desconto Promocional'} (-{formatCurrency(Number(empresa.desconto_mensal))})
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-black text-gray-900">{formatCurrency(plano.valor)}</span>
                          <span className="text-xs text-gray-400 font-bold">/mês</span>
                        </div>
                      )}
                    </div>

                    <ul className="space-y-2.5 text-xs text-gray-600">
                      <li className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                        Visitas Técnicas Ilimitadas
                      </li>
                      <li className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                        Gestão de Equipe e Técnicos
                      </li>
                      <li className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                        Integração API WhatsApp
                      </li>
                      <li className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                        Auditoria de Acessos IAM
                      </li>
                    </ul>
                  </div>

                  <div className="pt-6">
                    <button
                      onClick={() => handleCheckout(plano.id)}
                      disabled={actionLoading !== null}
                      className={`w-full py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        plano.nome.includes('Pro')
                          ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {actionLoading === plano.id ? (
                        <>
                          <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Processando...
                        </>
                      ) : (
                        'Contratar Plano'
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Invoices Data Table */}
        <div className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-sm space-y-5">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Histórico de Faturas</h3>
            <p className="text-xs text-gray-400 mt-1">Consulte os pagamentos registrados para esta empresa.</p>
          </div>

          {faturas.length === 0 ? (
            <div className="border border-dashed border-gray-200 rounded-2xl p-10 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto text-gray-400 border border-gray-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-xs text-gray-500 font-bold">Nenhuma fatura registrada.</p>
              <p className="text-[10px] text-gray-400">Assim que sua primeira assinatura ou renovação for processada, os recibos aparecerão aqui.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-gray-150">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-55/70 border-b border-gray-150 text-gray-500 font-bold uppercase tracking-wider">
                    <th className="px-5 py-3.5">Cód. Transação</th>
                    <th className="px-5 py-3.5">Vencimento / Data</th>
                    <th className="px-5 py-3.5">Valor</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {faturas.map((fatura) => (
                    <tr key={fatura.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4 font-mono font-bold text-gray-500 uppercase">
                        {fatura.mp_payment_id || `FAT-${fatura.id.substring(0, 8)}`}
                      </td>
                      <td className="px-5 py-4 text-gray-600 font-medium">
                        {formatDate(fatura.data_vencimento)}
                      </td>
                      <td className="px-5 py-4 text-gray-900 font-black">
                        {formatCurrency(fatura.valor)}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${
                          fatura.status === 'Paga' 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                            : fatura.status === 'Falhou' 
                            ? 'bg-rose-50 border-rose-200 text-rose-700' 
                            : 'bg-amber-50 border-amber-200 text-amber-700'
                        }`}>
                          {fatura.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <a
                          href={`/dashboard/mestre/configuracoes/assinatura/recibo/${fatura.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 hover:border-[#0a4ee4] text-gray-600 hover:text-[#0a4ee4] rounded-lg transition-colors font-bold text-[11px] shadow-sm bg-white"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Recibo
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
