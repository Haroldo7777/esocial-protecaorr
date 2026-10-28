# Checklist de Lançamento — Auditor eSocial / SST (esocial.protecaorr.net)

Passo a passo para colocar o app Next.js no ar com o banco real. Tudo o que o
app precisa já está no repositório; falta conectar banco, carregar dados, criar
o primeiro acesso e publicar.

> Diretório do app: `web/`. Migrations: `web/supabase/migrations/`. Seeds:
> `web/supabase/seeds/`. Scripts: `web/scripts/`.

---

## 0. Pré-requisitos
- [ ] Node 18+ e `npm` (para rodar os scripts e o build).
- [ ] `psql` instalado **ou** acesso ao SQL Editor do Supabase.
- [ ] Conta Supabase com a org **ProteçãoRR**.
- [ ] Conta na **Vercel** (ou Render) para o deploy.
- [ ] Acesso ao DNS de `protecaorr.net` (HostGator) para o CNAME.

## 1. Banco Supabase
- [ ] Criar o projeto **`protecaorr-sstapp`** (org ProteçãoRR, região `sa-east-1`).
      Exige o plano que permita um 3º projeto ativo (o upgrade adiado).
- [ ] Anotar, em **Project Settings → API**: `URL`, `anon key`, `service_role key`.
- [ ] Anotar, em **Project Settings → Database**: a *connection string* (URI).

## 2. Migrations + seed oficial
```bash
cd web
export DATABASE_URL='postgresql://postgres:SENHA@db.SEU-PROJETO.supabase.co:5432/postgres'
bash scripts/aplicar-banco.sh --seed-esocial
```
Isso roda `0001`…`0008` e carrega os **919 riscos da Tabela 24** (camada eSocial).
- [ ] Migrations aplicadas (0001 → 0008).
- [ ] `riscos_esocial.sql` carregado (catálogo oficial, somente leitura).
> Sem `psql`? Rode os arquivos na ordem pelo **SQL Editor** do Supabase:
> todas as migrations `0*.sql`, depois `seeds/riscos_esocial.sql`.

## 3. Variáveis de ambiente do app
- [ ] `web/.env.local` a partir de `web/.env.example`, preenchendo
      `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` e
      `SUPABASE_SERVICE_ROLE_KEY` (as duas públicas vão também na Vercel; a
      service_role **nunca** no cliente).

## 4. Onboarding — consultoria + admin
Cria o usuário no Auth, a consultoria, os perfis padrão (Administrador, Técnico
SST, Operacional) e vincula o admin:
```bash
cd web
export NEXT_PUBLIC_SUPABASE_URL='https://SEU-PROJETO.supabase.co'
export SUPABASE_SERVICE_ROLE_KEY='...'
node scripts/onboarding.mjs \
  --razao "H DE ARAUJO MARREIRO DE SOUZA LTDA" \
  --cnpj "00000000000000" \
  --nome "Haroldo" \
  --email "haroldo@protecaorr.net" \
  --senha "DEFINA_UMA_SENHA_FORTE"
```
- [ ] Consultoria criada e login do admin funcionando em `/login`.

## 5. Seed por consultoria (depois do onboarding)
```bash
bash scripts/aplicar-banco.sh --seed-consultoria
```
Carrega os **10 tipos de exame** e o risco próprio da consultoria para **cada**
consultoria existente (idempotente).
- [ ] Exames aparecem em Medicina → Tipos de exame.

## 6. Deploy (Vercel)
- [ ] Importar o repo `Haroldo7777/esocial-protecaorr` na Vercel.
- [ ] **Root Directory = `web`** (o app não está na raiz).
- [ ] Definir as env vars (as `NEXT_PUBLIC_*` e a `SUPABASE_SERVICE_ROLE_KEY`).
- [ ] Build command `npm run build` (padrão Next.js). Deploy.

## 7. Domínio
- [ ] Na Vercel, adicionar o domínio `esocial.protecaorr.net`.
- [ ] No HostGator, apontar o **CNAME** de `esocial` conforme a Vercel indicar
      (substitui o apontamento atual para o Render, que serve a página estática).
- [ ] Validar HTTPS e o acesso.

## 8. Verificação pós-deploy
- [ ] Login do admin OK; menu completo visível.
- [ ] Catálogo de Riscos mostra a Tabela 24 (aba eSocial, 919 itens).
- [ ] Criar 1 empresa, 1 função, 1 GHE, 1 empregado (fluxo de cadastro).
- [ ] Registrar 1 ASO e ver o vencimento no painel.
- [ ] Auditoria lista achados coerentes.
- [ ] Configurações → Identidade salva cor/logo.

---

## Pendências conhecidas (pós-lançamento)
- **Convite de usuários por e-mail** (Supabase Auth: invite/magic link) — hoje o
  acesso é criado via `onboarding.mjs`; a tela de Usuários gere perfis/status.
- **Enforcement das permissões** nas telas (o RBAC já está modelado e os perfis
  padrão são criados; falta aplicar o gate por módulo em botões/ações — melhor
  fazer com login real, depois do onboarding).
- **Transmissão eSocial** (certificado A1 + eventos S-22xx) — Fase 6.

> **Importação por planilha** já está pronta: em Empresas → **Importar** (modelo
> em Empresas → Importar → "modelo") e, dentro de cada empresa, Empregados →
> **Importar**. É por onde entram as 60 empresas / 1.084 empregados sem digitação.

## Reaplicar seeds após atualizar os CSVs
```bash
cd web && node scripts/gerar-seed-tabela24.mjs   # regenera os .sql a partir dos CSVs
```
