-- ============================================================================
-- Fase 0 — Fundação: multiempresa (consultoria), usuários, RBAC e log
-- Auditor eSocial / SST — Proteção RR
--
-- Regras:
--  - Tudo isolado por tenant (consultoria_id), com RLS em TODAS as tabelas.
--  - RBAC: módulo × ação (VER/CRIAR/EDITAR/EXCLUIR) via perfil_acesso + permissao.
--  - Autenticação: Supabase Auth (auth.users) estendido pela tabela usuario.
--  - Nenhum dado pessoal real em seeds (LGPD).
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- updated_at automático
-- ---------------------------------------------------------------------------
create or replace function app_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ===========================================================================
-- CONSULTORIA (tenant raiz)
-- ===========================================================================
create table consultoria (
  id            uuid primary key default gen_random_uuid(),
  razao_social  text not null,
  nome_fantasia text,
  cnpj          text unique,
  -- identidade (white-label)
  cor_primaria  text default '#0d6e3e',
  logo_url      text,
  ativo         boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create trigger trg_consultoria_updated before update on consultoria
  for each row execute function app_set_updated_at();

-- ===========================================================================
-- USUARIO (estende auth.users)
-- tipo: consultoria | empresa | empregado | aluno | contador | instrutor | parceiro_saude
-- ===========================================================================
create type tipo_usuario as enum
  ('consultoria','empresa','empregado','aluno','contador','instrutor','parceiro_saude');

create table usuario (
  id             uuid primary key references auth.users(id) on delete cascade,
  consultoria_id uuid not null references consultoria(id) on delete cascade,
  nome           text not null,
  email          text not null,
  celular        text,
  tipo           tipo_usuario not null default 'consultoria',
  ativo          boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index on usuario(consultoria_id);
create trigger trg_usuario_updated before update on usuario
  for each row execute function app_set_updated_at();

-- ===========================================================================
-- RBAC: perfil_acesso + permissao (módulo × ação)
-- ===========================================================================
create type acao_rbac as enum ('ver','criar','editar','excluir');

create table perfil_acesso (
  id             uuid primary key default gen_random_uuid(),
  consultoria_id uuid not null references consultoria(id) on delete cascade,
  nome           text not null,
  descricao      text,
  tipo_usuario   tipo_usuario not null default 'consultoria',
  padrao_sistema boolean not null default false,   -- perfis padrão são read-only de edição
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (consultoria_id, nome)
);
create index on perfil_acesso(consultoria_id);
create trigger trg_perfil_updated before update on perfil_acesso
  for each row execute function app_set_updated_at();

-- um módulo é uma área do sistema (ex.: 'empresas','empregados','ghe','esocial'...)
create table permissao (
  perfil_acesso_id uuid not null references perfil_acesso(id) on delete cascade,
  modulo           text not null,
  acao             acao_rbac not null,
  primary key (perfil_acesso_id, modulo, acao)
);

-- vínculo usuário ↔ perfil (global, no nível da consultoria)
create table usuario_perfil (
  usuario_id       uuid not null references usuario(id) on delete cascade,
  perfil_acesso_id uuid not null references perfil_acesso(id) on delete cascade,
  primary key (usuario_id, perfil_acesso_id)
);

-- ===========================================================================
-- LOG DE ATIVIDADE (trilha de auditoria por entidade)
-- ===========================================================================
create table log_atividade (
  id             bigint generated always as identity primary key,
  consultoria_id uuid references consultoria(id) on delete set null,
  usuario_id     uuid references usuario(id) on delete set null,
  acao           text not null,               -- insert | update | delete | login | ...
  entidade       text not null,               -- nome da tabela/entidade
  entidade_id    text,
  dados_antes    jsonb,
  dados_depois   jsonb,
  ip             inet,
  created_at     timestamptz not null default now()
);
create index on log_atividade(consultoria_id, created_at desc);
create index on log_atividade(entidade, entidade_id);

-- ===========================================================================
-- Helpers de sessão (lidos pelas policies de RLS)
-- ===========================================================================

-- consultoria do usuário logado
create or replace function app_consultoria_id()
returns uuid language sql stable security definer set search_path = public as $$
  select consultoria_id from usuario where id = auth.uid()
$$;

-- o usuário logado tem a permissão (modulo, acao)?  (via QUALQUER perfil dele)
-- Fase 0: perfil global do usuário; o vínculo por empresa entra na Fase 1 (usuario_empresa).
create or replace function app_tem_permissao(p_modulo text, p_acao acao_rbac)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from usuario_perfil up
    join permissao pm on pm.perfil_acesso_id = up.perfil_acesso_id
    where up.usuario_id = auth.uid()
      and pm.modulo = p_modulo
      and pm.acao   = p_acao
  )
$$;

-- ===========================================================================
-- RLS
-- ===========================================================================
alter table consultoria   enable row level security;
alter table usuario       enable row level security;
alter table perfil_acesso enable row level security;
alter table permissao     enable row level security;
alter table usuario_perfil enable row level security;
alter table log_atividade enable row level security;

-- Cada um enxerga apenas a própria consultoria
create policy consultoria_rls on consultoria
  using (id = app_consultoria_id());

create policy usuario_rls on usuario
  using (consultoria_id = app_consultoria_id());

create policy perfil_rls on perfil_acesso
  using (consultoria_id = app_consultoria_id());

create policy permissao_rls on permissao
  using (exists (select 1 from perfil_acesso p
                 where p.id = permissao.perfil_acesso_id
                   and p.consultoria_id = app_consultoria_id()));

create policy usuario_perfil_rls on usuario_perfil
  using (exists (select 1 from usuario u
                 where u.id = usuario_perfil.usuario_id
                   and u.consultoria_id = app_consultoria_id()));

create policy log_rls on log_atividade
  using (consultoria_id = app_consultoria_id());

-- Observação: políticas de WRITE (with check) por ação serão derivadas de
-- app_tem_permissao(...) por módulo na medida em que cada módulo é implementado.
-- Nesta fundação deixamos o SELECT isolado por tenant; o enforcement de
-- criar/editar/excluir é aplicado no backend (Server Actions) + policies específicas.

-- ===========================================================================
-- SEED mínimo de catálogo de permissões (apenas nomes de módulo/ação — sem dados pessoais)
-- Os perfis padrão (Administrador, Técnico SST, Operacional) são criados por
-- função na criação de cada consultoria (ver 0002/bootstrap), não aqui.
-- ===========================================================================
