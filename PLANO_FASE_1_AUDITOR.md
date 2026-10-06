# Plano de Implementação — Fase 1 do Auditor Proteção RR

> Base: `HANDOFF_AUDITOR_ESOCIAL.md` (roadmap, seção 5). Escopo da Fase 1: **cadastro**
> (empresas, estabelecimentos, setores, cargos, empregados), **usuários e perfis de
> acesso**, **log de atividades** e **importação por planilha**. Tudo o mais (vencimentos,
> auditoria de eventos, documentos, envio ao eSocial) fica para as fases 2–6.

## 1. Stack proposta

- **Supabase** (Postgres + Auth + RLS + Storage): a conta já usa Supabase no
  agendamento-exames, o MCP já está conectado nas sessões do Claude, e RLS resolve o
  isolamento multiempresa no próprio banco.
- **Next.js 15 (App Router) + TypeScript**, publicado no Render (ou Vercel) em
  `esocial.protecaorr.net` — mesmo fluxo de DNS/CNAME já usado para
  `agendamento.protecaorr.net`.
- **UI**: Tailwind + shadcn/ui. Um componente genérico de listagem (filtro por empresa,
  busca, paginação, exportação CSV/Excel/PDF, coluna de ações) — o padrão que se repete
  em quase todas as telas do sistema de referência.
- Tipos do banco gerados por `supabase gen types typescript` para manter o front e o
  schema sempre alinhados.

Decisão pendente (registrar no `CLAUDE.md` do novo repo quando criado): repositório
próprio `Haroldo7777/auditor-protecaorr` e projeto Supabase dedicado (não reaproveitar o
do agendamento, para separar dados pessoais de trabalhadores do site público).

## 2. Modelo de dados da Fase 1

Campos-chave seguem os leiautes **eSocial S-1.3** (não o sistema de referência). Todas as
tabelas com `id uuid`, `created_at`, `updated_at`, e `consultoria_id` para o isolamento.

| Tabela | Campos principais | Referência S-1.3 |
|---|---|---|
| `consultoria` | razão social, CNPJ, logotipo, cor (identidade) | — |
| `usuario` | vínculo com `auth.users`, nome, e-mail, `perfil_acesso_id`, ativo | — |
| `perfil_acesso` | nome, descrição | — |
| `permissao` + `perfil_permissao` | chave (`empresas.ler`, `empregados.editar`, …) | — |
| `usuario_empresa` | quais empresas cada usuário enxerga (opcional: NULL = todas) | — |
| `empresa` | razão social, nome fantasia, CNPJ/CPF/CAEPF (`tpInsc`/`nrInsc`), CNAE preponderante, situação (liberado/bloqueado), tipo de contrato (gestão, só treinamentos, via link), data de inclusão | S-1000 |
| `estabelecimento` | empresa, `tpInsc`/`nrInsc` (CNPJ do estabelecimento ou CAEPF/CNO), apelido | S-1005 |
| `setor` | empresa/estabelecimento, nome, descrição | lotação (S-1020 simplificado) |
| `cargo` | empresa, nome, **CBO (6 dígitos)**, descrição | S-2200/S-2206 `infoContrato` |
| `ghe` | empresa, nome, descrição (só o cadastro; exposições ficam p/ Fase 3/4) | — |
| `empregado` | empresa, estabelecimento, **CPF**, **matrícula**, nome, data de nascimento, sexo, data de admissão, data de desligamento, categoria do trabalhador (Tabela 01), setor, cargo, GHE, situação (ativo/desligado/afastado) | S-2200 |
| `log_atividade` | usuário, ação, tabela/registro, dados antes/depois (jsonb), IP, timestamp | — |
| `importacao` | arquivo, tipo (empresas/empregados), status, total de linhas, erros (jsonb) | — |

Regras de validação desde o início (é um *auditor* — o cadastro já nasce auditado):
- CPF e CNPJ com dígito verificador; CPF único por empresa; matrícula única por empresa.
- CBO validado contra a tabela oficial (seed estática em `db/seeds/cbo.csv`).
- Categoria do trabalhador validada contra a Tabela 01 do eSocial (seed).
- Datas coerentes (admissão ≥ nascimento + 14 anos, desligamento ≥ admissão).

## 3. Autenticação e permissões

- **Supabase Auth** (e-mail + senha, convite por e-mail). Nada de credenciais embutidas
  no HTML como no agendamento — aqui há dados pessoais (LGPD).
