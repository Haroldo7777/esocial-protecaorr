-- ============================================================================
-- Fase 2 — Medicina (tipos de exame, ASO) e Documentos / Programas
-- Depende de 0001/0002. Vigências e periodicidades são PARAMETRIZÁVEIS
-- (definidas na prescrição/emissão), nunca fixas no código — ver
-- docs/REGRAS_PERIODICIDADE.md.
-- ============================================================================

-- ===========================================================================
-- TIPOS DE EXAME (catálogo da consultoria) — matriz por tipo de ASO
-- ===========================================================================
create table exame_tipo (
  id             uuid primary key default gen_random_uuid(),
  consultoria_id uuid not null references consultoria(id) on delete cascade,
  nome           text not null,
  -- em quais tipos de ASO este exame é exigível
  aso_admissional boolean not null default false,  -- A
  aso_periodico   boolean not null default false,  -- P
  aso_demissional boolean not null default false,  -- D
  aso_retorno     boolean not null default false,  -- RT
  aso_mudanca     boolean not null default false,  -- MR (mudança de risco/função)
  ativo          boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (consultoria_id, nome)
);
create index on exame_tipo(consultoria_id);
create trigger trg_exame_tipo_updated before update on exame_tipo
  for each row execute function app_set_updated_at();

-- ===========================================================================
-- ASO (Atestado de Saúde Ocupacional) — alimenta o evento S-2220 (Fase 3)
-- ===========================================================================
create type tipo_aso as enum ('admissional','periodico','demissional','retorno','mudanca');
create type resultado_aso as enum ('apto','apto_com_restricao','inapto');

create table aso (
  id            uuid primary key default gen_random_uuid(),
  empresa_id    uuid not null references empresa(id) on delete cascade,
  empregado_id  uuid not null references empregado(id) on delete cascade,
  tipo          tipo_aso not null,
  data_exame    date not null,
  -- periodicidade (meses) escolhida na prescrição → base do vencimento
  periodicidade_meses smallint,
  data_proximo  date,                       -- vencimento (data_exame + periodicidade)
  medico_responsavel text,
  crm_medico    text,
  resultado     resultado_aso,
  observacoes   text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index on aso(empresa_id);
create index on aso(empregado_id);
create trigger trg_aso_updated before update on aso
  for each row execute function app_set_updated_at();

-- ===========================================================================
-- DOCUMENTOS / PROGRAMAS (PGR, PCMSO, LTCAT, LIP, PPR, PCA, AEP, AET, DIR, PPP)
-- Vigência escolhida na emissão (PGR/PGRTR: 1 ou 2 anos; demais: padrão 1 ano).
-- ===========================================================================
create type tipo_programa as enum
  ('pgr','pcmso','ltcat','lip','ppr','pca','aep','aet','dir','ppp');
create type status_programa as enum ('rascunho','emitido','vencido');

create table programa (
  id                 uuid primary key default gen_random_uuid(),
  empresa_id         uuid not null references empresa(id) on delete cascade,
  estabelecimento_id uuid references estabelecimento(id) on delete set null,
  tipo               tipo_programa not null,
  modelo             text,                   -- PGR: 'nr01' | 'nr18' | 'nr22' | 'pgrtr31'
  numero             text,
  identificacao      text,
  vigencia_inicio    date,
  vigencia_meses     smallint,               -- 12 ou 24 (PGR); 12 padrão nos demais
  vigencia_fim       date,                   -- = inicio + vigencia_meses (na emissão)
  responsavel_tecnico text,
  registro_rt        text,                   -- CREA/CRM do responsável
  status             status_programa not null default 'rascunho',
  descricao          text,
  especifico         jsonb not null default '{}'::jsonb,  -- ex.: PCMSO {tipo_sesmt, medico_responsavel}
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index on programa(empresa_id, tipo);
create trigger trg_programa_updated before update on programa
  for each row execute function app_set_updated_at();

-- ===========================================================================
-- RLS
-- ===========================================================================
alter table exame_tipo enable row level security;
alter table aso        enable row level security;
alter table programa   enable row level security;

create policy exame_tipo_rls on exame_tipo
  using (consultoria_id = app_consultoria_id());
create policy aso_rls on aso
  using (app_empresa_na_consultoria(empresa_id));
create policy programa_rls on programa
  using (app_empresa_na_consultoria(empresa_id));
