# Estrutura de Referência — Sistema de SST existente (Proteção RR)

> **Fonte:** estrutura do banco Supabase `auditor-protecaorr` (projeto `irrtplwguiqvkckecdfp`,
> org ProteçãoRR), lida em 26/10/2026. **Apenas metadados** (tabelas, colunas, tipos,
> chaves, checks, comentários). **Nenhum dado de linha foi lido** — nada de dados
> pessoais de trabalhadores (LGPD).
>
> Este documento é a referência de **arquitetura** para o nosso sistema. Não copiamos
> código, textos, imagens ou marca de terceiros — a referência aqui é o **modelo de
> dados do próprio sistema da Proteção RR**.

---

## ⚠️ Descoberta importante (leia primeiro)

O banco que a Proteção RR **já usa hoje** NÃO é o sistema centrado em eventos do eSocial
descrito no `HANDOFF_AUDITOR_ESOCIAL.md`. É um sistema **já construído e em uso** de
**gestão e auditoria de campo de SST** para consultoria multiempresa, com foco em:

- **Auditoria de campo** (visitas geolocalizadas, fotos) e **não conformidades** com
  enquadramento em NR, **multa estimada (NR-28)** e **apoio de IA** no enquadramento;
- **Avaliação de risco** (PGR/GHE) com matriz de risco 5×5;
- **Riscos psicossociais** (questionários por link/token);
- **Conformidade documental por empregado** (ASO/EPI/treinamento × validade);
- **Certificados de treinamento** (emissão com verificação pública);
- **Gestão de contrato, implantação, cronograma e plano mensal** por empresa.

**NÃO existem** neste banco: tabelas de eventos eSocial (S-2210/2220/2221/2240),
protocolos/recibos, XML; nem as entidades do plano da Fase 1 com aqueles nomes
(`consultoria`, `usuario`, `perfil_acesso`, `estabelecimento`, `setor`, `cargo`,
`empregado`, `evento_esocial`); nem catálogos oficiais CBO / CID / Tabela 01 / Tabela 24.
"Setor" existe só como **coluna texto**; "cargo/função" é a tabela `funcoes`.

Implicação: o nosso sistema (`esocial.protecaorr.net`) e este banco são, hoje, **coisas
diferentes**. A decisão de direção está no fim deste documento.

---

## 1. Visão geral

- **46 tabelas**, todas no schema `public`.
- **Multiempresa (multi-tenant):** sim — isolamento por **`empresa_id`** (FK → `empresas.id`),
  presente em 18 tabelas. A raiz do tenant é **`empresas`** (a empresa cliente/auditada).
  **Não há tabela `consultoria`** — a consultoria é a instância única do app.
- **Autenticação/RBAC:** **Supabase Auth**. `profiles.id = auth.users.id`; o papel vem do
  enum **`perfil_usuario`** (default `cliente`) + **`permissoes jsonb`** em `profiles`
  (RBAC por papel + jsonb, não por tabelas separadas de perfil/permissão).
- **RLS habilitada em 100% das tabelas** (46/46).
- **IA embutida no domínio:** enquadramento de NC em NR, plano de ação psicossocial,
  dicionário de sinônimos, loop de feedback (NR sugerida × final).

## 2. Domínios funcionais

### A. Empresas & estrutura organizacional
- **`empresas`** — raiz do tenant (empresa cliente/auditada; suporta matriz/filial via
  `matriz_id → empresas.id`). Campos-chave: `razao_social`, `nome_fantasia`, `cnpj`,
  `documento`+`tipo_documento` (CHECK cnpj|caepf|cpf), endereço, `cnae` (texto),
  `grau_risco` (1–4, NR-04), `tecnico_padrao_id → profiles`, periodicidade de visitas/DDS.
- **`responsaveis`** — contatos por empresa (`empresa_id`, nome, email, telefone, cargo).
- **`funcoes`** — funções/cargos por empresa, com `aso_periodicidade_meses` (default 12).
- **`funcao_modelos`** — modelos reutilizáveis de função (arrays `treinamento_ids[]`, `epi_ids[]`).

### B. Usuários & acesso (RBAC)
- **`profiles`** — usuários do app (estende `auth.users`): `perfil` (enum), `empresa_id`
  (cliente vinculado), `ativo`, `permissoes jsonb`.

### C. Funcionários (trabalhadores das empresas clientes)
- **`funcionarios`** — `empresa_id`, `funcao_id`, nome, cpf, nascimento, admissão,
  `ativo`, `desligado_em`. (Dados pessoais — não lidos.)

### D. Auditoria de campo & não conformidades (núcleo do "Auditor" atual)
- **`auditorias`** — visitas/inspeções geolocalizadas (`auditor_id`, `status`, lat/long,
  `coparticipantes uuid[]`, `efetivo_atual`).
- **`auditoria_participantes`** — M:N auditoria × profile.
- **`nao_conformidades`** — achados: `criticidade`, `status`, `classificacao`, foto antes/depois,
  lat/long, enquadramento `nr_codigo`/`item_codigo`, **multa (NR-28)** `multa_grau` (1–4),
  matriz de risco `risco_severidade`/`risco_exposicao` (1–5), e campos de **IA**
  (`observacao_ia`, `item_sugerido`, `item_confianca`, `item_justificativa`).
- **`prazos`** — prazos por NC. **`relatorio_envios`** — relatórios versionados por canal.
- **`enquadramento_feedback`** — trilha de aprendizado da IA (NR sugerida × final).

### E. Catálogo normativo (NRs) & dicionário
- **`normas`** + **`itens_norma`** (estrutura oficial NR×item — vazias).
- **`normas_customizadas`** (371 linhas — catálogo de itens de NR em uso no enquadramento).
- **`sinonimos_sst`** — dicionário de sinônimos (apoio a busca/IA).

