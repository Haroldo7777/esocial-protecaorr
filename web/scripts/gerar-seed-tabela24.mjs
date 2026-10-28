#!/usr/bin/env node
// Gera os SQLs de seed do catálogo (riscos e exames) a partir dos CSVs oficiais.
//
// Uso:
//   node scripts/gerar-seed-tabela24.mjs
//
// Lê em web/supabase/seeds/:
//   - riscos_esocial.csv       (nome,categoria,nome_esocial,codigo) → camada eSocial
//   - riscos_consultoria.csv   (nome,categoria,nome_esocial,codigo) → camada consultoria
//   - exames.csv               (nome,A,P,D,RT,MR)                   → exame_tipo
// e escreve os .sql correspondentes (idempotentes). Rode após atualizar os CSVs.
//
// Fonte dos dados: catálogo da Tabela 24 do eSocial (agentes nocivos, público) e
// a lista de tipos de exame da Proteção RR. Nada de código/layout/texto de produto
// de terceiro — apenas a nomenclatura técnica.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const base = join(dirname(fileURLToPath(import.meta.url)), "..", "supabase", "seeds");

function parseCsv(txt) {
  const linhas = txt.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const parseLinha = (linha) => {
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
    return out;
  };
  const header = parseLinha(linhas[0]).map((h) => h.trim().toLowerCase());
  return linhas.slice(1).map((l) => {
    const cols = parseLinha(l);
    const obj = {};
    header.forEach((h, i) => (obj[h] = (cols[i] ?? "").trim()));
    return obj;
  });
}

const esc = (s) => `'${String(s ?? "").replace(/'/g, "''")}'`;
const nul = (s) => (s && s.length ? esc(s) : "null");
const read = (f) => (existsSync(join(base, f)) ? parseCsv(readFileSync(join(base, f), "utf8")) : []);

// ---- riscos camada eSocial -------------------------------------------------
{
  const regs = read("riscos_esocial.csv");
  let sql = `-- Seed gerado de riscos_esocial.csv — NÃO editar à mão.
-- Catálogo oficial de agentes nocivos (Tabela 24 do eSocial), camada eSocial
-- (consultoria_id null, somente leitura no app).
begin;
delete from risco_catalogo where camada = 'esocial';
`;
  if (regs.length) {
    const vals = regs
      .map((r) => `  ('esocial', ${esc(r.categoria)}, ${esc(r.nome)}, ${nul(r.nome_esocial)}, ${nul(r.codigo)}, true)`)
      .join(",\n");
    sql += `insert into risco_catalogo (camada, categoria, nome, nome_esocial, codigo_tabela24, qualitativo) values\n${vals};\n`;
  }
  sql += "commit;\n";
  writeFileSync(join(base, "riscos_esocial.sql"), sql);
  // seed.sql (lido pelo `supabase db reset`): só a camada eSocial, idempotente
  writeFileSync(join(base, "..", "seed.sql"), sql);
  console.log(`riscos_esocial.sql + seed.sql: ${regs.length} registro(s).`);
}

// ---- riscos camada consultoria (um por consultoria existente) --------------
{
  const regs = read("riscos_consultoria.csv");
  let sql = `-- Seed gerado de riscos_consultoria.csv — NÃO editar à mão.
-- Riscos próprios da consultoria (camada consultoria). Inserido para cada
-- consultoria existente; idempotente via NOT EXISTS (nome por consultoria).
begin;
`;
  for (const r of regs) {
    sql += `insert into risco_catalogo (camada, consultoria_id, categoria, nome, nome_esocial, codigo_tabela24, qualitativo)
select 'consultoria', c.id, ${esc(r.categoria)}, ${esc(r.nome)}, ${nul(r.nome_esocial)}, ${nul(r.codigo)}, true
from consultoria c
where not exists (
  select 1 from risco_catalogo x
  where x.camada = 'consultoria' and x.consultoria_id = c.id and x.nome = ${esc(r.nome)}
);
`;
  }
  sql += "commit;\n";
  writeFileSync(join(base, "riscos_consultoria.sql"), sql);
  console.log(`riscos_consultoria.sql: ${regs.length} registro(s).`);
}

// ---- exames (exame_tipo, um conjunto por consultoria) ----------------------
{
  const regs = read("exames.csv");
  const sim = (v) => (String(v).trim().toLowerCase() === "sim" ? "true" : "false");
  let sql = `-- Seed gerado de exames.csv — NÃO editar à mão.
-- Catálogo de tipos de exame por consultoria (exame_tipo). Inserido para cada
-- consultoria existente; idempotente via ON CONFLICT (consultoria_id, nome).
begin;
`;
  if (regs.length) {
    const vals = regs
      .map((r) => `  (${esc(r.nome)}, ${sim(r.a)}, ${sim(r.p)}, ${sim(r.d)}, ${sim(r.rt)}, ${sim(r.mr)})`)
      .join(",\n");
    sql += `insert into exame_tipo (consultoria_id, nome, aso_admissional, aso_periodico, aso_demissional, aso_retorno, aso_mudanca)
select c.id, v.nome, v.a, v.p, v.d, v.rt, v.mr
from consultoria c
cross join (values
${vals}
) as v(nome, a, p, d, rt, mr)
on conflict (consultoria_id, nome) do nothing;
`;
  }
  sql += "commit;\n";
  writeFileSync(join(base, "exames.sql"), sql);
  console.log(`exames.sql: ${regs.length} registro(s).`);
}
