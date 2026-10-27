#!/usr/bin/env node
// Gera o SQL de seed da Tabela 24 (camada eSocial) a partir do CSV oficial.
//
// Uso:
//   node scripts/gerar-seed-tabela24.mjs
//
// Lê  web/supabase/seeds/tabela24_esocial.csv  (colunas: codigo,categoria,nome)
// e escreve  web/supabase/seeds/tabela24_esocial.sql  com um DELETE + INSERTs
// idempotentes (recria toda a camada 'esocial'). Rode após atualizar o CSV com
// os dados oficiais do eSocial (gov.br → Documentação técnica → Tabelas → 24).

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const base = join(dirname(fileURLToPath(import.meta.url)), "..", "supabase", "seeds");
const csv = readFileSync(join(base, "tabela24_esocial.csv"), "utf8");

// parser CSV simples (suporta aspas e vírgulas dentro de aspas)
function parseLinha(linha) {
  const out = [];
  let campo = "";
  let aspas = false;
  for (let i = 0; i < linha.length; i++) {
    const c = linha[i];
    if (aspas) {
      if (c === '"' && linha[i + 1] === '"') { campo += '"'; i++; }
      else if (c === '"') aspas = false;
      else campo += c;
    } else if (c === '"') aspas = true;
    else if (c === ",") { out.push(campo); campo = ""; }
    else campo += c;
  }
  out.push(campo);
  return out.map((s) => s.trim());
}

const linhas = csv.split(/\r?\n/).filter((l) => l.trim().length > 0);
const cab = parseLinha(linhas[0]).map((h) => h.toLowerCase());
const iCod = cab.indexOf("codigo");
const iCat = cab.indexOf("categoria");
const iNome = cab.indexOf("nome");
if (iCod < 0 || iCat < 0 || iNome < 0) {
  console.error("CSV precisa ter as colunas: codigo,categoria,nome");
  process.exit(1);
}

const esc = (s) => `'${String(s ?? "").replace(/'/g, "''")}'`;
const registros = linhas.slice(1).map(parseLinha);

let sql = `-- Seed gerado de tabela24_esocial.csv — NÃO editar à mão.
-- Camada oficial do eSocial (Tabela 24), somente leitura no app.
begin;
delete from risco_catalogo where camada = 'esocial';
`;

if (registros.length === 0) {
  sql += "-- (CSV vazio: preencha com os dados oficiais e rode o gerador novamente)\n";
} else {
  const valores = registros
    .map((r) => `  ('esocial', ${esc(r[iCat])}, ${esc(r[iCod])}, ${esc(r[iNome])}, true)`)
    .join(",\n");
  sql += `insert into risco_catalogo (camada, categoria, codigo_tabela24, nome, qualitativo) values\n${valores};\n`;
}
sql += "commit;\n";

writeFileSync(join(base, "tabela24_esocial.sql"), sql);
console.log(`Gerado tabela24_esocial.sql com ${registros.length} registro(s).`);
