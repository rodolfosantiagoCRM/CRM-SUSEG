-- ========================================== 
-- LIMPEZA DE TABELAS EXISTENTES (PARA PERMITIR RE-EXECUÇÃO) 
-- ========================================== 
drop table if exists public.empresa_membros cascade;
drop table if exists public.tipos_servico_materiais cascade;
drop table if exists public.materiais_predefinidos cascade;
drop table if exists public.tipos_servico cascade;
drop table if exists public.gdrive_config cascade;
drop table if exists public.faturas cascade;
drop table if exists public.planos_saas cascade;
drop table if exists public.saas_billing cascade;
drop table if exists public.empresas_config cascade;
drop table if exists public.empresas cascade;
drop table if exists public.whatsapp_config cascade;
drop table if exists public.responsaveis_tecnicos cascade;
drop table if exists public.perfis_usuarios cascade;
drop table if exists public.visits cascade;
drop table if exists public.projects cascade;
drop table if exists public.leads cascade;
drop table if exists public.profiles cascade;
drop table if exists public.permissoes_abas cascade;

-- ========================================== 
-- BASE SCHEMA (schema.sql) 
-- ========================================== 

-- OKKA Platform - Database Schema Migration
-- Execute this script in the SQL Editor of your Supabase project.

-- Habilitar extensão UUID
create extension if not exists "uuid-ossp";

-- =========================================================================
-- 1. TABELA PROFILES (Autenticação e Perfil de Usuário)
-- =========================================================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  role text not null check (role in ('admin', 'tecnico')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS
alter table public.profiles enable row level security;

-- Políticas de RLS
create policy "Qualquer usuário autenticado pode ver profiles"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Usuários podem editar seus próprios profiles"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- Trigger para criar perfil automaticamente no SignUp (registro do usuário)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'Usuário OKKA'),
    coalesce(new.raw_user_meta_data->>'role', 'tecnico')
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =========================================================================
-- 2. TABELA LEADS (Capturas da Landing Page / Contatos Iniciais)
-- =========================================================================
create table public.leads (
  id uuid default gen_random_uuid() primary key,
  nome text not null,
  email text,
  telefone text not null,
  cidade text not null,
  area_m2 numeric(10,2),
  status text default 'Novo' not null check (status in ('Novo', 'Em Contato', 'Qualificado', 'Perdido')),
  criado_em timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS
alter table public.leads enable row level security;

-- Políticas de RLS
create policy "Público pode criar leads pela Landing Page"
  on public.leads for insert
  to public
  with check (true);

create policy "Usuários autenticados podem ver leads"
  on public.leads for select
  to authenticated
  using (true);

create policy "Usuários autenticados podem atualizar leads"
  on public.leads for update
  to authenticated
  using (true)
  with check (true);

create policy "Usuários autenticados podem deletar leads"
  on public.leads for delete
  to authenticated
  using (true);

-- =========================================================================
-- 3. TABELA PROJECTS (Projetos do CRM)
-- =========================================================================
create table public.projects (
  id uuid default gen_random_uuid() primary key,
  lead_id uuid references public.leads(id) on delete set null,
  status_projeto text default 'Orçamento' not null check (status_projeto in ('Orçamento', 'Preparação', 'Instalação', 'Teste de Carga', 'Concluído')),
  endereco text not null,
  valor_total numeric(12,2) default 0.00 not null,
  criado_em timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS
alter table public.projects enable row level security;

-- Políticas de RLS
create policy "Usuários autenticados podem gerenciar projetos"
  on public.projects for all
  to authenticated
  using (true)
  with check (true);

-- =========================================================================
-- 4. TABELA VISITS (Visitas Técnicas / Relatórios de Campo)
-- =========================================================================
create table public.visits (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  data_visita date not null,
  horario time without time zone not null,
  status_visita text default 'Agendada' not null check (status_visita in ('Agendada', 'Realizada', 'Cancelada')),
  material_usado jsonb default '[]'::jsonb not null,
  valor_gasto numeric(12,2) default 0.00 not null,
  observacoes text,
  criado_em timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS
alter table public.visits enable row level security;

-- Políticas de RLS
create policy "Usuários autenticados podem gerenciar visitas"
  on public.visits for all
  to authenticated
  using (true)
  with check (true);


-- ========================================== 
-- INITIAL MIGRATION: create_responsaveis_tecnicos.sql 
-- ========================================== 

-- OKKA Platform - Migration: Cadastro de Responsáveis Técnicos
-- Execute este script no SQL Editor do seu projeto Supabase.

-- 1. Remover a restrição de chave estrangeira da tabela visits para permitir a recriação
alter table public.visits drop constraint if exists visits_tecnico_id_fkey;

-- 2. Recriar a tabela responsaveis_tecnicos vinculando id ao auth.users
drop table if exists public.responsaveis_tecnicos cascade;

create table public.responsaveis_tecnicos (
  id uuid references auth.users on delete cascade primary key,
  nome text not null,
  telefone text not null,
  email text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Restaurar a chave estrangeira em public.visits apontando para a nova tabela
alter table public.visits add column if not exists tecnico_id uuid;

alter table public.visits add constraint visits_tecnico_id_fkey 
foreign key (tecnico_id) references public.responsaveis_tecnicos(id) on delete set null;

-- 4. Habilitar RLS (Row Level Security)
alter table public.responsaveis_tecnicos enable row level security;

-- 5. Criar Políticas de RLS
create policy "Qualquer usuário autenticado pode ver responsaveis_tecnicos"
  on public.responsaveis_tecnicos for select
  to authenticated
  using (true);

create policy "Apenas administradores podem gerenciar responsaveis_tecnicos"
  on public.responsaveis_tecnicos for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );


-- ========================================== 
-- INITIAL MIGRATION: alter_visits_add_tecnico.sql 
-- ========================================== 

-- OKKA Platform - Migration: Atualização de Visitas Técnicas (Visits)
-- Execute este script no SQL Editor do seu projeto Supabase.

-- Adicionar chave estrangeira referenciando responsaveis_tecnicos
alter table public.visits 
add column if not exists tecnico_id uuid references public.responsaveis_tecnicos(id) on delete set null;

-- Nota: O campo 'horario' já está definido no schema original como:
-- horario time without time zone not null
-- Caso precise garantir que esteja no banco real com um padrão, execute:
-- alter table public.visits add column if not exists horario time without time zone not null default '09:00:00';


-- ========================================== 
-- INITIAL MIGRATION: enable_rls_visits.sql 
-- ========================================== 

-- OKKA Platform - Migration: RLS para Visitas Técnicas (visits)
-- Execute este script no SQL Editor do seu projeto Supabase.

-- 1. Habilitar RLS na tabela public.visits
alter table public.visits enable row level security;

-- 2. Política para Técnicos: Podem ver e atualizar apenas suas próprias visitas
create policy "Técnicos podem ver suas próprias visitas"
  on public.visits for select
  to authenticated
  using (tecnico_id = auth.uid());

create policy "Técnicos podem atualizar suas próprias visitas"
  on public.visits for update
  to authenticated
  using (tecnico_id = auth.uid())
  with check (tecnico_id = auth.uid());

-- 3. Política para Administradores (Conta Mestre): Permissão total (ALL)
create policy "Administradores têm permissão total em visits"
  on public.visits for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );


-- ========================================== 
-- INITIAL MIGRATION: create_perfis_usuarios.sql 
-- ========================================== 

-- OKKA Platform - Migration: Módulo de Gestão de Identidade e Acessos (IAM)
-- Execute este script no SQL Editor do seu projeto Supabase.

-- 1. Limpar triggers e funções antigas
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user() cascade;
drop table if exists public.profiles cascade;

-- 2. Criar a nova tabela pública perfis_usuarios
create table public.perfis_usuarios (
  id uuid references auth.users on delete cascade primary key,
  nome_completo text not null,
  email text not null unique,
  role text not null check (role in ('admin', 'instalador', 'tecnico', 'mestre', 'vendedor')),
  status_acesso boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Habilitar RLS em perfis_usuarios
alter table public.perfis_usuarios enable row level security;

-- 4. Criar políticas RLS para perfis_usuarios (usando metadados JWT para evitar recursão infinita)
create policy "Administradores podem gerenciar todos os perfis"
  on public.perfis_usuarios for all
  to authenticated
  using (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  )
  with check (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

create policy "Usuários podem ver seu próprio perfil"
  on public.perfis_usuarios for select
  to authenticated
  using (id = auth.uid());

-- 5. Trigger para criar perfil automaticamente no SignUp (registro do usuário)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.perfis_usuarios (id, nome_completo, email, role, status_acesso)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'Usuário OKKA'),
    coalesce(new.email, 'sem-email@okka.com'),
    coalesce(new.raw_user_meta_data->>'role', 'instalador'),
    coalesce((new.raw_user_meta_data->>'status_acesso')::boolean, true)
  );
  return new;
end;
$$ language plpgsql security definer;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. Atualizar as políticas da tabela responsaveis_tecnicos para usar perfis_usuarios
drop policy if exists "Apenas administradores podem gerenciar responsaveis_tecnicos" on public.responsaveis_tecnicos;

create policy "Apenas administradores podem gerenciar responsaveis_tecnicos"
  on public.responsaveis_tecnicos for all
  to authenticated
  using (
    exists (
      select 1 from public.perfis_usuarios
      where perfis_usuarios.id = auth.uid()
      and perfis_usuarios.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.perfis_usuarios
      where perfis_usuarios.id = auth.uid()
      and perfis_usuarios.role = 'admin'
    )
  );

-- 7. Atualizar as políticas da tabela visits para usar perfis_usuarios
drop policy if exists "Administradores têm permissão total em visits" on public.visits;

create policy "Administradores têm permissão total em visits"
  on public.visits for all
  to authenticated
  using (
    exists (
      select 1 from public.perfis_usuarios
      where perfis_usuarios.id = auth.uid()
      and perfis_usuarios.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.perfis_usuarios
      where perfis_usuarios.id = auth.uid()
      and perfis_usuarios.role = 'admin'
    )
  );


-- ========================================== 
-- INITIAL MIGRATION: add_whatsapp_integration.sql 
-- ========================================== 

-- OKKA Platform - Migration: Configuração de Integração com WhatsApp
-- Execute este script no SQL Editor do seu projeto Supabase.

-- 1. Criar a tabela de configuração (tabela singleton, garantindo apenas um registro)
create table if not exists public.whatsapp_config (
  id integer primary key check (id = 1) default 1,
  ativo boolean default false not null,
  api_provider text default 'evolution' not null check (api_provider in ('evolution', 'zapi', 'custom')),
  api_url text,
  api_key text,
  instancia text,
  antecedencia_minutos integer default 60 not null,
  mensagem_template text default 'Olá {nome_tecnico}, sua próxima visita técnica para o cliente {cliente_nome} no endereço {endereco_obra} será daqui a {antecedencia} (agendada para às {horario_visita}).' not null,
  headers_customizados text,
  payload_customizado text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Inserir a linha padrão se não existir
insert into public.whatsapp_config (id, ativo, api_provider, antecedencia_minutos)
values (1, false, 'evolution', 60)
on conflict (id) do nothing;

-- 3. Adicionar colunas de rastreamento na tabela de visitas (visits)
alter table public.visits add column if not exists whatsapp_enviado boolean default false not null;
alter table public.visits add column if not exists whatsapp_log text;

-- 4. Habilitar RLS na tabela de configurações
alter table public.whatsapp_config enable row level security;

-- 5. Criar Políticas de RLS para whatsapp_config
drop policy if exists "Qualquer usuário autenticado pode ver whatsapp_config" on public.whatsapp_config;
create policy "Qualquer usuário autenticado pode ver whatsapp_config"
  on public.whatsapp_config for select
  to authenticated
  using (true);

drop policy if exists "Apenas administradores podem gerenciar whatsapp_config" on public.whatsapp_config;
create policy "Apenas administradores podem gerenciar whatsapp_config"
  on public.whatsapp_config for all
  to authenticated
  using (
    exists (
      select 1 from public.perfis_usuarios
      where perfis_usuarios.id = auth.uid()
      and perfis_usuarios.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.perfis_usuarios
      where perfis_usuarios.id = auth.uid()
      and perfis_usuarios.role = 'admin'
    )
  );


-- ========================================== 
-- INITIAL MIGRATION: fix_visits_delete_policy.sql 
-- ========================================== 

-- OKKA Platform - Migration: Corrigir políticas de DELETE em visits (versão corrigida)
-- Execute este script no SQL Editor do seu projeto Supabase.

-- 1. Remover TODAS as políticas existentes na tabela visits (nomes exatos)
drop policy if exists "Usuários autenticados podem gerenciar visitas" on public.visits;
drop policy if exists "Administradores têm permissão total em visits" on public.visits;
drop policy if exists "Admins e Mestres têm permissão total em visits" on public.visits;
drop policy if exists "Técnicos podem ver suas próprias visitas" on public.visits;
drop policy if exists "Técnicos podem atualizar suas próprias visitas" on public.visits;
drop policy if exists "Tecnicos e Instaladores podem ver suas visitas" on public.visits;
drop policy if exists "Tecnicos podem atualizar suas visitas" on public.visits;

-- 2. Admins e Mestres: permissão TOTAL (select, insert, update, delete)
create policy "Admins e Mestres têm permissão total em visits"
  on public.visits for all
  to authenticated
  using (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'mestre')
    OR
    exists (
      select 1 from public.perfis_usuarios
      where perfis_usuarios.id = auth.uid()
      and perfis_usuarios.role IN ('admin', 'mestre')
    )
  )
  with check (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'mestre')
    OR
    exists (
      select 1 from public.perfis_usuarios
      where perfis_usuarios.id = auth.uid()
      and perfis_usuarios.role IN ('admin', 'mestre')
    )
  );

-- 3. Técnicos e Instaladores: ver apenas as suas próprias visitas
create policy "Tecnicos e Instaladores podem ver suas visitas"
  on public.visits for select
  to authenticated
  using (
    tecnico_id = auth.uid()
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'mestre')
    OR exists (
      select 1 from public.perfis_usuarios
      where perfis_usuarios.id = auth.uid()
      and perfis_usuarios.role IN ('admin', 'mestre')
    )
  );

-- 4. Técnicos: atualizar suas próprias visitas
create policy "Tecnicos podem atualizar suas visitas"
  on public.visits for update
  to authenticated
  using (tecnico_id = auth.uid())
  with check (tecnico_id = auth.uid());


-- ========================================== 
-- CRONOLOGICAL MIGRATION: 20260620_add_crm_fields_to_leads.sql 
-- ========================================== 

-- Migration: Adicionar campos completos de CRM na tabela Leads
-- Execute este script no Editor SQL do seu projeto Supabase para habilitar o cadastro completo.

alter table public.leads
add column if not exists endereco_obra text,
add column if not exists valor_estimado numeric(12,2) default 0.00,
add column if not exists materiais_previstos jsonb default '[]'::jsonb,
add column if not exists observacoes text;


-- ========================================== 
-- CRONOLOGICAL MIGRATION: 20260620_create_materiais_predefinidos.sql 
-- ========================================== 

-- OKKA Platform - Migration: Tabela de Materiais Pré-definidos
-- Execute este script no SQL Editor do seu projeto Supabase.

CREATE TABLE IF NOT EXISTS public.materiais_predefinidos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text UNIQUE NOT NULL,
  criado_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.materiais_predefinidos ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
DROP POLICY IF EXISTS "Qualquer autenticado pode ver materiais" ON public.materiais_predefinidos;
CREATE POLICY "Qualquer autenticado pode ver materiais"
  ON public.materiais_predefinidos FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Qualquer autenticado pode gerenciar materiais" ON public.materiais_predefinidos;
CREATE POLICY "Qualquer autenticado pode gerenciar materiais"
  ON public.materiais_predefinidos FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Seed de materiais padrão para preencher a tabela no início
INSERT INTO public.materiais_predefinidos (nome) VALUES
  ('Cabo Calefator 15W/m'),
  ('Cabo Calefator 20W/m'),
  ('Termostato Wifi Black'),
  ('Termostato Wifi White'),
  ('Termostato Digital Programável'),
  ('Isolamento Térmico (Refletivo)'),
  ('Sensor de Piso NTC'),
  ('Malha Metálica de Fixação'),
  ('Fita de Fixação Adesiva')
ON CONFLICT (nome) DO NOTHING;


-- ========================================== 
-- CRONOLOGICAL MIGRATION: 20260620_create_permissoes_abas.sql 
-- ========================================== 

-- OKKA Platform - Migration: Controle de Acesso Dinâmico por Abas
-- Execute este script no SQL Editor do seu projeto Supabase.

-- 1. Criar a tabela de permissões de abas
CREATE TABLE IF NOT EXISTS public.permissoes_abas (
  role text PRIMARY KEY CHECK (role IN ('admin', 'instalador', 'tecnico', 'mestre', 'vendedor')),
  dashboard boolean DEFAULT true NOT NULL,
  leads boolean DEFAULT true NOT NULL,
  visitas boolean DEFAULT true NOT NULL,
  projetos boolean DEFAULT true NOT NULL,
  equipe boolean DEFAULT true NOT NULL,
  eficiencia boolean DEFAULT true NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilitar RLS (Row Level Security)
ALTER TABLE public.permissoes_abas ENABLE ROW LEVEL SECURITY;

-- 3. Criar Políticas RLS
DROP POLICY IF EXISTS "Qualquer autenticado pode ler abas" ON public.permissoes_abas;
CREATE POLICY "Qualquer autenticado pode ler abas"
  ON public.permissoes_abas FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Apenas gestores alteram abas" ON public.permissoes_abas;
CREATE POLICY "Apenas gestores alteram abas"
  ON public.permissoes_abas FOR ALL
  TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' OR 
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'mestre'
  )
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' OR 
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'mestre'
  );

