-- ============================================================================
-- Fase 2 (continuação) — Plano de exames por empresa + ASO (exames realizados)
--
-- A PERIODICIDADE é definida na INCLUSÃO do exame no plano da empresa (cada
-- empresa com seu valor) e é a que aparece no quadro de exames do PCMSO.
-- Essa periodicidade é a base do cálculo do vencimento do próximo ASO.
-- Depende de 0002 (empresa, ghe, empregado) e 0003 (exame_tipo, aso).
-- ============================================================================

-- ===========================================================================
-- PLANO DE EXAMES DA EMPRESA (quadro do PCMSO)
-- Opcionalmente por GHE (ghe_id null = vale para a empresa toda).
-- ===========================================================================
create table plano_exame (
  id             uuid primary key default gen_random_uuid(),
  empresa_id     uuid not null references empresa(id) on delete cascade,
  ghe_id         uuid references ghe(id) on delete cascade,
  exame_tipo_id  uuid not null references exame_tipo(id) on delete restrict,
  -- periodicidade (meses) específica desta empresa — sai no PCMSO
  periodicidade_meses smallint not null default 12,
  observacao     text,
  ativo          boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index on plano_exame(empresa_id);
create index on plano_exame(ghe_id);
-- um exame por empresa/GHE (coalesce trata o GHE nulo como "empresa toda")
create unique index plano_exame_unico
  on plano_exame(empresa_id, exame_tipo_id,
                 coalesce(ghe_id, '00000000-0000-0000-0000-000000000000'::uuid));
create trigger trg_plano_exame_updated before update on plano_exame
  for each row execute function app_set_updated_at();

-- ===========================================================================
-- EXAMES REALIZADOS DENTRO DE UM ASO
-- ===========================================================================
create table aso_exame (
  aso_id        uuid not null references aso(id) on delete cascade,
  exame_tipo_id uuid not null references exame_tipo(id) on delete restrict,
  resultado     text,                         -- livre (normal / alterado / …)
  primary key (aso_id, exame_tipo_id)
);

-- ===========================================================================
-- RLS
-- ===========================================================================
alter table plano_exame enable row level security;
alter table aso_exame   enable row level security;

create policy plano_exame_rls on plano_exame
  using (app_empresa_na_consultoria(empresa_id));

create policy aso_exame_rls on aso_exame
  using (exists (select 1 from aso a
                 where a.id = aso_exame.aso_id
                   and app_empresa_na_consultoria(a.empresa_id)));
