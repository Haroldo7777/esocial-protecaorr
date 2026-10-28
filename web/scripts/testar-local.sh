#!/usr/bin/env bash
# Sobe o ambiente de TESTE local (Supabase no Docker) e deixa tudo pronto.
# Pré-requisitos na sua máquina: Docker rodando, Supabase CLI e Node 18+.
#
# Uso (dentro de web/):
#   bash scripts/testar-local.sh
# Depois:
#   npm install   (na primeira vez)
#   npm run dev   → http://localhost:3000/login

set -euo pipefail
cd "$(dirname "$0")/.."

command -v supabase >/dev/null 2>&1 || { echo "Supabase CLI não encontrado. Instale: https://supabase.com/docs/guides/cli"; exit 1; }
docker info >/dev/null 2>&1 || { echo "Docker não está rodando. Abra o Docker Desktop e tente de novo."; exit 1; }
command -v node >/dev/null 2>&1 || { echo "Node não encontrado (precisa 18+)."; exit 1; }

echo "== 1/4 Subindo Supabase local (pode demorar na 1ª vez) =="
supabase start

echo "== 2/4 Aplicando migrations + seed eSocial (db reset) =="
supabase db reset

echo "== 3/4 Gerando .env.local com as chaves locais =="
# lê as credenciais do stack local
eval "$(supabase status -o env 2>/dev/null | sed 's/^/export SB_/')"
API_URL="${SB_API_URL:-http://127.0.0.1:54321}"
ANON="${SB_ANON_KEY:-}"
SERVICE="${SB_SERVICE_ROLE_KEY:-}"
if [[ -z "$ANON" || -z "$SERVICE" ]]; then
  echo "Não consegui ler ANON_KEY/SERVICE_ROLE_KEY de 'supabase status'."
  echo "Rode 'supabase status' e preencha web/.env.local manualmente."
  exit 1
fi
cat > .env.local <<EOF
NEXT_PUBLIC_SUPABASE_URL=${API_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${ANON}
SUPABASE_SERVICE_ROLE_KEY=${SERVICE}
EOF
echo ".env.local gerado."

echo "== 4/4 Onboarding (admin de teste) + exames + risco da consultoria =="
export NEXT_PUBLIC_SUPABASE_URL="${API_URL}"
export SUPABASE_SERVICE_ROLE_KEY="${SERVICE}"
node scripts/seed-local.mjs

echo ""
echo "============================================================"
echo " Ambiente de teste pronto."
echo " 1) npm install   (só na primeira vez)"
echo " 2) npm run dev    → http://localhost:3000/login"
echo "    Login: haroldo@protecaorr.net   senha: teste1234"
echo " Studio do banco:  http://127.0.0.1:54323"
echo " Para parar tudo:  supabase stop"
echo "============================================================"
