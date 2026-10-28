#!/usr/bin/env node
// Onboarding da consultoria + usuário admin (lançamento).
//
// Pré-requisitos: migrations 0001..0008 já aplicadas no banco.
// Variáveis de ambiente (ou .env.local exportado):
//   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//
// Uso:
//   node scripts/onboarding.mjs \
//     --razao "H DE ARAUJO MARREIRO DE SOUZA LTDA" \
//     --cnpj "00000000000000" \
//     --nome "Haroldo" \
//     --email "haroldo@protecaorr.net" \
//     --senha "SENHA_FORTE"
//
// O que faz: cria o usuário no Supabase Auth (e-mail confirmado), depois chama
// a função app_bootstrap_consultoria para criar a consultoria, os perfis padrão
// e vincular o admin. Idempotência: se o e-mail já existir no Auth, reaproveita.

import { createClient } from "@supabase/supabase-js";

function arg(nome, obrig = true) {
  const i = process.argv.indexOf(`--${nome}`);
  const v = i >= 0 ? process.argv[i + 1] : undefined;
  if (obrig && !v) {
    console.error(`Faltou --${nome}`);
    process.exit(1);
  }
  return v;
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const razao = arg("razao");
const cnpj = (arg("cnpj", false) || "").replace(/\D/g, "");
const nome = arg("nome");
const email = arg("email");
const senha = arg("senha");

const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

async function acharOuCriarUsuario() {
  // tenta criar; se já existir, procura na listagem
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
    user_metadata: { nome },
  });
  if (!error && data?.user) return data.user.id;
  // já existe → localiza
  const { data: lista, error: e2 } = await admin.auth.admin.listUsers();
  if (e2) throw e2;
  const achado = lista.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (!achado) throw error ?? new Error("Não foi possível criar nem localizar o usuário.");
  console.log("Usuário já existia no Auth — reaproveitando.");
  return achado.id;
}

const userId = await acharOuCriarUsuario();
console.log("Auth user id:", userId);

const { data: cons, error } = await admin.rpc("app_bootstrap_consultoria", {
  p_razao: razao,
  p_cnpj: cnpj,
  p_admin_user: userId,
  p_admin_nome: nome,
  p_admin_email: email,
});
if (error) {
  console.error("Falha no bootstrap:", error.message);
  process.exit(1);
}
console.log("Consultoria criada:", cons);
console.log("Pronto. Faça login em /login com", email);
