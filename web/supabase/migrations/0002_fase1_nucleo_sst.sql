-- ============================================================================
-- Fase 1 — Núcleo SST
-- Empresas → Estabelecimentos → Ambientes · Funções · GHE · Empregados ·
-- Catálogo de riscos (3 camadas + Tabela 24) · Medidas de controle · Vencimentos
--
-- Depende de 0001_fase0_fundacao.sql (consultoria, usuario, app_consultoria_id()).
-- Campos-chave conforme leiautes eSocial S-1.3. RLS por tenant em tudo.
-- ============================================================================

-- ===========================================================================
-- EMPRESA (cliente da consultoria)
-- ===========================================================================
create type tipo_inscricao as enum ('cnpj','cpf','caepf','cno');
create type situacao_empresa as enum ('liberado','bloqueado');
create type modalidade_empresa as enum ('gestao','treinamentos','link');

create table empresa (
  id              uuid primary key default gen_random_uuid(),
  consultoria_id  uuid not null references consultoria(id) on delete cascade,
  tipo_inscricao  tipo_inscricao not null default 'cnpj',
  inscricao       text not null,                 -- número do CNPJ/CPF/CAEPF/CNO (só dígitos)
  razao_social    text not null,
  nome_fantasia   text,
  inscricao_estadual  text,
  inscricao_municipal text,
  cnaes           text[] default '{}',           -- CNAE preponderante + secundários
  grau_risco      smallint check (grau_risco between 1 and 4),  -- NR-04
  email           text,
  email_cobranca  text,
  telefone        text,
  site            text,
  situacao        situacao_empresa not null default 'bloqueado',
  modalidade      modalidade_empresa not null default 'gestao',
  instalacao_etapa smallint not null default 1 check (instalacao_etapa between 1 and 5),
  arquivada_em    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (consultoria_id, tipo_inscricao, inscricao)
);
create index on empresa(consultoria_id);
create trigger trg_empresa_updated before update on empresa
  for each row execute function app_set_updated_at();

-- helper: a empresa pertence à consultoria do usuário logado?
create or replace function app_empresa_na_consultoria(p_empresa uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from empresa e
                 where e.id = p_empresa and e.consultoria_id = app_consultoria_id())
$$;

-- ===========================================================================
-- VÍNCULO usuário ↔ empresa (N:N, com perfil por vínculo) — deferido da Fase 0
-- ===========================================================================
create table usuario_empresa (
  usuario_id       uuid not null references usuario(id) on delete cascade,
  empresa_id       uuid not null references empresa(id) on delete cascade,
  perfil_acesso_id uuid references perfil_acesso(id) on delete set null,
  primary key (usuario_id, empresa_id)
);

-- ===========================================================================
-- ESTABELECIMENTO (matriz + filiais)  —  leiaute S-1005
-- ===========================================================================
create type tipo_unidade as enum ('matriz','filial');

