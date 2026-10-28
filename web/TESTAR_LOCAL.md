# Testar localmente (grátis, só você)

Roda o sistema inteiro na sua máquina com um banco Supabase local (Docker).
Nada de custo, nada na nuvem, nada que mexa nos seus outros projetos Supabase.
Quando estiver tudo redondo e você decidir comercializar, aí fazemos o deploy
na nuvem (ver `../LANCAMENTO.md`) — o código é o mesmo, muda só o `.env`.

## 1. Instalar os pré-requisitos (uma vez)
- **Docker Desktop** (e deixe-o aberto/rodando): https://www.docker.com/products/docker-desktop/
- **Supabase CLI**: https://supabase.com/docs/guides/cli
  - macOS: `brew install supabase/tap/supabase`
  - Windows (scoop): `scoop install supabase`
- **Node 18+**: https://nodejs.org

## 2. Pegar o código
```bash
git clone https://github.com/Haroldo7777/esocial-protecaorr.git
cd esocial-protecaorr/web
npm install
```
(Se já tem o repo, faça `git pull` dentro dele e entre em `web/`.)

## 3. Subir tudo com um comando
```bash
bash scripts/testar-local.sh
```
Esse script: sobe o Supabase local, aplica as migrations, carrega os **919
riscos da Tabela 24**, cria o **admin de teste**, a consultoria e os **10
exames**. Na primeira vez o Docker baixa as imagens (demora alguns minutos).

## 4. Rodar o app
```bash
npm run dev
```
Abra **http://localhost:3000/login** e entre com:
- e-mail: `haroldo@protecaorr.net`
- senha: `teste1234`

Banco visual (Studio): **http://127.0.0.1:54323**

## Comandos úteis
- Parar tudo: `supabase stop`
- Zerar o banco (reaplica migrations + seed eSocial): `supabase db reset`
  e depois `node scripts/seed-local.mjs` para recriar admin/exames.
- Ver as chaves locais: `supabase status`

## Observações
- É um ambiente **efêmero de teste**: pode zerar e recriar à vontade.
- O login não exige confirmação de e-mail em local (`config.toml`).
- Importação de empresas/empregados: use as telas **Importar** (há modelos
  CSV para baixar) para carregar seus dados de teste rapidamente.
