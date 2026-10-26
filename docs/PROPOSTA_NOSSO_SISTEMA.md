# Proposta — Nosso Sistema de Gestão de SST & eSocial (Proteção RR)

> **Base:** `docs/ESTRUTURA_REFERENCIA.md` (mapeamento do sistema de referência, feito por
> navegação) + `docs/ESTRUTURA_BANCO_ATUAL.md` (estrutura do banco que a Proteção RR já tem
> no Supabase) + `HANDOFF_AUDITOR_ESOCIAL.md`.
>
> **Regra inegociável:** UI, código e schema **próprios**. Não copiamos código, layout,
> textos, imagens nem marca de terceiros. Dados pessoais nunca entram em seeds/testes.
>
> ⚠️ **Este documento é uma proposta para aprovação.** Nada será implementado antes do
> seu "pode começar".

---

## 1. Objetivo e escopo

Construir uma plataforma própria, multiempresa, para a consultoria gerir SST das empresas
clientes e os eventos de SST do eSocial, cobrindo (em fases):

- Cadastro multiempresa (Consultoria → Empresa → Estabelecimento → Ambiente).
- **GHE** (Grupo Homogêneo de Exposição) como núcleo: ambientes, funções, empregados, riscos e medidas.
- Empregados (ficha completa) e conformidade (EPI, exames, treinamentos).
- Catálogo de riscos em 3 camadas (eSocial/consultoria/empresa) + Tabela 24.
- Motor único de **vencimentos**.
- Medicina (ASO), documentos/programas (PGR, PCMSO, LTCAT…), EPI, treinamentos, CIPA, auditoria.
- **Eventos eSocial** S-2210/2220/2221/2240 (com certificado A1), assinatura digital, API, relatórios.

O detalhamento funcional de cada módulo está na `ESTRUTURA_REFERENCIA.md` (seções 5 e 10).

## 2. Arquitetura proposta (stack)

| Camada | Escolha | Por quê |
|---|---|---|
| Banco + Auth + Storage | **Supabase** (Postgres + RLS + Auth + Storage) | Multi-tenant por RLS (policy por `consultoria_id`/`empresa_id`); a conta já usa Supabase; Storage para PDFs/fotos/certificados |
| Backend/API | **Next.js (App Router) + Server Actions / Route Handlers** em TypeScript | RBAC aplicado no servidor (não só escondendo menu); SSR para telas pesadas |
| Front-end | **React (Next.js) + Tailwind + shadcn/ui** | Componentes reutilizáveis; o padrão de listas/forms/wizards se repete muito |
| Publicação | **Render** (ou Vercel) em `esocial.protecaorr.net` | Mesmo fluxo de deploy já usado |
| Geração de PDF | Lib server-side (ex.: `@react-pdf` ou HTML→PDF) | ASO, fichas, laudos, relatórios |

**Decisões de arquitetura que vêm do referência (seção 9 e 11):**
- **Multi-tenant com 2 contextos** (consultoria × empresa) e **impersonação** por claim de
  "empresa ativa" + auditoria + botão "Voltar à Consultoria" (nunca troca real de credencial).
- **RBAC módulo × ação (CRUD)**, com perfis padrão (read-only) + customizados e vínculo
  **N:N usuário↔empresa** com perfil por vínculo. Enforcement no backend via RLS + checagem de permissão.
- **GHE como agregado central**; o empregado **herda** riscos/exigências do GHE ("Aplicar GHE" = commit).
- **Motor único de vencimentos** alimentando dashboard e alertas.
- **Periodicidades parametrizáveis por tenant** (NR-7, validade de treinamento, troca de EPI,
  vigência de documento) — nunca hardcoded.
- **LGPD por arquitetura** (dado de saúde = sensível): cripto em trânsito/repouso, trilha de
  auditoria por entidade, mínimo acesso por perfil, retenção/exclusão.

## 3. Estrutura de pastas (Next.js)

