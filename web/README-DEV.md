# protecaorr-sstapp — app Next.js (Auditor eSocial / SST)

App web do nosso sistema próprio, construído conforme `docs/PROPOSTA_NOSSO_SISTEMA.md`.
Stack: **Next.js 15 (App Router) + TypeScript + Supabase + Tailwind**.

## Estado atual — Fase 0 (fundação)

✅ Esqueleto do Next.js que **compila** (`npm run build` ok)
✅ Integração Supabase (cliente/servidor/middleware de sessão)
✅ Login (e-mail + senha) e proteção de rotas
✅ Validações oficiais (CPF/CNPJ) e helper de RBAC
✅ Dashboard base (placeholders dos módulos da Fase 1)
✅ Migration SQL da Fase 0 (`supabase/migrations/0001_fase0_fundacao.sql`):
   multiempresa (consultoria), usuários, perfis/permissões (RBAC módulo×ação),
   vínculo usuário↔perfil, log de atividades — **com RLS por tenant**

> O banco **ainda não está no ar**. O projeto Supabase `protecaorr-sstapp` será
> criado quando a org passar para o plano Pro (momento do lançamento). Até lá,
> este código fica pronto para conectar.

## Como rodar (quando o banco existir)

1. Criar o projeto Supabase `protecaorr-sstapp` (org ProteçãoRR, região sa-east-1).
2. Aplicar as migrations: no painel do Supabase (SQL Editor) ou via CLI
   (`supabase db push`), rodar os arquivos de `supabase/migrations/` em ordem.
3. Copiar `.env.example` para `.env.local` e preencher com a URL e as chaves do projeto
   (Project Settings → API).
4. Instalar e rodar:
   ```bash
   cd web
   npm install
   npm run dev      # http://localhost:3000
   ```
5. Criar a primeira consultoria + usuário admin (seed/bootstrap — script a definir na Fase 0.1).

## Scripts

- `npm run dev` — desenvolvimento
- `npm run build` — build de produção (faz typecheck)
- `npm run typecheck` — só os tipos
- `npm run lint` — lint

## Estrutura

```
web/
├─ app/                 # rotas (App Router): /login, /dashboard …
├─ lib/
│  ├─ supabase/         # client (browser), server, middleware de sessão
│  ├─ rbac.ts           # permissões (módulo × ação)
│  └─ validators.ts     # CPF/CNPJ/CBO
├─ middleware.ts        # renova sessão + protege rotas
└─ supabase/migrations/ # SQL versionado (schema + RLS)
```

## Próximos passos (Fase 1 — núcleo SST)

Empresas/Estabelecimentos/Ambientes → **GHE (wizard 5 etapas)** → Funções →
Empregados (ficha 5 abas) → Catálogo de riscos (3 camadas + Tabela 24) →
motor de vencimentos. Migrations em `0002_fase1_nucleo_sst.sql` (a criar).

> Observação: o protótipo estático antigo (`index.html` na raiz) continua
> publicado em `esocial.protecaorr.net` e serve de **referência visual**; será
> substituído por este app Next.js quando o banco entrar no ar.
