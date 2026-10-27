-- ============================================================================
-- Fase 5 (adiantada) — Treinamentos
-- Catálogo (consultoria) → Turmas (por empresa, com alunos) → Vencimento.
-- A periodicidade que rege o vencimento é definida na turma (prefill do
-- catálogo), parametrizável por empresa — ver docs/REGRAS_PERIODICIDADE.md.
-- Depende de 0001 (consultoria), 0002 (empresa, empregado).
-- ============================================================================

-- ===========================================================================
-- TREINAMENTO (catálogo da consultoria)
-- ===========================================================================
create type tipo_treinamento as enum ('inicial','periodico','reciclagem','eventual');

create table treinamento (
  id             uuid primary key default gen_random_uuid(),
  consultoria_id uuid not null references consultoria(id) on delete cascade,
  nome           text not null,
  nr             text,                         -- documento base (ex.: 'NR-35')
  tipo           tipo_treinamento not null default 'inicial',
  carga_horaria_h numeric(5,1),                -- horas
  periodicidade_meses smallint,                -- padrão (null = sem reciclagem)
  ativo          boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (consultoria_id, nome)
);
create index on treinamento(consultoria_id);
create trigger trg_treinamento_updated before update on treinamento
  for each row execute function app_set_updated_at();

-- ===========================================================================
-- TURMA (realização por empresa)
-- ===========================================================================
create type modalidade_turma as enum ('presencial','ead','semipresencial');

create table turma (
  id             uuid primary key default gen_random_uuid(),
  empresa_id     uuid not null references empresa(id) on delete cascade,
  treinamento_id uuid not null references treinamento(id) on delete restrict,
  data_inicio    date not null,
  data_fim       date,                         -- base do vencimento (conclusão)
  carga_horaria_h numeric(5,1),
  modalidade     modalidade_turma not null default 'presencial',
  instrutor      text,
  -- periodicidade (meses) que rege o próximo vencimento desta turma
  periodicidade_meses smallint,
  observacoes    text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index on turma(empresa_id);
create index on turma(treinamento_id);
create trigger trg_turma_updated before update on turma
  for each row execute function app_set_updated_at();

-- ===========================================================================
-- TURMA_ALUNO (matrícula do empregado)
-- ===========================================================================
create table turma_aluno (
  turma_id     uuid not null references turma(id) on delete cascade,
  empregado_id uuid not null references empregado(id) on delete cascade,
  aprovado     boolean not null default true,
  nota         numeric(4,1),
  primary key (turma_id, empregado_id)
);

-- ===========================================================================
-- RLS
-- ===========================================================================
alter table treinamento  enable row level security;
alter table turma        enable row level security;
alter table turma_aluno  enable row level security;

create policy treinamento_rls on treinamento
  using (consultoria_id = app_consultoria_id());
create policy turma_rls on turma
  using (app_empresa_na_consultoria(empresa_id));
create policy turma_aluno_rls on turma_aluno
  using (exists (select 1 from turma t
                 where t.id = turma_aluno.turma_id
                   and app_empresa_na_consultoria(t.empresa_id)));