```
esocial-protecaorr/
├─ app/
│  ├─ (auth)/login, /convite, /recuperar-senha
│  ├─ (consultoria)/                 # portal da consultoria (clinica.)
│  │   ├─ dashboard, empresas, documentos/[tipo], treinamentos,
│  │   ├─ medicina, vencimentos, riscos, usuarios, permissoes, configuracoes…
│  ├─ (empresa)/[empresaId]/         # portal do cliente / contexto da empresa
│  │   ├─ dashboard, empresa/(ambientes|ghe|funcoes), empregados/[id],
│  │   ├─ documentos, medicina, epi, treinamentos, cipa, auditoria, vencimentos…
│  └─ api/                            # route handlers (eSocial, PDF, webhooks)
├─ components/                        # ui própria (tabelas, filtros, wizard, cards, modais)
├─ lib/                               # supabase client, rbac, validações (CPF/CNPJ/CBO), vencimentos
├─ db/
│  ├─ migrations/                     # SQL versionado (schema + RLS + policies)
│  └─ seeds/                          # catálogos oficiais (Tabela 24, CBO, CID) — nunca dados pessoais
└─ docs/                              # estes documentos de referência
```

## 4. Rotas e telas (resumo — detalhe nas seções 2, 3 e 10 da referência)

- **Portal da consultoria:** dashboard, empresas (+ "Acessar"=impersonar), documentos
  (AEP/AET/DIR/LIP/LTCAT/PCA/PCMSO/PGR/PPR + modelos/fichas MEI/inventário/equipamentos),
  treinamentos, medicina, drive, relatórios, vencimentos, API, financeiro, catálogo de riscos,
  gerenciar cadastro (parceiros/RTs), usuários, permissões (perfis + matriz), configurações,
  movimentações de vidas.
- **Portal da empresa:** dashboard, empresa (ambientes/estabelecimentos, GHE, funções),
  empregados (ativos/afastados/demitidos/transferidos/excluídos + ficha 5 abas + Mensageria eSocial),
  documentos (legais/plano de ação/OS/psicossocial/APR/CAT/PPP/PT/PET), treinamentos, medicina
  (ASO/toxicológico/tipos/clínicas), EPI (ficha/estoque/custos/solicitações/empréstimos), CIPA,
  auditoria/checklist, catálogo de riscos, drive, relatórios, vencimentos, financeiro.

## 5. Modelo de dados — schema inicial (Fases 0–1)

Todas as tabelas: `id uuid`, `created_at`, `updated_at`, e coluna de tenant
(`consultoria_id` e/ou `empresa_id`) com **RLS** por tenant. Campos conforme leiautes S-1.3
onde aplicável.

**Fase 0 — Fundação**
- `consultoria` (razão social, CNPJ, identidade: cor/logo — white-label)
- `usuario` (vínculo `auth.users`, nome, email, celular, tipo: consultoria/empresa/empregado/…)
- `perfil_acesso` (nome, descrição, tipo de usuário)
- `permissao` (perfil × módulo × ação VER/CRIAR/EDITAR/EXCLUIR)
- `usuario_empresa` (N:N usuário↔empresa, com `perfil_acesso_id` por vínculo)
- `log_atividade` (usuário, ação, entidade, entidade_id, dados antes/depois jsonb, ip, ts)

**Fase 1 — Núcleo SST**
- `empresa` (CNPJ/CPF/CAEPF/CNO, razão/fantasia, inscrições, `cnaes[]`, `grau_risco` 1–4, endereço, situação)
- `estabelecimento` (empresa, matriz/filial, inscrição, endereço)
- `ambiente` (estabelecimento, nome, tipo próprio/terceiros, início/fim, descrição)
- `funcao` (empresa, nome, **CBO**, descrição)
- `ghe` (empresa, referência, número, processo, jornada, observações PGR/LTCAT/PCMSO, situação)
- `ghe_ambiente`, `ghe_funcao`, `ghe_empregado` (N:N, com datas onde aplicável)
- `empregado` (empresa, estab., **CPF**, matrícula, nome, nascimento, NIS, categoria eSocial
  Tabela 01, função/CBO, status ativo/afastado/demitido/transferido/excluído)
