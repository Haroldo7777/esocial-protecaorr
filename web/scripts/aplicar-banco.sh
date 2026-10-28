#!/usr/bin/env bash
# Aplica migrations (em ordem) e, opcionalmente, os seeds no banco Supabase.
#
# Pré-requisito: psql instalado e a string de conexão do projeto
#   (Supabase → Project Settings → Database → Connection string → URI).
#
# Uso:
#   export DATABASE_URL='postgresql://postgres:SENHA@db.SEU-PROJETO.supabase.co:5432/postgres'
#   bash scripts/aplicar-banco.sh            # só migrations
#   bash scripts/aplicar-banco.sh --seed-esocial    # + riscos da Tabela 24 (camada eSocial)
#   bash scripts/aplicar-banco.sh --seed-consultoria # + exames e risco da consultoria
#                                                     #   (rodar DEPOIS do onboarding)
#
# Alternativa sem psql: abra cada arquivo no SQL Editor do Supabase, na ordem abaixo.

set -euo pipefail
cd "$(dirname "$0")/.."

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "Defina DATABASE_URL com a connection string do Supabase." >&2
  exit 1
fi

run() { echo "→ $1"; psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$1"; }

echo "== Migrations =="
for f in supabase/migrations/0*.sql; do run "$f"; done

if [[ "${1:-}" == "--seed-esocial" ]]; then
  echo "== Seed: riscos eSocial (Tabela 24) =="
  run supabase/seeds/riscos_esocial.sql
fi

if [[ "${1:-}" == "--seed-consultoria" ]]; then
  echo "== Seed: exames + risco da consultoria (por consultoria existente) =="
  run supabase/seeds/exames.sql
  run supabase/seeds/riscos_consultoria.sql
fi

echo "OK."
