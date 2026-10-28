#!/usr/bin/env node
// Pós-reset do banco LOCAL: cria o admin de teste, a consultoria e os perfis
// padrão (via app_bootstrap_consultoria) e semeia os exames + o risco da
// consultoria para essa consultoria. Os 919 riscos eSocial já entram pelo
// supabase/seed.sql no `supabase db reset`.
//
// Env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (valores LOCAIS).
// Uso: node scripts/seed-local.mjs [--email ...] [--senha ...] [--nome ...] [--razao ...]

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const base = join(dirname(fileURLToPath(import.meta.url)), "..", "supabase", "seeds");
const arg = (n, def) => {
  const i = process.argv.indexOf(`--${n}`);
  return i >= 0 ? process.argv[i + 1] : def;
};

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}
const email = arg("email", "haroldo@protecaorr.net");
const senha = arg("senha", "teste1234");
const nome = arg("nome", "Haroldo");
const razao = arg("razao", "PROTECAO RR (TESTE)");

function parseCsv(txt) {
  const linhas = txt.split(/\r?\n/).filter((l) => l.trim());
  const split = (l) => {
    const o = []; let c = "", q = false;
    for (let i = 0; i < l.length; i++) {
      const ch = l[i];
      if (q) { if (ch === '"' && l[i + 1] === '"') { c += '"'; i++; } else if (ch === '"') q = false; else c += ch; }
      else if (ch === '"') q = true;
      else if (ch === ",") { o.push(c); c = ""; }
      else c += ch;
    }
    o.push(c); return o.map((s) => s.trim());
  };
  const head = split(linhas[0]).map((h) => h.toLowerCase());
  return linhas.slice(1).map((l) => {
    const cols = split(l); const obj = {};
    head.forEach((h, i) => (obj[h] = (cols[i] ?? "").trim()));
    return obj;
  });
}

const sb = createClient(url, key, { auth: { persistSession: false } });

// 1) usuário admin (ou reaproveita)
let userId;
{
  const { data, error } = await sb.auth.admin.createUser({
    email, password: senha, email_confirm: true, user_metadata: { nome },
  });
  if (!error && data?.user) userId = data.user.id;
  else {
    const { data: lista } = await sb.auth.admin.listUsers();
    userId = lista?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())?.id;
    if (!userId) { console.error("Falha ao criar/achar usuário:", error?.message); process.exit(1); }
    console.log("Usuário já existia — reaproveitando.");
  }
}
console.log("Admin:", email, userId);

// 2) consultoria + perfis padrão + vínculo admin
const { data: consId, error: eBoot } = await sb.rpc("app_bootstrap_consultoria", {
  p_razao: razao, p_cnpj: "", p_admin_user: userId, p_admin_nome: nome, p_admin_email: email,
});
if (eBoot) {
  // se já existe (rerun), tenta localizar a consultoria do admin
  console.log("bootstrap:", eBoot.message, "— tentando localizar consultoria existente.");
}
let consultoriaId = consId;
if (!consultoriaId) {
  const { data } = await sb.from("usuario").select("consultoria_id").eq("id", userId).single();
  consultoriaId = data?.consultoria_id;
}
if (!consultoriaId) { console.error("Sem consultoria."); process.exit(1); }
console.log("Consultoria:", consultoriaId);

// 3) exames do catálogo
{
  const regs = parseCsv(readFileSync(join(base, "exames.csv"), "utf8"));
  const sim = (v) => String(v).trim().toLowerCase() === "sim";
  const linhas = regs.map((r) => ({
    consultoria_id: consultoriaId,
    nome: r.nome,
    aso_admissional: sim(r.a), aso_periodico: sim(r.p), aso_demissional: sim(r.d),
    aso_retorno: sim(r.rt), aso_mudanca: sim(r.mr),
  }));
  const { error } = await sb.from("exame_tipo").upsert(linhas, {
    onConflict: "consultoria_id,nome", ignoreDuplicates: true,
  });
  if (error) console.error("exames:", error.message);
  else console.log(`exames: ${linhas.length} ok.`);
}

// 4) risco(s) da consultoria
{
  const regs = parseCsv(readFileSync(join(base, "riscos_consultoria.csv"), "utf8"));
  for (const r of regs) {
    const { data: existe } = await sb
      .from("risco_catalogo").select("id")
      .eq("camada", "consultoria").eq("consultoria_id", consultoriaId).eq("nome", r.nome)
      .maybeSingle();
    if (existe) continue;
    const { error } = await sb.from("risco_catalogo").insert({
      camada: "consultoria", consultoria_id: consultoriaId,
      categoria: r.categoria, nome: r.nome,
      nome_esocial: r.nome_esocial || null, codigo_tabela24: r.codigo || null, qualitativo: true,
    });
    if (error) console.error("risco consultoria:", error.message);
  }
  console.log(`riscos consultoria: ${regs.length} verificado(s).`);
}

console.log("\nPronto. Rode `npm run dev` e acesse http://localhost:3000/login");
console.log(`Login: ${email} / senha: ${senha}`);