### F. Avaliação de riscos (PGR / GHE)
- **`avaliacoes_risco`** (por empresa) → **`ghe`** (Grupos Homogêneos de Exposição) →
  **`riscos`** (por GHE × agente; matriz 5×5 com `nivel` calculado 1–25).
- **`agentes_risco`** — catálogo de agentes nocivos (51 linhas; `categoria` enum, flag `global`)
  — equivalente funcional mais próximo da Tabela 24, mas **sem código oficial**.
- **`avaliacao_envios`** — relatórios de risco versionados.

### G. Riscos psicossociais
- **`psico_avaliacoes`** (por empresa; `token` p/ link público, `plano_acao_ia`) →
  **`psico_respostas`** → **`psico_itens`**; **`psico_convidados`** (fluxo por token);
  **`psico_envios`** (relatórios).

### H. Conformidade documental por empregado
- **`auditorias_doc`** (sessão por empresa) → **`auditoria_doc_itens`** (ASO/EPI/treinamento ×
  validade por funcionário; 966 linhas) → **`doc_itens_log`** (trilha imutável de status).
- **`doc_itens_extra`** — tipos de item documental extra por empresa.

### I. Treinamentos, EPI & certificados
- **`treinamentos_catalogo`**, **`epis_catalogo`** (por empresa ou globais).
- **`funcao_treinamentos`**, **`funcao_epis`** — M:N função × requisito.
- **`certificados`** (174 linhas; `token` de verificação pública, `assinantes jsonb`),
  **`certificado_profissionais`**, **`certificado_config`** (singleton de estilo).

### J. Contrato, implantação, cronograma & ações
- **`contrato_obrigacoes`** (metas contratuais por empresa), **`implantacao_etapas`**,
  **`implantacao_historico`** (nível mensal), **`planos_mensais`** (plano por técnico/mês),
  **`acoes`** (atividades/DDS), **`dds_participantes`** (M:N), **`cronograma_tarefas`**.

### K. Configuração & logs
- **`app_config`** (singleton tema/modo), **`logs`** (trilha genérica usuário/ação/entidade,
  8.544 linhas).

## 3. Relacionamentos-chave
- **Tudo pendura em `empresas.id`** (18 FKs `empresa_id`), + auto-ref `empresas.matriz_id`.
- **`profiles.id`** = quem executa/possui (auditor, técnico, autor) e `= auth.users.id`.
- **`funcionarios.id`** = trabalhador alvo (itens documentais, certificados, psicossocial, DDS).
- **`auditorias.id`** → não conformidades → prazos; **`avaliacoes_risco.id`** → GHE → riscos;
  **`funcoes.id`** → requisitos de treinamento/EPI.

## 4. Catálogos / tabelas "oficiais"
- NR: `normas`/`itens_norma` (vazias) e `normas_customizadas` (em uso).
- Agentes nocivos: `agentes_risco` (papel próximo da Tabela 24, sem código oficial).
- **Ausentes:** CBO, CID, Tabela 01, Tabela 24 oficial. `cnae` e `grau_risco` são colunas, não catálogos.

## 5. Observações de arquitetura
- PKs `uuid` (default `gen_random_uuid()`); junções M:N com PK composta; singletons com CHECK `id=1`.
- Multi-tenant por `empresa_id` + RLS total (padrão consistente).
- Soft-delete por `ativo bool` e `arquivada_em` (não há `deleted_at` genérico);
  `funcionarios.desligado_em`.
- Trilha: tabela `logs` genérica + `doc_itens_log` + `enquadramento_feedback`;
  `criado_em`/`atualizado_em` quase universais.
- Enums Postgres para alguns status; muitos outros status são `text` com default.
- `jsonb` para permissões (`profiles.permissoes`), estilos de certificado e metadados de log.
- Matriz de risco 5×5, grau de risco (NR-04) e grau de multa (NR-28) via CHECK constraints.
- **IA no domínio** (enquadramento de NC, plano de ação psicossocial).
- **Geolocalização + fotos de campo** (`auditorias`, `nao_conformidades`; bucket `fotos-auditoria`).
- Sinais de **integração externa** (`empresas.origem`/`sincronizado_em`, `cronograma_tarefas.origem`).

---

## Parte funcional (do fornecedor eSocial Brasil — só referência de função)

Capturado por navegação do Haroldo (não por este banco), em `HANDOFF_AUDITOR_ESOCIAL.md`,
`docs/referencias/modulo-empresas.md` e prints. Cobre o que o fornecedor faz: menu da
consultoria e o menu do portal da empresa, lista de empresas (cota por empregados,
modalidades, Instalação Inicial em 5 etapas), Gestão de Vencimentos (visões/filtros),
eventos S-2210/2220/2221/2240 por status, e Segmentações/GHE. Serve de referência de
**fluxo e tela** — não de código.

---

## Decisão de direção pendente (para o `PROPOSTA_NOSSO_SISTEMA.md`)

O "nosso sistema" precisa ser definido em relação ao que **já existe**:

1. **Nova interface para o sistema que já existe** (`auditor-protecaorr`): reconstruir o
   front-end (`esocial.protecaorr.net`) ligado a ESTE banco e schema. Reaproveita tudo o que
   já foi feito; não é "começar do zero".
2. **Sistema novo com a MESMA estrutura, banco limpo** (sem os dados): copiar o schema para
   um projeto novo e desenvolver sem risco e sem dados reais, decidindo depois sobre migração.
3. **Estender o escopo**: adicionar a camada de **eventos eSocial** (S-2210/2220/2240,
   protocolos) que o handoff descreve e que hoje **não existe** no banco — como módulo novo
   sobre a base atual.

A escolha define a stack, as rotas e a ordem de implementação.