- RBAC em duas camadas:
  1. **RLS no Postgres**: toda tabela filtra por `consultoria_id` do usuário logado
     (claim no JWT); `usuario_empresa` restringe por empresa quando preenchido.
  2. **Permissões por perfil** na aplicação: perfis iniciais `Administrador`,
     `Técnico SST`, `Operacional (somente leitura)`.
- Ações de admin: convidar usuário, reenviar convite, trocar perfil, desativar.

## 4. Log de atividades

Trigger genérico de auditoria no Postgres (INSERT/UPDATE/DELETE → `log_atividade` com
`row_to_json` antes/depois), mais registro de login/logout via hook do Auth. Tela
"Registro de atividades" com filtros por usuário, tabela e período.
**LGPD**: o log guarda CPF mascarado (`***.456.789-**`) nos snapshots exibidos.

## 5. Importação por planilha

- Modelo `.xlsx` para download (uma aba empresas, uma aba empregados) com as colunas do
  schema e instruções na primeira linha.
- Upload → parse no servidor → **pré-visualização com validação linha a linha** (mesmas
  regras da seção 2) → usuário confirma → upsert transacional (chave: CNPJ para empresa,
  empresa+CPF para empregado).
- Relatório de importação: N importadas, N atualizadas, N rejeitadas com motivo por linha.
- É assim que os dados atuais das 60 empresas / 1.084 empregados entram no auditor sem
  digitação manual.

## 6. Telas da Fase 1

1. Login / convite / troca de senha.
2. **Empresas**: lista (busca por nome, CNPJ, CPF de empregado, ID; filtros situação e
   tipo), formulário, importar, exportar.
3. **Contexto da empresa** (equivalente ao "Acessar"): abas Estabelecimentos, Setores,
   Cargos, GHE, Empregados.
4. **Empregados**: lista global (todas as empresas) e por empresa; formulário completo;
   admissão/desligamento muda a situação (alimentará "movimentações de vidas" na Fase 2).
5. **Usuários** e **Perfis de acesso**.
6. **Registro de atividades**.
7. Dashboard mínimo: contadores de empresas ativas e empregados ativos (os demais
   indicadores dependem das fases 2–3).

## 7. Ordem de execução

| Etapa | Entrega | Depende de |
|---|---|---|
| 1 | Repo novo + projeto Supabase + Next.js esqueleto + deploy vazio em `esocial.protecaorr.net` | decisão do item 1 |
| 2 | Migrations do schema (seção 2) + seeds (CBO, Tabela 01) + RLS | 1 |
| 3 | Auth + usuários + perfis + RLS testada com 2 usuários de consultoria | 2 |
| 4 | CRUD empresas/estabelecimentos + componente genérico de listagem | 3 |
| 5 | CRUD setores/cargos/GHE/empregados (contexto da empresa) | 4 |
| 6 | Log de atividades (trigger + tela) | 3 |
| 7 | Importação por planilha + carga real das 60 empresas | 5 |
| 8 | Exportações (CSV/Excel/PDF) + dashboard mínimo | 5 |

Critério de aceite da fase: as 60 empresas e 1.084 empregados importados e conferidos,
2+ usuários com perfis distintos operando, toda alteração aparecendo no log.

## 8. Fora da Fase 1 (não deixar escopo vazar)

Vencimentos (Fase 2), eventos S-22xx e qualquer leitura de XML (Fase 3), documentos
PGR/PCMSO/PPP (Fase 4), ASO/treinamentos/EPI (Fase 5), certificado digital, assinaturas
e faturamento (Fase 6). A única concessão à Fase 3 é manter `ghe` e os campos de
categoria/CBO já corretos, porque retrabalhar cadastro depois é caro.

## 9. Pré-requisitos antes de codar (dos "próximos passos" do handoff)

- [ ] Criar repositório `auditor-protecaorr` e projeto Supabase dedicado.
- [ ] Baixar leiautes S-1.3 (S-2210/2220/2221/2240 + tabelas 01 e 24) para `docs/leiautes/`.
- [ ] Mapear os formulários internos com a empresa de teste "teste HAROLDO ARAUJO"
      (necessário só a partir da etapa 5; as etapas 1–4 não dependem disso).
- [ ] Conferir os termos de uso do eSocial Brasil quanto a engenharia reversa.