create table estabelecimento (
  id             uuid primary key default gen_random_uuid(),
  empresa_id     uuid not null references empresa(id) on delete cascade,
  tipo_unidade   tipo_unidade not null default 'matriz',
  tipo_inscricao tipo_inscricao not null default 'cnpj',
  inscricao      text not null,
  apelido        text,
  cep            text, logradouro text, numero text, complemento text,
  bairro text, cidade text, uf char(2),
  ativo          boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index on estabelecimento(empresa_id);
create trigger trg_estab_updated before update on estabelecimento
  for each row execute function app_set_updated_at();

-- ===========================================================================
-- AMBIENTE (local físico de trabalho)
-- ===========================================================================
create table ambiente (
  id                 uuid primary key default gen_random_uuid(),
  estabelecimento_id uuid not null references estabelecimento(id) on delete cascade,
  nome               text not null,
  tipo               text not null default 'proprio',  -- proprio | terceiros
  inicio date, fim date,
  descricao          text,
  ativo              boolean not null default true,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index on ambiente(estabelecimento_id);
create trigger trg_ambiente_updated before update on ambiente
  for each row execute function app_set_updated_at();

-- ===========================================================================
-- FUNÇÃO / CARGO  —  CBO (S-2200)
-- ===========================================================================
create table funcao (
  id            uuid primary key default gen_random_uuid(),
  empresa_id    uuid not null references empresa(id) on delete cascade,
  nome          text not null,
  cbo           char(6),                       -- validado contra seed oficial CBO
  descricao     text,
  aso_periodicidade_meses smallint default 12, -- NR-7 (parametrizável)
  ativo         boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index on funcao(empresa_id);
create trigger trg_funcao_updated before update on funcao
  for each row execute function app_set_updated_at();

-- ===========================================================================
-- GHE — Grupo Homogêneo de Exposição (núcleo do mapeamento)
-- ===========================================================================
create type situacao_ghe as enum ('completo','incompleto');

create table ghe (
  id            uuid primary key default gen_random_uuid(),
  empresa_id    uuid not null references empresa(id) on delete cascade,
  referencia    text not null,
  numero        int not null default 1,
  processo      text,
  jornada       text,
  obs_geral     text,
  obs_pgr       text,
  obs_ltcat     text,
  obs_pcmso     text,
  situacao      situacao_ghe not null default 'incompleto',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index on ghe(empresa_id);
create trigger trg_ghe_updated before update on ghe
  for each row execute function app_set_updated_at();

-- ===========================================================================
-- EMPREGADO  —  S-2200 (dados pessoais sensíveis; LGPD)
-- ===========================================================================
create type situacao_empregado as enum ('ativo','afastado','demitido','transferido','excluido');

create table empregado (
  id                 uuid primary key default gen_random_uuid(),
  empresa_id         uuid not null references empresa(id) on delete cascade,
  estabelecimento_id uuid references estabelecimento(id) on delete set null,
  funcao_id          uuid references funcao(id) on delete set null,
  cpf                char(11) not null,
  matricula          text,
  nome               text not null,
  nome_social        text,
  nascimento         date,
  sexo               text,
  nis                text,
  categoria_esocial  text,                     -- Tabela 01 (ex.: '101')
  admissao           date,
  desligamento       date,
  situacao           situacao_empregado not null default 'ativo',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique (empresa_id, cpf),
  unique (empresa_id, matricula)
);
create index on empregado(empresa_id);
create index on empregado(funcao_id);
create trigger trg_empregado_updated before update on empregado
  for each row execute function app_set_updated_at();

-- ===========================================================================
-- CATÁLOGO DE RISCOS (3 camadas) + Tabela 24
-- camada: esocial (oficial, read-only) | consultoria | empresa
-- ===========================================================================
create type camada_risco as enum ('esocial','consultoria','empresa');

create table risco_catalogo (
  id              uuid primary key default gen_random_uuid(),
  camada          camada_risco not null,
  consultoria_id  uuid references consultoria(id) on delete cascade, -- null p/ camada esocial
  empresa_id      uuid references empresa(id) on delete cascade,     -- só p/ camada empresa
  nome            text not null,
  categoria       text not null,               -- Físico/Químico/Biológico/Ergonômico[sub]/Mecânico/…
  codigo_tabela24 text,                         -- código oficial do agente (eSocial)
  qualitativo     boolean not null default true,
  -- dados técnicos (medição/exposição)
  intensidade     text, limite_tolerancia text, metodo_medicao text,
  aposentadoria_especial boolean default false,
  tipo_exposicao  text,
  -- em quais documentos o risco aparece
  doc_lip boolean default false, doc_ltcat boolean default false,
  doc_pgr boolean default false, doc_pcmso boolean default false, doc_aep boolean default false,
  ativo           boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index on risco_catalogo(camada);
create index on risco_catalogo(consultoria_id);
create index on risco_catalogo(empresa_id);
create trigger trg_risco_updated before update on risco_catalogo
  for each row execute function app_set_updated_at();

-- ===========================================================================
-- Relações do GHE (N:N) e medidas de controle
-- ===========================================================================
create table ghe_ambiente (
  ghe_id      uuid not null references ghe(id) on delete cascade,
  ambiente_id uuid not null references ambiente(id) on delete cascade,
  primary key (ghe_id, ambiente_id)
);
create table ghe_funcao (
  ghe_id    uuid not null references ghe(id) on delete cascade,
  funcao_id uuid not null references funcao(id) on delete cascade,
  primary key (ghe_id, funcao_id)
);
create table ghe_empregado (
  ghe_id       uuid not null references ghe(id) on delete cascade,
  empregado_id uuid not null references empregado(id) on delete cascade,
  inicio date, fim date,
  primary key (ghe_id, empregado_id)
);
create table ghe_risco (
  ghe_id   uuid not null references ghe(id) on delete cascade,
  risco_id uuid not null references risco_catalogo(id) on delete cascade,
  primary key (ghe_id, risco_id)
);

create type tipo_medida as enum ('epi','exame','treinamento');
create table medida_controle (
  id         uuid primary key default gen_random_uuid(),
  ghe_id     uuid not null references ghe(id) on delete cascade,
  tipo       tipo_medida not null,
  descricao  text not null,                     -- ex.: 'Protetor auricular (CA 9876)', 'Audiometria'
  periodicidade_meses smallint,
  created_at timestamptz not null default now()
);
create index on medida_controle(ghe_id);

-- ===========================================================================
-- VENCIMENTO (derivado: item + tipo + data + status + natureza)
-- Alimentado por exames/EPIs/treinamentos/documentos. Tabela materializada
-- simples na Fase 1; vira cálculo/trigger nas fases seguintes.
-- ===========================================================================
create type natureza_venc as enum ('colaborador','acoes_programas');
create type tipo_venc as enum ('epi','exame','treinamento','programa');

create table vencimento (
  id            uuid primary key default gen_random_uuid(),
  empresa_id    uuid not null references empresa(id) on delete cascade,
  empregado_id  uuid references empregado(id) on delete cascade,
  natureza      natureza_venc not null,
  tipo          tipo_venc not null,
  item          text not null,
  data_prazo    date not null,
  responsavel_id uuid references usuario(id) on delete set null,
  concluido     boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index on vencimento(empresa_id, data_prazo);
create trigger trg_vencimento_updated before update on vencimento
  for each row execute function app_set_updated_at();

-- ===========================================================================
-- RLS — isolamento por tenant
-- ===========================================================================
alter table empresa          enable row level security;
alter table usuario_empresa  enable row level security;
alter table estabelecimento  enable row level security;
alter table ambiente         enable row level security;
alter table funcao           enable row level security;
alter table ghe              enable row level security;
alter table empregado        enable row level security;
alter table risco_catalogo   enable row level security;
alter table ghe_ambiente     enable row level security;
alter table ghe_funcao       enable row level security;
alter table ghe_empregado    enable row level security;
alter table ghe_risco        enable row level security;
alter table medida_controle  enable row level security;
alter table vencimento       enable row level security;

create policy empresa_rls on empresa
  using (consultoria_id = app_consultoria_id());

create policy usuario_empresa_rls on usuario_empresa
  using (app_empresa_na_consultoria(empresa_id));

create policy estab_rls on estabelecimento
  using (app_empresa_na_consultoria(empresa_id));

create policy ambiente_rls on ambiente
  using (exists (select 1 from estabelecimento e
                 where e.id = ambiente.estabelecimento_id
                   and app_empresa_na_consultoria(e.empresa_id)));

create policy funcao_rls on funcao
  using (app_empresa_na_consultoria(empresa_id));

create policy ghe_rls on ghe
  using (app_empresa_na_consultoria(empresa_id));

create policy empregado_rls on empregado
  using (app_empresa_na_consultoria(empresa_id));

-- riscos: camada esocial é visível a todos; consultoria/empresa isolados
create policy risco_rls on risco_catalogo
  using (
    camada = 'esocial'
    or consultoria_id = app_consultoria_id()
    or app_empresa_na_consultoria(empresa_id)
  );

create policy ghe_amb_rls on ghe_ambiente
  using (exists (select 1 from ghe g where g.id = ghe_ambiente.ghe_id
                 and app_empresa_na_consultoria(g.empresa_id)));
create policy ghe_fun_rls on ghe_funcao
  using (exists (select 1 from ghe g where g.id = ghe_funcao.ghe_id
                 and app_empresa_na_consultoria(g.empresa_id)));
create policy ghe_emp_rls on ghe_empregado
  using (exists (select 1 from ghe g where g.id = ghe_empregado.ghe_id
                 and app_empresa_na_consultoria(g.empresa_id)));
create policy ghe_risco_rls on ghe_risco
  using (exists (select 1 from ghe g where g.id = ghe_risco.ghe_id
                 and app_empresa_na_consultoria(g.empresa_id)));
create policy medida_rls on medida_controle
  using (exists (select 1 from ghe g where g.id = medida_controle.ghe_id
                 and app_empresa_na_consultoria(g.empresa_id)));

create policy vencimento_rls on vencimento
  using (app_empresa_na_consultoria(empresa_id));
