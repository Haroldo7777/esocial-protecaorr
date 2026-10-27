"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUsuarioAtual } from "@/lib/rbac";
import { cnpjValido } from "@/lib/validators";

export type Estado = { erro?: string; ok?: boolean };

export async function salvarIdentidade(_prev: Estado, formData: FormData): Promise<Estado> {
  const razao_social = String(formData.get("razao_social") ?? "").trim();
  if (!razao_social) return { erro: "Informe a razão social." };

  const cnpj = String(formData.get("cnpj") ?? "").replace(/\D/g, "");
  if (cnpj && !cnpjValido(cnpj)) return { erro: "CNPJ inválido." };

  const cor = String(formData.get("cor_primaria") ?? "").trim() || null;
  const logo = String(formData.get("logo_url") ?? "").trim() || null;

  const usuario = await getUsuarioAtual();
  if (!usuario) return { erro: "Sessão expirada." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("consultoria")
    .update({
      razao_social,
      nome_fantasia: String(formData.get("nome_fantasia") ?? "").trim() || null,
      cnpj: cnpj || null,
      cor_primaria: cor,
      logo_url: logo,
    })
    .eq("id", usuario.consultoria_id);
  if (error) return { erro: `Não foi possível salvar: ${error.message}` };
  redirect("/configuracoes?ok=1");
}
