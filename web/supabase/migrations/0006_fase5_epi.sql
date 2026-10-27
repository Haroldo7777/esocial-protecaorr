-- ============================================================================
-- Fase 5 (adiantada) — EPI
-- Catálogo (consultoria) → Entregas (ficha por empregado) → Vencimento (troca).
-- A periodicidade de troca é definida na entrega (prefill do catálogo),
-- parametrizável por empresa. Depende de 0001 (consultoria) e 0002 (empresa,
-- empregado).
-- ============================================================================

-- ===========================================================================
-- EPI (catálogo da consultoria)
-- ===========================================================================
create table epi (
  id             uuid primary key default gen_random_uuid(),
  consultoria_id uuid not null references consultoria(id) on delete cascade,
  nome           text not null,
  ca             text,                         -- Certificado de Aprovação (MTE)
  fabricante     text,
  validade_ca    date,                         -- validade do CA (independe do empregado)
  periodicidade_troca_meses smallint,          -- padrão de troca (null = sem troca periódica)
  descricao      text,
  ativo          boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (consultoria_id, nome)
);
create index on epi(consultoria_id);
create trigger trg_epi_updated before update on epi
  for each row execute function app_set_updated_at();

-- ===========================================================================
-- ENTREGA DE EPI (ficha do empregado)
-- ===========================================================================
create type tipo_mov_epi as enum ('entrega','troca','devolucao');

create table epi_entrega (
  id           uuid primary key default gen_random_uuid(),
  empresa_id   uuid not null references empresa(id) on delete cascade,
  empregado_id uuid not null references empregado(id) on delete cascade,
  epi_id       uuid not null references epi(id) on delete restrict,
  tipo         tipo_mov_epi not null default 'entrega',
  data_entrega date not null,
  quantidade   int not null default 1,
  -- periodicidade de troca (meses) que rege o vencimento desta entrega
  periodicidade_meses smallint,
  data_proxima date,                           -- = data_entrega + periodicidade
  assinado     boolean not null default false, -- recibo assinado pelo empregado
  observacoes  text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index on epi_entrega(empresa_id);
create index on epi_entrega(empregado_id);
create index on epi_entrega(epi_id);
create trigger trg_epi_entrega_updated before update on epi_entrega
  for each row execute function app_set_updated_at();

-- ===========================================================================
-- RLS
-- ===========================================================================
alter table epi         enable row level security;
alter table epi_entrega enable row level security;

create policy epi_rls on epi
  using (consultoria_id = app_consultoria_id());
create policy epi_entrega_rls on epi_entrega
  using (app_empresa_na_consultoria(empresa_id));