INSERT INTO public.permissoes_abas (role, dashboard, leads, visitas, projetos, equipe, eficiencia) VALUES
  ('admin', true, true, true, true, true, true),
  ('mestre', true, true, true, true, true, true),
  ('vendedor', true, true, true, true, false, false),
  ('tecnico', false, false, true, false, false, false),
  ('instalador', false, false, true, false, false, false)
ON CONFLICT (role) DO UPDATE SET
  dashboard = EXCLUDED.dashboard,
  leads = EXCLUDED.leads,
  visitas = EXCLUDED.visitas,
  projetos = EXCLUDED.projetos,
  equipe = EXCLUDED.equipe,
  eficiencia = EXCLUDED.eficiencia,
  updated_at = timezone('utc'::text, now());


-- ========================================== 
-- CRONOLOGICAL MIGRATION: 20260620_multi_tenant_saas.sql 
-- ========================================== 

-- OKKA Platform - Migration: SaaS Multi-Tenant & RLS Isolation
-- Execute este script no SQL Editor do seu projeto Supabase.

-- =========================================================================
-- 1. CRIAR ENUM E TABELA DE EMPRESAS
-- =========================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_assinatura_enum') THEN
    CREATE TYPE public.status_assinatura_enum AS ENUM ('ativa', 'inadimplente', 'cancelada');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS public.empresas (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_fantasia text NOT NULL,
  cnpj text UNIQUE NOT NULL,
  status_assinatura public.status_assinatura_enum DEFAULT 'ativa'::public.status_assinatura_enum NOT NULL,
  assinatura_mp_id text,
  criado_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Inserir empresa padrão para vincular registros existentes (prevenir quebras de integridade)
INSERT INTO public.empresas (id, nome_fantasia, cnpj, status_assinatura)
VALUES ('00000000-0000-0000-0000-000000000000', 'Empresa Padrão', '00000000000000', 'ativa')
ON CONFLICT (id) DO NOTHING;

-- =========================================================================
-- 2. ALTERAR TABELA DE PERFIS DE USUÁRIOS (perfis_usuarios)
-- =========================================================================
-- Liberar restrição de role antiga
ALTER TABLE public.perfis_usuarios DROP CONSTRAINT IF EXISTS perfis_usuarios_role_check;

-- Adicionar nova restrição incluindo o role 'super_admin'
ALTER TABLE public.perfis_usuarios ADD CONSTRAINT perfis_usuarios_role_check 
  CHECK (role IN ('admin', 'instalador', 'tecnico', 'mestre', 'vendedor', 'super_admin'));

-- Adicionar coluna empresa_id
ALTER TABLE public.perfis_usuarios ADD COLUMN IF NOT EXISTS empresa_id uuid REFERENCES public.empresas(id) ON DELETE SET NULL;

-- Vincular perfis antigos à Empresa Padrão
UPDATE public.perfis_usuarios SET empresa_id = '00000000-0000-0000-0000-000000000000' WHERE empresa_id IS NULL;

-- =========================================================================
-- 3. ADICIONAR COLUNA empresa_id NAS TABELAS OPERACIONAIS
-- =========================================================================

-- Tabela LEADS
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS empresa_id uuid REFERENCES public.empresas(id) ON DELETE CASCADE;
UPDATE public.leads SET empresa_id = '00000000-0000-0000-0000-000000000000' WHERE empresa_id IS NULL;

-- Tabela PROJECTS
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS empresa_id uuid REFERENCES public.empresas(id) ON DELETE CASCADE;
UPDATE public.projects SET empresa_id = '00000000-0000-0000-0000-000000000000' WHERE empresa_id IS NULL;

-- Tabela VISITS
ALTER TABLE public.visits ADD COLUMN IF NOT EXISTS empresa_id uuid REFERENCES public.empresas(id) ON DELETE CASCADE;
UPDATE public.visits SET empresa_id = '00000000-0000-0000-0000-000000000000' WHERE empresa_id IS NULL;

-- Tabela RESPONSAVEIS_TECNICOS
ALTER TABLE public.responsaveis_tecnicos ADD COLUMN IF NOT EXISTS empresa_id uuid REFERENCES public.empresas(id) ON DELETE CASCADE;
UPDATE public.responsaveis_tecnicos SET empresa_id = '00000000-0000-0000-0000-000000000000' WHERE empresa_id IS NULL;

-- Tabela WHATSAPP_CONFIG
ALTER TABLE public.whatsapp_config DROP CONSTRAINT IF EXISTS whatsapp_config_id_check;
ALTER TABLE public.whatsapp_config ADD COLUMN IF NOT EXISTS empresa_id uuid REFERENCES public.empresas(id) ON DELETE CASCADE;
ALTER TABLE public.whatsapp_config DROP CONSTRAINT IF EXISTS whatsapp_config_empresa_id_unique;
ALTER TABLE public.whatsapp_config ADD CONSTRAINT whatsapp_config_empresa_id_unique UNIQUE(empresa_id);
UPDATE public.whatsapp_config SET empresa_id = '00000000-0000-0000-0000-000000000000' WHERE empresa_id IS NULL;

-- Tabela MATERIAIS_PREDEFINIDOS
ALTER TABLE public.materiais_predefinidos ADD COLUMN IF NOT EXISTS empresa_id uuid REFERENCES public.empresas(id) ON DELETE CASCADE;
UPDATE public.materiais_predefinidos SET empresa_id = '00000000-0000-0000-0000-000000000000' WHERE empresa_id IS NULL;
-- Permitir nomes de materiais duplicados desde que sejam de empresas diferentes
ALTER TABLE public.materiais_predefinidos DROP CONSTRAINT IF EXISTS materiais_predefinidos_nome_key;
ALTER TABLE public.materiais_predefinidos DROP CONSTRAINT IF EXISTS materiais_predefinidos_empresa_id_nome_key;
ALTER TABLE public.materiais_predefinidos ADD CONSTRAINT materiais_predefinidos_empresa_id_nome_key UNIQUE(empresa_id, nome);

-- =========================================================================
-- 4. CRIAR HELPER FUNCTIONS DE SEGURANÇA (SECURITY DEFINER)
-- =========================================================================
CREATE OR REPLACE FUNCTION public.get_my_empresa_id()
RETURNS uuid AS $$
  SELECT empresa_id FROM public.perfis_usuarios WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean AS $$
  SELECT COALESCE((SELECT role = 'super_admin' FROM public.perfis_usuarios WHERE id = auth.uid()), false);
$$ LANGUAGE sql SECURITY DEFINER;

-- =========================================================================
-- 5. ATUALIZAR TRIGGER DE CRIAÇÃO AUTOMÁTICA DE USUÁRIO (handle_new_user)
-- =========================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.perfis_usuarios (id, nome_completo, email, role, status_acesso, empresa_id)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'Usuário OKKA'),
    coalesce(new.email, 'sem-email@okka.com'),
    coalesce(new.raw_user_meta_data->>'role', 'instalador'),
    coalesce((new.raw_user_meta_data->>'status_acesso')::boolean, true),
    (new.raw_user_meta_data->>'empresa_id')::uuid
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================================================
-- 6. POLÍTICAS DE RLS DE MULTI-TENANCY E BYPASS DE SUPER ADMIN
-- =========================================================================