- `risco_catalogo` (camada eSocial/consultoria/empresa, nome, categoria, **código Tabela 24**,
  qualitativo, dados técnicos de medição/exposição, flags por documento LIP/LTCAT/PGR/PCMSO/AEP)
- `ghe_risco` (GHE × risco)
- `medida_controle` (GHE: EPI | exame | treinamento exigido)
- `vencimento` (view/tabela derivada: item + tipo + data + status + natureza colaborador/ações)

Seeds oficiais (sem dado pessoal): **Tabela 24** (agentes nocivos), **CBO**, **Tabela 01**, **CID**.

As fases seguintes (Medicina/ASO → S-2220; Documentos/Programas; eSocial S-22xx; EPI;
Treinamentos; CIPA; Auditoria; Portal do cliente/API) seguem o recorte da seção 11.1 da referência.

## 6. Ordem de implementação (MVP primeiro)

Adotando o recorte da referência (seção 11.1), validando cada fase com você:

| Fase | Entrega | Observação |
|---|---|---|
| **0. Fundação** | Supabase + Auth + multi-tenant + RBAC (módulo×ação) + impersonação + log + white-label | base de tudo |
| **1. Núcleo SST** | Empresas/Estab./Ambientes → **GHE (wizard 5 etapas)** → Funções → Empregados (ficha 5 abas) → Catálogo de riscos 3 camadas + Tabela 24 → **motor de vencimentos** | o coração; é o MVP |
| **2. Medicina + Documentos base** | Tipos de exame (A/P/D/RT/MR), ASO; geração de PGR e PCMSO (capa/metadados/vigência→PDF) | — |
| **3. eSocial** | S-2210/2220/2221/2240, certificado A1, Mensageria, protocolo/retificação | leiautes oficiais gov.br |
| **4. Complementos** | EPI (CA/estoque/ficha+assinatura), Treinamentos (turmas/certificados), CIPA, Auditoria, demais laudos, PPP, psicossocial, CAT | — |
| **5. Abertura** | Portal do cliente (visão restrita + impersonação), API por tokens, relatórios, financeiro/vidas | — |

**Critério de MVP (Fases 0–1):** uma consultoria com 2 usuários de perfis distintos consegue
cadastrar empresa → estabelecimento → ambiente → GHE (com riscos/medidas) → empregados, e ver
os vencimentos e a conformidade — tudo com dados fictícios, RBAC aplicado e log registrando.

## 7. Decisões que preciso de você (antes de começar)

1. **Banco de dados:** recomendo **criar um projeto Supabase novo e limpo** para este app
   (ex.: `esocial-app`), com o schema acima — sem dados reais. O seu `auditor-protecaorr`
   atual é um produto diferente (auditoria de campo) e fica intacto. **Confirma criar o projeto novo?**
   (Alternativas: reaproveitar um projeto existente, ou só montar o schema sem criar projeto agora.)
2. **Front-end:** migramos de uma vez para **Next.js** (recomendado, para ser o sistema de
   verdade), ou manter o protótipo HTML atual enquanto o Next.js é montado em paralelo?
3. **Escopo do MVP:** confirmamos **Fases 0 + 1** como primeira entrega? (É o coração; o resto vem depois.)
4. **Catálogos oficiais:** você fornece/valida os valores (periodicidades NR-7, validades de
   treinamento, etc.) que entram como configuração por tenant?

## 8. LGPD (requisito, não opcional)

Dados de saúde de trabalhador são **dado pessoal sensível** (art. 11, LGPD). O app terá: cripto
em trânsito e repouso, trilha de auditoria por entidade, acesso mínimo por perfil, política de
retenção/exclusão, base legal e termos operador×controlador com as empresas clientes. Em
desenvolvimento: **apenas dados fictícios** e **nunca** transmissão ao eSocial real (usar ambiente de testes do governo).

---

*Aguardando sua aprovação das decisões da seção 7 para iniciar a Fase 0. Nada será construído antes disso.*