-- Empresas
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Super admin can do all on empresas" ON public.empresas;
DROP POLICY IF EXISTS "Users can view their own empresa" ON public.empresas;

CREATE POLICY "Super admin can do all on empresas" ON public.empresas
  FOR ALL TO authenticated USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

CREATE POLICY "Users can view their own empresa" ON public.empresas
  FOR SELECT TO authenticated USING (id = public.get_my_empresa_id());

-- Perfis Usuários
ALTER TABLE public.perfis_usuarios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Perfis usuarios multi-tenant policy" ON public.perfis_usuarios;
DROP POLICY IF EXISTS "Administradores podem gerenciar todos os perfis" ON public.perfis_usuarios;
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON public.perfis_usuarios;

CREATE POLICY "Perfis usuarios multi-tenant policy" ON public.perfis_usuarios
  FOR ALL TO authenticated
  USING (public.is_super_admin() OR empresa_id = public.get_my_empresa_id() OR id = auth.uid())
  WITH CHECK (public.is_super_admin() OR empresa_id = public.get_my_empresa_id() OR id = auth.uid());

-- Leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Leads multi-tenant policy" ON public.leads;
DROP POLICY IF EXISTS "Usuários autenticados podem ver leads" ON public.leads;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar leads" ON public.leads;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar leads" ON public.leads;
DROP POLICY IF EXISTS "Público pode criar leads pela Landing Page" ON public.leads;

CREATE POLICY "Público pode criar leads pela Landing Page" ON public.leads
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Leads multi-tenant policy" ON public.leads
  FOR ALL TO authenticated
  USING (public.is_super_admin() OR empresa_id = public.get_my_empresa_id())
  WITH CHECK (public.is_super_admin() OR empresa_id = public.get_my_empresa_id());

-- Projetos (Projects)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Projects multi-tenant policy" ON public.projects;
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar projetos" ON public.projects;

CREATE POLICY "Projects multi-tenant policy" ON public.projects
  FOR ALL TO authenticated
  USING (public.is_super_admin() OR empresa_id = public.get_my_empresa_id())
  WITH CHECK (public.is_super_admin() OR empresa_id = public.get_my_empresa_id());

-- Visitas (Visits)
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Visits multi-tenant policy" ON public.visits;
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar visitas" ON public.visits;
DROP POLICY IF EXISTS "Administradores têm permissão total em visits" ON public.visits;

CREATE POLICY "Visits multi-tenant policy" ON public.visits
  FOR ALL TO authenticated
  USING (public.is_super_admin() OR empresa_id = public.get_my_empresa_id())
  WITH CHECK (public.is_super_admin() OR empresa_id = public.get_my_empresa_id());

-- Responsáveis Técnicos
ALTER TABLE public.responsaveis_tecnicos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Responsaveis tecnicos multi-tenant policy" ON public.responsaveis_tecnicos;
DROP POLICY IF EXISTS "Apenas administradores podem gerenciar responsaveis_tecnicos" ON public.responsaveis_tecnicos;

CREATE POLICY "Responsaveis tecnicos multi-tenant policy" ON public.responsaveis_tecnicos
  FOR ALL TO authenticated
  USING (public.is_super_admin() OR empresa_id = public.get_my_empresa_id())
  WITH CHECK (public.is_super_admin() OR empresa_id = public.get_my_empresa_id());

-- Configuração WhatsApp (whatsapp_config)
ALTER TABLE public.whatsapp_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Whatsapp config multi-tenant policy" ON public.whatsapp_config;
DROP POLICY IF EXISTS "Qualquer usuário autenticado pode ver whatsapp_config" ON public.whatsapp_config;
DROP POLICY IF EXISTS "Apenas administradores podem gerenciar whatsapp_config" ON public.whatsapp_config;

CREATE POLICY "Whatsapp config multi-tenant policy" ON public.whatsapp_config
  FOR ALL TO authenticated
  USING (public.is_super_admin() OR empresa_id = public.get_my_empresa_id())
  WITH CHECK (public.is_super_admin() OR empresa_id = public.get_my_empresa_id());

-- Materiais Pré-definidos (materiais_predefinidos)
ALTER TABLE public.materiais_predefinidos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Materiais predefinidos multi-tenant policy" ON public.materiais_predefinidos;
DROP POLICY IF EXISTS "Qualquer autenticado pode ver materiais" ON public.materiais_predefinidos;
DROP POLICY IF EXISTS "Qualquer autenticado pode gerenciar materiais" ON public.materiais_predefinidos;

CREATE POLICY "Materiais predefinidos multi-tenant policy" ON public.materiais_predefinidos
  FOR ALL TO authenticated
  USING (public.is_super_admin() OR empresa_id = public.get_my_empresa_id())
  WITH CHECK (public.is_super_admin() OR empresa_id = public.get_my_empresa_id());


-- ========================================== 
-- CRONOLOGICAL MIGRATION: 20260620_update_role_constraint.sql 
-- ========================================== 

-- OKKA Platform - Migration: Atualização de Restrição de Função (Role) para IAM
-- Execute este script no SQL Editor do seu projeto Supabase para permitir novos níveis de acesso.

-- 1. Remover a restrição de role antiga da tabela perfis_usuarios
ALTER TABLE public.perfis_usuarios DROP CONSTRAINT IF EXISTS perfis_usuarios_role_check;

-- 2. Adicionar a nova restrição permitindo mestre e vendedor
ALTER TABLE public.perfis_usuarios ADD CONSTRAINT perfis_usuarios_role_check 
  CHECK (role IN ('admin', 'instalador', 'tecnico', 'mestre', 'vendedor'));


-- ========================================== 
-- CRONOLOGICAL MIGRATION: 20260621_leads_cep.sql 
-- ========================================== 

-- OKKA Platform - Migration: Leads ZIP/CEP Column
-- Execute este script no SQL Editor do seu projeto Supabase para adicionar suporte ao campo CEP nos Leads.

ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS cep text DEFAULT NULL;


-- ========================================== 
-- CRONOLOGICAL MIGRATION: 20260621_saas_billing.sql 
-- ========================================== 

-- OKKA Platform - Migration: SaaS Billing (Planos & Faturas)
-- Execute este script no SQL Editor do seu projeto Supabase.

-- =========================================================================
-- 1. CRIAR TABELA DE PLANOS SAAS
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.planos_saas (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  valor numeric(12,2) NOT NULL,
  mp_plan_id text NOT NULL,
  criado_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =========================================================================
-- 2. CRIAR TABELA DE FATURAS
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.faturas (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id uuid REFERENCES public.empresas(id) ON DELETE CASCADE NOT NULL,
  valor numeric(12,2) NOT NULL,
  data_vencimento timestamp with time zone NOT NULL,
  status text NOT NULL CHECK (status IN ('Pendente', 'Paga', 'Falhou')),
  mp_payment_id text,
  criado_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =========================================================================
-- 3. HABILITAR E CONFIGURAR ROW LEVEL SECURITY (RLS)
-- =========================================================================

-- Planos SaaS RLS
ALTER TABLE public.planos_saas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Qualquer usuario autenticado pode ver planos" ON public.planos_saas;
CREATE POLICY "Qualquer usuario autenticado pode ver planos" ON public.planos_saas
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Apenas super admin pode gerenciar planos" ON public.planos_saas;
CREATE POLICY "Apenas super admin pode gerenciar planos" ON public.planos_saas
  FOR ALL TO authenticated USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

-- Faturas RLS
ALTER TABLE public.faturas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios podem ver faturas de sua propria empresa" ON public.faturas;
CREATE POLICY "Usuarios podem ver faturas de sua propria empresa" ON public.faturas
  FOR SELECT TO authenticated 
  USING (public.is_super_admin() OR empresa_id = public.get_my_empresa_id());

-- Observação: INSERT e UPDATE para faturas não possuem política pública ativa,
-- logo, só podem ocorrer via service_role_key no backend ou webhooks.

-- =========================================================================
-- 4. INSERIR PLANO SAAS PADRÃO (PRO MENSAL)
-- =========================================================================
INSERT INTO public.planos_saas (id, nome, valor, mp_plan_id)
VALUES (
  'd3b07384-d113-49d5-a50d-bf4cf166a012', 
  'Pro Mensal', 
  99.90, 
  '2c93808486987c2b01869cbbf9020478' -- ID de exemplo de plano recorrente no MP
)
ON CONFLICT (id) DO NOTHING;


-- ========================================== 
-- CRONOLOGICAL MIGRATION: 20260621_superadmin_custom_billing.sql 
-- ========================================== 

-- OKKA Platform - Migration: Super Admin Custom Billing
-- Execute este script no SQL Editor do seu projeto Supabase para adicionar suporte a faturamento customizado.

ALTER TABLE public.empresas ADD COLUMN IF NOT EXISTS mensalidade_customizada numeric(12,2) DEFAULT NULL;
ALTER TABLE public.empresas ADD COLUMN IF NOT EXISTS desconto_mensal numeric(12,2) DEFAULT 0.00;
ALTER TABLE public.empresas ADD COLUMN IF NOT EXISTS motivo_desconto text DEFAULT NULL;


-- ========================================== 
-- CRONOLOGICAL MIGRATION: 20260621_superadmin_view_passwords.sql 
-- ========================================== 

-- OKKA Platform - Migration: Super Admin View Passwords
-- Execute este script no SQL Editor do seu projeto Supabase para adicionar suporte à visualização de senhas pelo Super Admin.

ALTER TABLE public.perfis_usuarios ADD COLUMN IF NOT EXISTS senha_temp text DEFAULT 'OkkaMestre2026!';


-- ========================================== 
-- CRONOLOGICAL MIGRATION: 20260622_add_agendado_por_to_visits.sql 
-- ========================================== 

-- OKKA Platform - Migration: Adicionar coluna 'agendado_por' para registrar quem marcou a visita
-- Execute este script no SQL Editor do seu projeto Supabase.

alter table public.visits 
add column if not exists agendado_por text;


-- ========================================== 
-- CRONOLOGICAL MIGRATION: 20260622_add_pdf_proposta_to_visits.sql 
-- ========================================== 

-- Migração: Adicionar anexo de PDF de Proposta para Visitas Técnicas

-- 1. Adicionar coluna na tabela visits (utilizada na base de dados atual)
ALTER TABLE public.visits 
ADD COLUMN IF NOT EXISTS pdf_proposta_url TEXT NULL;

-- 2. Adicionar coluna na tabela visitas_tecnicas (conforme especificação solicitada)
-- Se a tabela existir no seu ambiente de produção:
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'visitas_tecnicas') THEN
        ALTER TABLE public.visitas_tecnicas ADD COLUMN IF NOT EXISTS pdf_proposta_url TEXT NULL;
    END IF;
END $$;

-- 3. Criar bucket 'documentos_crm' no Supabase Storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('documentos_crm', 'documentos_crm', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Definir políticas de RLS no storage.objects para o bucket 'documentos_crm'
DROP POLICY IF EXISTS "Permitir leitura de documentos por autenticados" ON storage.objects;
-- Permitir leitura de arquivos por usuários autenticados
CREATE POLICY "Permitir leitura de documentos por autenticados"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documentos_crm');

DROP POLICY IF EXISTS "Permitir upload de documentos por autenticados" ON storage.objects;
-- Permitir inserção (upload) de arquivos por usuários autenticados
CREATE POLICY "Permitir upload de documentos por autenticados"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documentos_crm');

DROP POLICY IF EXISTS "Permitir exclusão de documentos por autenticados" ON storage.objects;
-- Permitir exclusão de arquivos por usuários autenticados (opcional, para limpeza futura)
CREATE POLICY "Permitir exclusão de documentos por autenticados"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documentos_crm');


-- ========================================== 
-- CRONOLOGICAL MIGRATION: 20260622_add_tipo_servico_and_numero_to_leads.sql 
-- ========================================== 

-- Migration: Adicionar campos de número de endereço e tipo de serviço aos leads
-- Execute este script no Editor SQL do seu projeto Supabase.

ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS numero text DEFAULT NULL;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS tipo_servico text DEFAULT NULL;


-- ========================================== 
-- CRONOLOGICAL MIGRATION: 20260622_cascade_delete_leads_projects.sql 
-- ========================================== 

-- Migration: Configurar exclusão em cascata (ON DELETE CASCADE) para projetos e visitas ao excluir leads
-- Execute este script no SQL Editor do Supabase para atualizar a estrutura de tabelas.

-- 1. Remover projetos que ficaram órfãos (sem lead associado) devido à regra antiga "set null"
DELETE FROM public.projects WHERE lead_id IS NULL;

-- 2. Alterar a chave estrangeira da tabela 'projects' para deletar em cascata
ALTER TABLE public.projects 
  DROP CONSTRAINT IF EXISTS projects_lead_id_fkey;

ALTER TABLE public.projects 
  ADD CONSTRAINT projects_lead_id_fkey 
  FOREIGN KEY (lead_id) 
  REFERENCES public.leads(id) 
  ON DELETE CASCADE;


-- ========================================== 
-- CRONOLOGICAL MIGRATION: 20260622_gdrive_config.sql 
-- ========================================== 

-- Migration: Create gdrive_config table for multi-tenant backups
-- Execute este script no SQL Editor do seu projeto Supabase se necessário.

CREATE TABLE IF NOT EXISTS public.gdrive_config (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id uuid REFERENCES public.empresas(id) ON DELETE CASCADE UNIQUE,
  folder_id text NOT NULL,
  service_account_json text NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.gdrive_config ENABLE ROW LEVEL SECURITY;

-- Remover políticas se existirem
DROP POLICY IF EXISTS "Users can select their own company's gdrive config" ON public.gdrive_config;
DROP POLICY IF EXISTS "Users can manage their own company's gdrive config" ON public.gdrive_config;

-- Política para leitura
CREATE POLICY "Users can select their own company's gdrive config" ON public.gdrive_config
  FOR SELECT TO authenticated USING (empresa_id = public.get_my_empresa_id() OR public.is_super_admin());

-- Política para inserção/edição/deleção
CREATE POLICY "Users can manage their own company's gdrive config" ON public.gdrive_config
  FOR ALL TO authenticated USING (empresa_id = public.get_my_empresa_id() OR public.is_super_admin())
  WITH CHECK (empresa_id = public.get_my_empresa_id() OR public.is_super_admin());


-- ========================================== 
-- CRONOLOGICAL MIGRATION: 20260622_multi_tenant_empresa_id_triggers.sql 
-- ========================================== 

-- OKKA Platform - Migration: Multi-Tenant empresa_id Triggers and Cleanup
-- This script sets up triggers to automatically set the empresa_id for rows if not provided,
-- using the authenticated user's profile company ID or falling back to the default company ID.

-- 1. Create or replace the trigger function
CREATE OR REPLACE FUNCTION public.set_empresa_id_on_insert_or_update()
RETURNS trigger AS $$
BEGIN
  IF NEW.empresa_id IS NULL THEN
    NEW.empresa_id := COALESCE(
      public.get_my_empresa_id(),
      '00000000-0000-0000-0000-000000000000'::uuid
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Bind triggers to operational tables
-- Projects
DROP TRIGGER IF EXISTS tr_set_projects_empresa_id ON public.projects;
CREATE TRIGGER tr_set_projects_empresa_id
  BEFORE INSERT OR UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.set_empresa_id_on_insert_or_update();

-- Leads
DROP TRIGGER IF EXISTS tr_set_leads_empresa_id ON public.leads;
CREATE TRIGGER tr_set_leads_empresa_id
  BEFORE INSERT OR UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.set_empresa_id_on_insert_or_update();

-- Visits
DROP TRIGGER IF EXISTS tr_set_visits_empresa_id ON public.visits;
CREATE TRIGGER tr_set_visits_empresa_id
  BEFORE INSERT OR UPDATE ON public.visits
  FOR EACH ROW
  EXECUTE FUNCTION public.set_empresa_id_on_insert_or_update();

-- Responsáveis Técnicos
DROP TRIGGER IF EXISTS tr_set_responsaveis_tecnicos_empresa_id ON public.responsaveis_tecnicos;
CREATE TRIGGER tr_set_responsaveis_tecnicos_empresa_id
  BEFORE INSERT OR UPDATE ON public.responsaveis_tecnicos
  FOR EACH ROW
  EXECUTE FUNCTION public.set_empresa_id_on_insert_or_update();

-- WhatsApp Config
DROP TRIGGER IF EXISTS tr_set_whatsapp_config_empresa_id ON public.whatsapp_config;
CREATE TRIGGER tr_set_whatsapp_config_empresa_id
  BEFORE INSERT OR UPDATE ON public.whatsapp_config
  FOR EACH ROW
  EXECUTE FUNCTION public.set_empresa_id_on_insert_or_update();

-- Materiais Pré-definidos
DROP TRIGGER IF EXISTS tr_set_materiais_predefinidos_empresa_id ON public.materiais_predefinidos;
CREATE TRIGGER tr_set_materiais_predefinidos_empresa_id
  BEFORE INSERT OR UPDATE ON public.materiais_predefinidos
  FOR EACH ROW
  EXECUTE FUNCTION public.set_empresa_id_on_insert_or_update();

-- 3. Cleanup existing records that have NULL company IDs to restore visibility and integrity
UPDATE public.leads SET empresa_id = '00000000-0000-0000-0000-000000000000' WHERE empresa_id IS NULL;
UPDATE public.projects SET empresa_id = '00000000-0000-0000-0000-000000000000' WHERE empresa_id IS NULL;
UPDATE public.visits SET empresa_id = '00000000-0000-0000-0000-000000000000' WHERE empresa_id IS NULL;
UPDATE public.responsaveis_tecnicos SET empresa_id = '00000000-0000-0000-0000-000000000000' WHERE empresa_id IS NULL;
UPDATE public.whatsapp_config SET empresa_id = '00000000-0000-0000-0000-000000000000' WHERE empresa_id IS NULL;
UPDATE public.materiais_predefinidos SET empresa_id = '00000000-0000-0000-0000-000000000000' WHERE empresa_id IS NULL;


-- ========================================== 
-- CRONOLOGICAL MIGRATION: 20260623_create_tipos_servico_and_link_materials.sql 
-- ========================================== 

-- Migration: Criar tabela de tipos de serviço e atualizar tabela de materiais

-- 1. Criar tabela de tipos de serviço
CREATE TABLE IF NOT EXISTS public.tipos_servico (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text UNIQUE NOT NULL,
  empresa_id uuid REFERENCES public.empresas(id) ON DELETE CASCADE,
  criado_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS na tipos_servico
ALTER TABLE public.tipos_servico ENABLE ROW LEVEL SECURITY;

-- Política de RLS para tipos_servico
DROP POLICY IF EXISTS "Tipos servico multi-tenant policy" ON public.tipos_servico;
CREATE POLICY "Tipos servico multi-tenant policy" ON public.tipos_servico
  FOR ALL TO authenticated
  USING (public.is_super_admin() OR empresa_id = public.get_my_empresa_id() OR empresa_id = '00000000-0000-0000-0000-000000000000')
  WITH CHECK (public.is_super_admin() OR empresa_id = public.get_my_empresa_id());

-- Função e Trigger para preencher automatico o empresa_id do tipo_servico
CREATE OR REPLACE FUNCTION public.set_tipos_servico_empresa_id()
RETURNS trigger AS $$
BEGIN
  IF NEW.empresa_id IS NULL THEN
    NEW.empresa_id := public.get_my_empresa_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_set_tipos_servico_empresa_id ON public.tipos_servico;
CREATE TRIGGER tr_set_tipos_servico_empresa_id
  BEFORE INSERT OR UPDATE ON public.tipos_servico
  FOR EACH ROW EXECUTE FUNCTION public.set_tipos_servico_empresa_id();

-- Seed inicial de tipos de serviço vinculados à Empresa Padrão
INSERT INTO public.tipos_servico (nome, empresa_id) VALUES
  ('Aquecimento de piso', '00000000-0000-0000-0000-000000000000'),
  ('Instalação Sistemas Solares', '00000000-0000-0000-0000-000000000000'),
  ('Limpeza de placas Solares', '00000000-0000-0000-0000-000000000000'),
  ('Carregamento Veicular', '00000000-0000-0000-0000-000000000000')
ON CONFLICT (nome) DO NOTHING;

-- 2. Atualizar materiais_predefinidos para vincular a tipo_servico
ALTER TABLE public.materiais_predefinidos ADD COLUMN IF NOT EXISTS tipo_servico text;

-- Atualizar materiais existentes que estão sem tipo de serviço para pertencerem a 'Aquecimento de piso' por padrão
UPDATE public.materiais_predefinidos SET tipo_servico = 'Aquecimento de piso' WHERE tipo_servico IS NULL;

-- Dropar restrições antigas de unicidade e criar restrição composta que inclui tipo_servico
ALTER TABLE public.materiais_predefinidos DROP CONSTRAINT IF EXISTS materiais_predefinidos_nome_key;
ALTER TABLE public.materiais_predefinidos DROP CONSTRAINT IF EXISTS materiais_predefinidos_empresa_id_nome_key;
ALTER TABLE public.materiais_predefinidos ADD CONSTRAINT materiais_predefinidos_empresa_id_nome_tipo_servico_key UNIQUE(empresa_id, nome, tipo_servico);

-- Seed de materiais adicionais para os novos tipos de serviço vinculados à Empresa Padrão
INSERT INTO public.materiais_predefinidos (nome, tipo_servico, empresa_id) VALUES
  ('Painel Solar 550W', 'Instalação Sistemas Solares', '00000000-0000-0000-0000-000000000000'),
  ('Inversor Monofásico 5kW', 'Instalação Sistemas Solares', '00000000-0000-0000-0000-000000000000'),
  ('Estrutura de Fixação Telhado', 'Instalação Sistemas Solares', '00000000-0000-0000-0000-000000000000'),
  ('Cabo Solar 6mm Preto', 'Instalação Sistemas Solares', '00000000-0000-0000-0000-000000000000'),
  ('Cabo Solar 6mm Vermelho', 'Instalação Sistemas Solares', '00000000-0000-0000-0000-000000000000'),
  ('Conector MC4', 'Instalação Sistemas Solares', '00000000-0000-0000-0000-000000000000'),
  
  ('Escova de Limpeza Extensível', 'Limpeza de placas Solares', '00000000-0000-0000-0000-000000000000'),
  ('Detergente Neutro Solar', 'Limpeza de placas Solares', '00000000-0000-0000-0000-000000000000'),
  ('Rodo Extensível 6m', 'Limpeza de placas Solares', '00000000-0000-0000-0000-000000000000'),
  
  ('Wallbox 22kW Inteligente', 'Carregamento Veicular', '00000000-0000-0000-0000-000000000000'),
  ('Cabo Tipo 2 Reforçado', 'Carregamento Veicular', '00000000-0000-0000-0000-000000000000'),
  ('Disjuntor 32A Bipolar', 'Carregamento Veicular', '00000000-0000-0000-0000-000000000000')
ON CONFLICT (empresa_id, nome, tipo_servico) DO NOTHING;


-- ========================================== 
-- CRONOLOGICAL MIGRATION: 20260623_make_whatsapp_config_multi_tenant.sql 
-- ========================================== 

-- OKKA Platform - Migration: Multi-Tenant Whatsapp Config Column Identity
-- Remove check constraint checking id = 1 if it still exists
ALTER TABLE public.whatsapp_config DROP CONSTRAINT IF EXISTS whatsapp_config_id_check;

-- Create sequence for id if it doesn't exist
CREATE SEQUENCE IF NOT EXISTS public.whatsapp_config_id_seq;

-- Set default for id column to nextval of sequence
ALTER TABLE public.whatsapp_config ALTER COLUMN id SET DEFAULT nextval('public.whatsapp_config_id_seq');

-- Adjust the sequence value to be greater than the max id in the table (which is 1)
SELECT setval('public.whatsapp_config_id_seq', COALESCE((SELECT MAX(id) FROM public.whatsapp_config), 1));


-- ========================================== 
-- CRONOLOGICAL MIGRATION: 20260624_add_realizada_com_atraso_to_visits.sql 
-- ========================================== 

-- OKKA Platform - Migration: Add realizada_com_atraso to visits and delay checking trigger
-- Execute este script no SQL Editor do seu projeto Supabase.

-- 1. Adicionar a coluna realizada_com_atraso à tabela visits se não existir
ALTER TABLE public.visits 
ADD COLUMN IF NOT EXISTS realizada_com_atraso boolean DEFAULT false NOT NULL;

-- 2. Criar ou substituir a função de trigger
CREATE OR REPLACE FUNCTION public.check_visit_delay_on_update()
RETURNS trigger AS $$
DECLARE
  _scheduled timestamp;
  _now_sp timestamp;
BEGIN
  -- Data e hora agendadas da visita
  _scheduled := (NEW.data_visita + NEW.horario);
  
  -- Data e hora atual no fuso horário do Brasil (America/Sao_Paulo)
  _now_sp := timezone('America/Sao_Paulo'::text, now());

  -- Se o status mudou para 'Realizada' (ou foi criado diretamente como 'Realizada')
  IF NEW.status_visita = 'Realizada' AND (TG_OP = 'INSERT' OR COALESCE(OLD.status_visita, '') <> 'Realizada') THEN
    -- Se o momento de registrar a realização é após a data/hora agendada, marca com atraso
    IF _now_sp > _scheduled THEN
      NEW.realizada_com_atraso := true;
    END IF;
  END IF;

  -- Se o status for alterado de volta para outra coisa, reseta o indicador
  IF NEW.status_visita <> 'Realizada' THEN
    NEW.realizada_com_atraso := false;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Vincular a função ao trigger na tabela visits
DROP TRIGGER IF EXISTS tr_check_visit_delay_on_update ON public.visits;
CREATE TRIGGER tr_check_visit_delay_on_update
  BEFORE INSERT OR UPDATE OF status_visita, data_visita, horario ON public.visits
  FOR EACH ROW
  EXECUTE FUNCTION public.check_visit_delay_on_update();


-- ========================================== 
-- CRONOLOGICAL MIGRATION: 20260624_auth_clean_and_cascade.sql 
-- ========================================== 

-- OKKA Platform - Migration: Auth User Cleanup on Profile Delete, Empresa Cascade Delete & RLS Recursion Fix
-- Execute este script no SQL Editor do seu projeto Supabase.

-- =========================================================================
-- 1. CORREÇÃO DE RECURSÃO INFINITA (Redefinição das funções de auxílio RLS)
-- =========================================================================

-- Redefinir a função get_my_empresa_id() para buscar no auth.users em caso de fallback (evitando recursão infinita com perfis_usuarios)
CREATE OR REPLACE FUNCTION public.get_my_empresa_id()
RETURNS uuid AS $$
DECLARE
  _empresa_id text;
BEGIN
  -- A. Tentar ler do JWT metadata (mais rápido e evita loops de recursão)
  _empresa_id := auth.jwt() -> 'user_metadata' ->> 'empresa_id';
  IF _empresa_id IS NOT NULL THEN
    RETURN _empresa_id::uuid;
  END IF;

  -- B. Fallback: Buscar da tabela auth.users (evita loops de recursão com perfis_usuarios)
  RETURN (SELECT (raw_user_meta_data ->> 'empresa_id')::uuid FROM auth.users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Redefinir a função is_super_admin() para buscar no auth.users em caso de fallback (evitando recursão infinita com perfis_usuarios)
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean AS $$
DECLARE
  _role text;
BEGIN
  -- A. Tentar ler do JWT metadata
  _role := auth.jwt() -> 'user_metadata' ->> 'role';
  IF _role IS NOT NULL THEN
    RETURN _role = 'super_admin';
  END IF;

  -- B. Fallback: Buscar da tabela auth.users
  RETURN COALESCE((SELECT (raw_user_meta_data ->> 'role') = 'super_admin' FROM auth.users WHERE id = auth.uid()), false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =========================================================================
-- 2. AJUSTE DE POLÍTICAS RLS PARA EVITAR RECURSÃO NO SELECT
-- =========================================================================

-- Desmembrar a política "Perfis usuarios insert/delete policy" de FOR ALL para FOR INSERT e FOR DELETE específicos.
-- Como ela possuía uma verificação subquery (EXISTS) na própria tabela perfis_usuarios, quando o comando era FOR ALL
-- a política de SELECT a acionava recursivamente, causando o estouro de pilha (infinite recursion).
DROP POLICY IF EXISTS "Perfis usuarios insert/delete policy" ON public.perfis_usuarios;
DROP POLICY IF EXISTS "Perfis usuarios insert policy" ON public.perfis_usuarios;
DROP POLICY IF EXISTS "Perfis usuarios delete policy" ON public.perfis_usuarios;

CREATE POLICY "Perfis usuarios insert policy" ON public.perfis_usuarios
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_super_admin() 
    OR (
      empresa_id = public.get_my_empresa_id() 
      AND (
        (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'mestre')
        OR EXISTS (
          SELECT 1 FROM public.perfis_usuarios 
          WHERE perfis_usuarios.id = auth.uid() 
          AND perfis_usuarios.role IN ('admin', 'mestre')
        )
      )
    )
  );

CREATE POLICY "Perfis usuarios delete policy" ON public.perfis_usuarios
  FOR DELETE TO authenticated
  USING (
    public.is_super_admin() 
    OR (
      empresa_id = public.get_my_empresa_id() 
      AND (
        (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'mestre')
        OR EXISTS (
          SELECT 1 FROM public.perfis_usuarios 
          WHERE perfis_usuarios.id = auth.uid() 
          AND perfis_usuarios.role IN ('admin', 'mestre')
        )
      )
    )
  );

-- =========================================================================
-- 3. CONFIGURAR ON DELETE CASCADE PARA EMPRESAS
-- =========================================================================

-- Tabela perfis_usuarios (alterar de SET NULL para CASCADE)
ALTER TABLE public.perfis_usuarios
  DROP CONSTRAINT IF EXISTS perfis_usuarios_empresa_id_fkey,
  DROP CONSTRAINT IF EXISTS fk_perfis_usuarios_empresa;

ALTER TABLE public.perfis_usuarios
  ADD CONSTRAINT perfis_usuarios_empresa_id_fkey
  FOREIGN KEY (empresa_id) REFERENCES public.empresas(id)
  ON DELETE CASCADE;

-- Garantir que as outras tabelas tenham ON DELETE CASCADE
ALTER TABLE public.leads
  DROP CONSTRAINT IF EXISTS leads_empresa_id_fkey;
ALTER TABLE public.leads
  ADD CONSTRAINT leads_empresa_id_fkey
  FOREIGN KEY (empresa_id) REFERENCES public.empresas(id)
  ON DELETE CASCADE;

ALTER TABLE public.projects
  DROP CONSTRAINT IF EXISTS projects_empresa_id_fkey;
ALTER TABLE public.projects
  ADD CONSTRAINT projects_empresa_id_fkey
  FOREIGN KEY (empresa_id) REFERENCES public.empresas(id)
  ON DELETE CASCADE;

ALTER TABLE public.visits
  DROP CONSTRAINT IF EXISTS visits_empresa_id_fkey;
ALTER TABLE public.visits
  ADD CONSTRAINT visits_empresa_id_fkey
  FOREIGN KEY (empresa_id) REFERENCES public.empresas(id)
  ON DELETE CASCADE;

ALTER TABLE public.responsaveis_tecnicos
  DROP CONSTRAINT IF EXISTS responsaveis_tecnicos_empresa_id_fkey;
ALTER TABLE public.responsaveis_tecnicos
  ADD CONSTRAINT responsaveis_tecnicos_empresa_id_fkey
  FOREIGN KEY (empresa_id) REFERENCES public.empresas(id)
  ON DELETE CASCADE;

ALTER TABLE public.whatsapp_config
  DROP CONSTRAINT IF EXISTS whatsapp_config_empresa_id_fkey;
ALTER TABLE public.whatsapp_config
  ADD CONSTRAINT whatsapp_config_empresa_id_fkey
  FOREIGN KEY (empresa_id) REFERENCES public.empresas(id)
  ON DELETE CASCADE;

ALTER TABLE public.materiais_predefinidos
  DROP CONSTRAINT IF EXISTS materiais_predefinidos_empresa_id_fkey;
ALTER TABLE public.materiais_predefinidos
  ADD CONSTRAINT materiais_predefinidos_empresa_id_fkey
  FOREIGN KEY (empresa_id) REFERENCES public.empresas(id)
  ON DELETE CASCADE;

-- =========================================================================
-- 4. CRIAR TRIGGER DE EXCLUSÃO DEFINITIVA NO AUTH.USERS
-- =========================================================================

CREATE OR REPLACE FUNCTION public.handle_delete_user_profile()
RETURNS trigger AS $$
BEGIN
  -- Deleta do auth.users caso ainda exista (evitando recursão se o delete partiu do auth)
  IF EXISTS (SELECT 1 FROM auth.users WHERE id = OLD.id) THEN
    DELETE FROM auth.users WHERE id = OLD.id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar a trigger na tabela perfis_usuarios
DROP TRIGGER IF EXISTS tr_on_profile_deleted ON public.perfis_usuarios;
CREATE TRIGGER tr_on_profile_deleted
  AFTER DELETE ON public.perfis_usuarios
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_delete_user_profile();


-- ========================================== 
-- CRONOLOGICAL MIGRATION: 20260624_fix_rls_infinite_recursion.sql 
-- ========================================== 

-- OKKA Platform - Migration: Fix RLS Infinite Recursion
-- Execute este script no SQL Editor do seu projeto Supabase.

-- 1. Redefinir a função get_my_empresa_id() para buscar no auth.users em caso de fallback
CREATE OR REPLACE FUNCTION public.get_my_empresa_id()
RETURNS uuid AS $$
DECLARE
  _empresa_id text;
BEGIN
  -- A. Tentar ler do JWT metadata (mais rápido e evita loops de recursão)
  _empresa_id := auth.jwt() -> 'user_metadata' ->> 'empresa_id';
  IF _empresa_id IS NOT NULL THEN
    RETURN _empresa_id::uuid;
  END IF;

  -- B. Fallback: Buscar da tabela auth.users (evita loops de recursão com perfis_usuarios)
  RETURN (SELECT (raw_user_meta_data ->> 'empresa_id')::uuid FROM auth.users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 2. Redefinir a função is_super_admin() para buscar no auth.users em caso de fallback
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean AS $$
DECLARE
  _role text;
BEGIN
  -- A. Tentar ler do JWT metadata
  _role := auth.jwt() -> 'user_metadata' ->> 'role';
  IF _role IS NOT NULL THEN
    RETURN _role = 'super_admin';
  END IF;

  -- B. Fallback: Buscar da tabela auth.users
  RETURN COALESCE((SELECT (raw_user_meta_data ->> 'role') = 'super_admin' FROM auth.users WHERE id = auth.uid()), false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;


-- ========================================== 
-- CRONOLOGICAL MIGRATION: 20260624_rigid_multi_tenant_security.sql 
-- ========================================== 

-- OKKA Platform - Migration: Rigid Multi-Tenant Security & Optimizations
-- Execute este script no SQL Editor do seu projeto Supabase.

-- =========================================================================
-- 1. OTIMIZAÇÃO DAS FUNÇÕES DE AUXÍLIO (JWT CLAIMS COM FALLBACK)
-- =========================================================================

CREATE OR REPLACE FUNCTION public.get_my_empresa_id()
RETURNS uuid AS $$
DECLARE
  _empresa_id text;
BEGIN
  -- 1. Tentar ler do JWT metadata (mais rápido e evita loops de recursão)
  _empresa_id := auth.jwt() -> 'user_metadata' ->> 'empresa_id';
  IF _empresa_id IS NOT NULL THEN
    RETURN _empresa_id::uuid;
  END IF;

  -- 2. Fallback: Buscar da tabela auth.users (evita loops de recursão com perfis_usuarios)
  RETURN (SELECT (raw_user_meta_data ->> 'empresa_id')::uuid FROM auth.users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean AS $$
DECLARE
  _role text;
BEGIN
  -- 1. Tentar ler do JWT metadata
  _role := auth.jwt() -> 'user_metadata' ->> 'role';
  IF _role IS NOT NULL THEN
    RETURN _role = 'super_admin';
  END IF;

  -- 2. Fallback: Buscar da tabela auth.users (evita loops de recursão com perfis_usuarios)
  RETURN COALESCE((SELECT (raw_user_meta_data ->> 'role') = 'super_admin' FROM auth.users WHERE id = auth.uid()), false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =========================================================================
-- 2. TRIGGER DE SINCRONIZAÇÃO BIDIRECIONAL (Perfis -> Auth metadata)
-- =========================================================================

CREATE OR REPLACE FUNCTION public.sync_profile_to_auth_users()
RETURNS trigger AS $$
BEGIN
  UPDATE auth.users
  SET raw_user_meta_data = 
    COALESCE(raw_user_meta_data, '{}'::jsonb) || 
    jsonb_build_object(
      'empresa_id', NEW.empresa_id,
      'role', NEW.role,
      'name', NEW.nome_completo,
      'nome_completo', NEW.nome_completo,
      'status_acesso', NEW.status_acesso
    )
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_sync_profile_to_auth_users ON public.perfis_usuarios;
CREATE TRIGGER tr_sync_profile_to_auth_users
  AFTER INSERT OR UPDATE OF empresa_id, role, nome_completo, status_acesso ON public.perfis_usuarios
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_to_auth_users();

-- =========================================================================
-- 3. PREVENÇÃO DE ESCALONAMENTO DE PRIVILÉGIOS (Trigger de Role)
-- =========================================================================

CREATE OR REPLACE FUNCTION public.check_profile_role_changes()
RETURNS trigger AS $$
BEGIN
  -- Se o perfil está tentando se tornar ou definir alguém como 'super_admin'
  IF NEW.role = 'super_admin' THEN
    IF NOT public.is_super_admin() THEN
      RAISE EXCEPTION 'Não autorizado: Apenas SuperAdmins podem atribuir a role super_admin.';
    END IF;
  END IF;

  -- Se a role antiga era 'super_admin' e está mudando para outra
  IF OLD.role = 'super_admin' AND NEW.role <> 'super_admin' THEN
    IF NOT public.is_super_admin() THEN
      RAISE EXCEPTION 'Não autorizado: Apenas SuperAdmins podem remover a role super_admin.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_check_profile_role_changes ON public.perfis_usuarios;
CREATE TRIGGER tr_check_profile_role_changes
  BEFORE INSERT OR UPDATE OF role ON public.perfis_usuarios
  FOR EACH ROW
  EXECUTE FUNCTION public.check_profile_role_changes();

-- =========================================================================
-- 4. REESTRUTURAÇÃO DAS POLÍTICAS DA TABELA DE VISITAS (`visits`)
-- =========================================================================

ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Visits multi-tenant policy" ON public.visits;
DROP POLICY IF EXISTS "Admins e Mestres têm permissão total em visits" ON public.visits;
DROP POLICY IF EXISTS "Tecnicos e Instaladores podem ver suas visitas" ON public.visits;
DROP POLICY IF EXISTS "Tecnicos podem atualizar suas visitas" ON public.visits;
DROP POLICY IF EXISTS "Técnicos podem ver suas próprias visitas" ON public.visits;
DROP POLICY IF EXISTS "Técnicos podem atualizar suas próprias visitas" ON public.visits;
DROP POLICY IF EXISTS "Administradores têm permissão total em visits" ON public.visits;
DROP POLICY IF EXISTS "Super admin can do all on visits" ON public.visits;
DROP POLICY IF EXISTS "Admins e Mestres total access within company" ON public.visits;
DROP POLICY IF EXISTS "Tecnicos e Instaladores can view their assigned visits within company" ON public.visits;
DROP POLICY IF EXISTS "Tecnicos e Instaladores can update their assigned visits within company" ON public.visits;


-- Super Admin
CREATE POLICY "Super admin can do all on visits" ON public.visits
  FOR ALL TO authenticated USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

-- Admins e Mestres
CREATE POLICY "Admins e Mestres total access within company" ON public.visits
  FOR ALL TO authenticated
  USING (
    empresa_id = public.get_my_empresa_id() 
    AND (
      (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'mestre')
      OR EXISTS (
        SELECT 1 FROM public.perfis_usuarios 
        WHERE perfis_usuarios.id = auth.uid() 
        AND perfis_usuarios.role IN ('admin', 'mestre')
      )
    )
  )
  WITH CHECK (
    empresa_id = public.get_my_empresa_id() 
    AND (
      (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'mestre')
      OR EXISTS (
        SELECT 1 FROM public.perfis_usuarios 
        WHERE perfis_usuarios.id = auth.uid() 
        AND perfis_usuarios.role IN ('admin', 'mestre')
      )
    )
  );

-- Técnicos / Instaladores
CREATE POLICY "Tecnicos e Instaladores can view their assigned visits within company" ON public.visits
  FOR SELECT TO authenticated
  USING (empresa_id = public.get_my_empresa_id() AND tecnico_id = auth.uid());

CREATE POLICY "Tecnicos e Instaladores can update their assigned visits within company" ON public.visits
  FOR UPDATE TO authenticated
  USING (empresa_id = public.get_my_empresa_id() AND tecnico_id = auth.uid())
  WITH CHECK (empresa_id = public.get_my_empresa_id() AND tecnico_id = auth.uid());

-- =========================================================================
-- 5. REESTRUTURAÇÃO DAS POLÍTICAS DE RESPONSÁVEIS TÉCNICOS (`responsaveis_tecnicos`)
-- =========================================================================

ALTER TABLE public.responsaveis_tecnicos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Qualquer usuário autenticado pode ver responsaveis_tecnicos" ON public.responsaveis_tecnicos;
DROP POLICY IF EXISTS "Apenas administradores podem gerenciar responsaveis_tecnicos" ON public.responsaveis_tecnicos;
DROP POLICY IF EXISTS "Responsaveis tecnicos multi-tenant policy" ON public.responsaveis_tecnicos;
DROP POLICY IF EXISTS "Super admin can do all on responsaveis_tecnicos" ON public.responsaveis_tecnicos;
DROP POLICY IF EXISTS "Users can view responsaveis_tecnicos of their own company" ON public.responsaveis_tecnicos;
DROP POLICY IF EXISTS "Admins can manage responsaveis_tecnicos of their own company" ON public.responsaveis_tecnicos;


CREATE POLICY "Super admin can do all on responsaveis_tecnicos" ON public.responsaveis_tecnicos
  FOR ALL TO authenticated USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

CREATE POLICY "Users can view responsaveis_tecnicos of their own company" ON public.responsaveis_tecnicos
  FOR SELECT TO authenticated USING (empresa_id = public.get_my_empresa_id());

CREATE POLICY "Admins can manage responsaveis_tecnicos of their own company" ON public.responsaveis_tecnicos
  FOR ALL TO authenticated
  USING (
    empresa_id = public.get_my_empresa_id()
    AND (
      (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'mestre')
      OR EXISTS (
        SELECT 1 FROM public.perfis_usuarios 
        WHERE perfis_usuarios.id = auth.uid() 
        AND perfis_usuarios.role IN ('admin', 'mestre')
      )
    )
  )
  WITH CHECK (
    empresa_id = public.get_my_empresa_id()
    AND (
      (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'mestre')
      OR EXISTS (
        SELECT 1 FROM public.perfis_usuarios 
        WHERE perfis_usuarios.id = auth.uid() 
        AND perfis_usuarios.role IN ('admin', 'mestre')
      )
    )
  );

-- =========================================================================
-- 6. REESTRUTURAÇÃO DAS POLÍTICAS DE PERFIS DE USUÁRIOS (`perfis_usuarios`)
-- =========================================================================

ALTER TABLE public.perfis_usuarios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Perfis usuarios multi-tenant policy" ON public.perfis_usuarios;
DROP POLICY IF EXISTS "Administradores podem gerenciar todos os perfis" ON public.perfis_usuarios;
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON public.perfis_usuarios;
DROP POLICY IF EXISTS "Perfis usuarios select policy" ON public.perfis_usuarios;
DROP POLICY IF EXISTS "Perfis usuarios insert/delete policy" ON public.perfis_usuarios;
DROP POLICY IF EXISTS "Perfis usuarios insert policy" ON public.perfis_usuarios;
DROP POLICY IF EXISTS "Perfis usuarios delete policy" ON public.perfis_usuarios;
DROP POLICY IF EXISTS "Perfis usuarios update policy" ON public.perfis_usuarios;


-- SELECT
CREATE POLICY "Perfis usuarios select policy" ON public.perfis_usuarios
  FOR SELECT TO authenticated
  USING (public.is_super_admin() OR empresa_id = public.get_my_empresa_id() OR id = auth.uid());

-- INSERT (Admins)
CREATE POLICY "Perfis usuarios insert policy" ON public.perfis_usuarios
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_super_admin() 
    OR (
      empresa_id = public.get_my_empresa_id() 
      AND (
        (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'mestre')
        OR EXISTS (
          SELECT 1 FROM public.perfis_usuarios 
          WHERE perfis_usuarios.id = auth.uid() 
          AND perfis_usuarios.role IN ('admin', 'mestre')
        )
      )
    )
  );

-- DELETE (Admins)
CREATE POLICY "Perfis usuarios delete policy" ON public.perfis_usuarios
  FOR DELETE TO authenticated
  USING (
    public.is_super_admin() 
    OR (
      empresa_id = public.get_my_empresa_id() 
      AND (
        (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'mestre')
        OR EXISTS (
          SELECT 1 FROM public.perfis_usuarios 
          WHERE perfis_usuarios.id = auth.uid() 
          AND perfis_usuarios.role IN ('admin', 'mestre')
        )
      )
    )
  );

-- UPDATE
CREATE POLICY "Perfis usuarios update policy" ON public.perfis_usuarios
  FOR UPDATE TO authenticated
  USING (
    public.is_super_admin()
    OR id = auth.uid()
    OR (
      empresa_id = public.get_my_empresa_id()
      AND (
        (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'mestre')
        OR EXISTS (
          SELECT 1 FROM public.perfis_usuarios 
          WHERE perfis_usuarios.id = auth.uid() 
          AND perfis_usuarios.role IN ('admin', 'mestre')
        )
      )
    )
  )
  WITH CHECK (
    public.is_super_admin()
    OR (
      id = auth.uid()
      AND (empresa_id = public.get_my_empresa_id() OR empresa_id IS NULL)
    )
    OR (
      empresa_id = public.get_my_empresa_id()
      AND (
        (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'mestre')
        OR EXISTS (
          SELECT 1 FROM public.perfis_usuarios 
          WHERE perfis_usuarios.id = auth.uid() 
          AND perfis_usuarios.role IN ('admin', 'mestre')
        )
      )
    )
  );

-- =========================================================================
-- 7. AJUSTES FINAIS DE LEADS (LANDING PAGE SECURITY)
-- =========================================================================

-- Restringir inserção pública de leads para apenas a Empresa Padrão (evita spam e injeção em outros tenants)
DROP POLICY IF EXISTS "Público pode criar leads pela Landing Page" ON public.leads;
CREATE POLICY "Público pode criar leads pela Landing Page" ON public.leads
  FOR INSERT TO public WITH CHECK (empresa_id = '00000000-0000-0000-0000-000000000000');


-- ========================================== 
-- CRONOLOGICAL MIGRATION: 20260624_sync_technicians_trigger.sql 
-- ========================================== 

-- OKKA Platform - Migration: Auto-sync perfis_usuarios with responsaveis_tecnicos & RLS Recursion Fix
-- Execute este script no SQL Editor do seu projeto Supabase para aplicar a correção de recursão infinita e sincronização.

-- =========================================================================
-- 1. CORREÇÃO DE RECURSÃO INFINITA (Redefinição das funções de auxílio RLS)
-- =========================================================================

-- Redefinir a função get_my_empresa_id() para buscar no auth.users em caso de fallback (evitando recursão infinita com perfis_usuarios)
CREATE OR REPLACE FUNCTION public.get_my_empresa_id()
RETURNS uuid AS $$
DECLARE
  _empresa_id text;
BEGIN
  -- A. Tentar ler do JWT metadata (mais rápido e evita loops de recursão)
  _empresa_id := auth.jwt() -> 'user_metadata' ->> 'empresa_id';
  IF _empresa_id IS NOT NULL THEN
    RETURN _empresa_id::uuid;
  END IF;

  -- B. Fallback: Buscar da tabela auth.users (evita loops de recursão com perfis_usuarios)
  RETURN (SELECT (raw_user_meta_data ->> 'empresa_id')::uuid FROM auth.users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Redefinir a função is_super_admin() para buscar no auth.users em caso de fallback (evitando recursão infinita com perfis_usuarios)
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean AS $$
DECLARE
  _role text;
BEGIN
  -- A. Tentar ler do JWT metadata
  _role := auth.jwt() -> 'user_metadata' ->> 'role';
  IF _role IS NOT NULL THEN
    RETURN _role = 'super_admin';
  END IF;

  -- B. Fallback: Buscar da tabela auth.users
  RETURN COALESCE((SELECT (raw_user_meta_data ->> 'role') = 'super_admin' FROM auth.users WHERE id = auth.uid()), false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =========================================================================
-- 2. AJUSTE DE POLÍTICAS RLS PARA EVITAR RECURSÃO NO SELECT
-- =========================================================================

-- Desmembrar a política "Perfis usuarios insert/delete policy" de FOR ALL para FOR INSERT e FOR DELETE específicos.
-- Como ela possuía uma verificação subquery (EXISTS) na própria tabela perfis_usuarios, quando o comando era FOR ALL
-- a política de SELECT a acionava recursivamente, causando o estouro de pilha (infinite recursion).
DROP POLICY IF EXISTS "Perfis usuarios insert/delete policy" ON public.perfis_usuarios;
DROP POLICY IF EXISTS "Perfis usuarios insert policy" ON public.perfis_usuarios;
DROP POLICY IF EXISTS "Perfis usuarios delete policy" ON public.perfis_usuarios;

CREATE POLICY "Perfis usuarios insert policy" ON public.perfis_usuarios
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_super_admin() 
    OR (
      empresa_id = public.get_my_empresa_id() 
      AND (
        (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'mestre')
        OR EXISTS (
          SELECT 1 FROM public.perfis_usuarios 
          WHERE perfis_usuarios.id = auth.uid() 
          AND perfis_usuarios.role IN ('admin', 'mestre')
        )
      )
    )
  );

CREATE POLICY "Perfis usuarios delete policy" ON public.perfis_usuarios
  FOR DELETE TO authenticated
  USING (
    public.is_super_admin() 
    OR (
      empresa_id = public.get_my_empresa_id() 
      AND (
        (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'mestre')
        OR EXISTS (
          SELECT 1 FROM public.perfis_usuarios 
          WHERE perfis_usuarios.id = auth.uid() 
          AND perfis_usuarios.role IN ('admin', 'mestre')
        )
      )
    )
  );

-- =========================================================================
-- 3. GARANTIR A EMPRESA PADRÃO
-- =========================================================================
INSERT INTO public.empresas (id, nome_fantasia, cnpj, status_assinatura)
VALUES ('00000000-0000-0000-0000-000000000000', 'Empresa Padrão', '00000000000000', 'ativa')
ON CONFLICT (id) DO NOTHING;

-- =========================================================================
-- 4. CRIAR A FUNÇÃO E TRIGGER DE SINCRONIZAÇÃO DE TÉCNICOS/INSTALADORES
-- =========================================================================

CREATE OR REPLACE FUNCTION public.sync_technical_responsible()
RETURNS trigger AS $$
BEGIN
  -- Se a role do usuário é tecnico ou instalador, garante que ele existe em responsaveis_tecnicos
  IF NEW.role IN ('tecnico', 'instalador') THEN
    INSERT INTO public.responsaveis_tecnicos (id, nome, email, telefone, empresa_id)
    VALUES (
      NEW.id,
      NEW.nome_completo,
      NEW.email,
      COALESCE(
        (SELECT (raw_user_meta_data ->> 'telefone') FROM auth.users WHERE id = NEW.id),
        COALESCE((SELECT telefone FROM public.responsaveis_tecnicos WHERE id = NEW.id), '')
      ),
      NEW.empresa_id
    )
    ON CONFLICT (id) DO UPDATE SET
      nome = EXCLUDED.nome,
      email = EXCLUDED.email,
      telefone = EXCLUDED.telefone,
      empresa_id = EXCLUDED.empresa_id;
  ELSE
    -- Se a role mudou para outra coisa, remove da tabela de técnicos para não poluir a listagem
    DELETE FROM public.responsaveis_tecnicos WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Vincular a função ao trigger na tabela perfis_usuarios
DROP TRIGGER IF EXISTS tr_sync_technical_responsible ON public.perfis_usuarios;
CREATE TRIGGER tr_sync_technical_responsible
  AFTER INSERT OR UPDATE OF role, nome_completo, email, empresa_id ON public.perfis_usuarios
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_technical_responsible();

-- =========================================================================
-- 5. SINCRONIZAÇÃO RETROATIVA COM TELEFONES
-- =========================================================================
INSERT INTO public.responsaveis_tecnicos (id, nome, email, telefone, empresa_id)
SELECT 
  p.id, 
  p.nome_completo, 
  p.email, 
  COALESCE((SELECT raw_user_meta_data ->> 'telefone' FROM auth.users WHERE id = p.id), ''), 
  p.empresa_id 
FROM public.perfis_usuarios p
WHERE p.role IN ('tecnico', 'instalador')
ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
  email = EXCLUDED.email,
  telefone = EXCLUDED.telefone,
  empresa_id = EXCLUDED.empresa_id;


-- ========================================== 
-- CRONOLOGICAL MIGRATION: 20260625_empresa_membros_multi_tenant.sql 
-- ========================================== 

-- ============================================================================
-- OKKA Platform - Migration: empresa_membros (Desafio 1 & 2)
-- 
-- DESAFIO 1: Permite que o mesmo e-mail pertença a múltiplas empresas.
--   - Cria tabela pivô empresa_membros (N:N entre auth.users e empresas)
--   - Migra dados existentes de perfis_usuarios para empresa_membros
--   - Atualiza triggers para manter sincronismo
--
-- DESAFIO 2: Prepara a infra para o Deep Cleanse (exclusão total de empresa)
--   - Adiciona função get_user_empresas() para uso no Server Action
--
-- INSTRUÇÃO: Execute este script no SQL Editor do Supabase ANTES de atualizar
-- o código Next.js. Ele é não-destrutivo: as colunas antigas de perfis_usuarios
-- são preservadas para compatibilidade retroativa.
-- ============================================================================

-- ============================================================================
-- 1. CRIAR TABELA PIVÔ empresa_membros
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.empresa_membros (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  empresa_id    uuid NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  role          text NOT NULL CHECK (role IN ('admin', 'instalador', 'tecnico', 'mestre', 'vendedor')),
  status_acesso boolean DEFAULT true NOT NULL,
  criado_em     timestamptz DEFAULT now() NOT NULL,
  UNIQUE (user_id, empresa_id)
);

-- Índices para queries de RLS e listagens
CREATE INDEX IF NOT EXISTS idx_empresa_membros_user_id    ON public.empresa_membros(user_id);
CREATE INDEX IF NOT EXISTS idx_empresa_membros_empresa_id ON public.empresa_membros(empresa_id);
CREATE INDEX IF NOT EXISTS idx_empresa_membros_user_emp   ON public.empresa_membros(user_id, empresa_id);

COMMENT ON TABLE public.empresa_membros IS
  'Tabela pivô N:N: um usuário pode pertencer a múltiplas empresas com papéis distintos em cada uma.';

-- ============================================================================
-- 2. MIGRAR DADOS EXISTENTES de perfis_usuarios → empresa_membros
-- ============================================================================
-- Popula empresa_membros com todos os vínculos que já existem em perfis_usuarios.
-- ON CONFLICT garante idempotência (pode rodar mais de uma vez sem problemas).

INSERT INTO public.empresa_membros (user_id, empresa_id, role, status_acesso, criado_em)
SELECT
  pu.id            AS user_id,
  pu.empresa_id,
  CASE
    WHEN pu.role IN ('admin', 'instalador', 'tecnico', 'mestre', 'vendedor') THEN pu.role
    ELSE 'tecnico'
  END              AS role,
  COALESCE(pu.status_acesso, true)  AS status_acesso,
  COALESCE(pu.created_at, now())    AS criado_em
FROM public.perfis_usuarios pu
WHERE pu.empresa_id IS NOT NULL
  AND pu.role NOT IN ('super_admin')     -- super_admin não pertence a uma empresa
ON CONFLICT (user_id, empresa_id) DO UPDATE SET
  role          = EXCLUDED.role,
  status_acesso = EXCLUDED.status_acesso;

-- ============================================================================
-- 3. HABILITAR RLS EM empresa_membros
-- ============================================================================

ALTER TABLE public.empresa_membros ENABLE ROW LEVEL SECURITY;

-- Drop de políticas antigas para idempotência
DROP POLICY IF EXISTS "Super admin can do all on empresa_membros"          ON public.empresa_membros;
DROP POLICY IF EXISTS "Users can view own company memberships"             ON public.empresa_membros;
DROP POLICY IF EXISTS "Admins can manage membros of own company - select"  ON public.empresa_membros;
DROP POLICY IF EXISTS "Admins can manage membros of own company"           ON public.empresa_membros;

-- 3a. Super Admin enxerga e gerencia tudo
CREATE POLICY "Super admin can do all on empresa_membros"
  ON public.empresa_membros FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- 3b. Usuário comum pode ver SEUS PRÓPRIOS vínculos (necessário para a tela de seleção de empresa)
CREATE POLICY "Users can view own company memberships"
  ON public.empresa_membros FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- 3c. Admins/Mestres da empresa gerenciam membros (INSERT/UPDATE/DELETE) dentro da própria empresa
--     Usa subquery em empresa_membros com user_id = auth.uid() (sem recursão pois é SELECT em tabela diferente)
CREATE POLICY "Admins can manage membros of own company"
  ON public.empresa_membros FOR ALL TO authenticated
  USING (
    empresa_id = public.get_my_empresa_id()
    AND (
      (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'mestre')
      OR EXISTS (
        SELECT 1 FROM public.empresa_membros em2
        WHERE em2.user_id     = auth.uid()
          AND em2.empresa_id  = public.get_my_empresa_id()
          AND em2.role        IN ('admin', 'mestre')
          AND em2.status_acesso = true
      )
    )
  )
  WITH CHECK (
    empresa_id = public.get_my_empresa_id()
    AND (
      (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'mestre')
      OR EXISTS (
        SELECT 1 FROM public.empresa_membros em2
        WHERE em2.user_id     = auth.uid()
          AND em2.empresa_id  = public.get_my_empresa_id()
          AND em2.role        IN ('admin', 'mestre')
          AND em2.status_acesso = true
      )
    )
  );

-- ============================================================================
-- 4. FUNÇÕES AUXILIARES PARA O NOVO MODELO
-- ============================================================================

-- 4a. Retorna todas as empresas ativas às quais o usuário atual pertence
--     Usada na tela de seleção de empresa após o login
CREATE OR REPLACE FUNCTION public.get_user_empresas(p_user_id uuid DEFAULT auth.uid())
RETURNS TABLE (
  empresa_id    uuid,
  nome_fantasia text,
  role          text,
  status_acesso boolean,
  status_assinatura text
) AS $$
  SELECT
    e.id             AS empresa_id,
    e.nome_fantasia,
    em.role,
    em.status_acesso,
    e.status_assinatura::text
  FROM public.empresa_membros em
  JOIN public.empresas e ON e.id = em.empresa_id
  WHERE em.user_id = p_user_id
    AND em.status_acesso = true
  ORDER BY e.nome_fantasia;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 4b. Verifica se um usuário pertence a uma empresa específica com status ativo
CREATE OR REPLACE FUNCTION public.user_is_member_of(p_user_id uuid, p_empresa_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.empresa_membros
    WHERE user_id     = p_user_id
      AND empresa_id  = p_empresa_id
      AND status_acesso = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 4c. Retorna o papel do usuário na empresa atualmente selecionada (via JWT)
CREATE OR REPLACE FUNCTION public.get_my_role_in_empresa()
RETURNS text AS $$
  SELECT role FROM public.empresa_membros
  WHERE user_id  = auth.uid()
    AND empresa_id = public.get_my_empresa_id()
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================================
-- 5. ATUALIZAR TRIGGER handle_new_user
--    Ao criar um novo usuário no auth, insere em perfis_usuarios E empresa_membros
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  _empresa_id  uuid;
  _role        text;
  _nome        text;
  _status      boolean;
BEGIN
  _empresa_id := (new.raw_user_meta_data ->> 'empresa_id')::uuid;
  _role       := COALESCE(new.raw_user_meta_data ->> 'role', 'tecnico');
  _nome       := COALESCE(
                    new.raw_user_meta_data ->> 'name',
                    new.raw_user_meta_data ->> 'nome_completo',
                    'Usuário OKKA'
                  );
  _status     := COALESCE((new.raw_user_meta_data ->> 'status_acesso')::boolean, true);

  -- A. Inserir em perfis_usuarios (dados globais — nome, email, referência)
  INSERT INTO public.perfis_usuarios (id, nome_completo, email, role, status_acesso, empresa_id)
  VALUES (
    new.id,
    _nome,
    COALESCE(new.email, 'sem-email@okka.com'),
    _role,
    _status,
    _empresa_id
  )
  ON CONFLICT (id) DO NOTHING;

  -- B. Inserir em empresa_membros (vínculo N:N) se tiver empresa_id e role operacional
  IF _empresa_id IS NOT NULL AND _role NOT IN ('super_admin') THEN
    INSERT INTO public.empresa_membros (user_id, empresa_id, role, status_acesso)
    VALUES (
      new.id,
      _empresa_id,
      CASE WHEN _role IN ('admin','instalador','tecnico','mestre','vendedor') THEN _role ELSE 'tecnico' END,
      _status
    )
    ON CONFLICT (user_id, empresa_id) DO NOTHING;
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar o trigger (DROP + CREATE é seguro pois a função foi redefinida acima)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 6. ATUALIZAR TRIGGER sync_technical_responsible
--    Quando um membro de empresa_membros muda de role, sincroniza responsaveis_tecnicos
-- ============================================================================

CREATE OR REPLACE FUNCTION public.sync_technical_from_membro()
RETURNS trigger AS $$
DECLARE
  _nome  text;
  _email text;
BEGIN
  -- Ler dados do perfil global
  SELECT nome_completo, email
  INTO _nome, _email
  FROM public.perfis_usuarios
  WHERE id = NEW.user_id;

  IF NEW.role IN ('tecnico', 'instalador') THEN
    -- Garantir entrada em responsaveis_tecnicos
    INSERT INTO public.responsaveis_tecnicos (id, nome, email, telefone, empresa_id)
    VALUES (
      NEW.user_id,
      COALESCE(_nome, 'Técnico'),
      COALESCE(_email, ''),
      COALESCE(
        (SELECT raw_user_meta_data ->> 'telefone' FROM auth.users WHERE id = NEW.user_id),
        ''
      ),
      NEW.empresa_id
    )
    ON CONFLICT (id) DO UPDATE SET
      nome       = EXCLUDED.nome,
      email      = EXCLUDED.email,
      empresa_id = EXCLUDED.empresa_id;
  ELSE
    -- Role mudou para não-técnico: remover de responsaveis_tecnicos DESTA empresa
    DELETE FROM public.responsaveis_tecnicos
    WHERE id = NEW.user_id AND empresa_id = NEW.empresa_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_sync_technical_from_membro ON public.empresa_membros;
CREATE TRIGGER tr_sync_technical_from_membro
  AFTER INSERT OR UPDATE OF role ON public.empresa_membros
  FOR EACH ROW EXECUTE FUNCTION public.sync_technical_from_membro();

-- ============================================================================
-- 7. ATUALIZAR TRIGGER sync_profile_to_auth_users
--    Quando perfis_usuarios é atualizado, sincroniza apenas dados GLOBAIS no Auth
--    (empresa_id e role NÃO são mais gerenciados aqui — vêm da empresa selecionada)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.sync_profile_to_auth_users()
RETURNS trigger AS $$
BEGIN
  -- Sincroniza apenas nome e email (dados globais do usuário)
  -- empresa_id e role são injetados no JWT pelo Server Action de seleção de empresa
  UPDATE auth.users
  SET raw_user_meta_data =
    COALESCE(raw_user_meta_data, '{}'::jsonb) ||
    jsonb_build_object(
      'name',         NEW.nome_completo,
      'nome_completo', NEW.nome_completo
    )
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_sync_profile_to_auth_users ON public.perfis_usuarios;
CREATE TRIGGER tr_sync_profile_to_auth_users
  AFTER INSERT OR UPDATE OF nome_completo ON public.perfis_usuarios
  FOR EACH ROW EXECUTE FUNCTION public.sync_profile_to_auth_users();

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================
-- Resumo do que foi feito:
--   ✅ Tabela empresa_membros criada com RLS
--   ✅ Dados migrados de perfis_usuarios → empresa_membros
--   ✅ Funções: get_user_empresas(), user_is_member_of(), get_my_role_in_empresa()
--   ✅ Trigger handle_new_user atualizado (escreve em ambas as tabelas)
--   ✅ Trigger sync_technical_from_membro na empresa_membros
--   ✅ Trigger sync_profile_to_auth_users simplificado (apenas dados globais)
-- ============================================================================


