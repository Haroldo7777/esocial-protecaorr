"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUsuarioAtual } from "@/lib/rbac";

export type Estado = { erro?: string };

export async function criarEpi(_prev: Estado, formData: FormData): Promise<Estado> {
  const nome = String(formData.get("nome") ?? "").trim();
  if (!nome) return { erro: "Informe o nome do EPI." };

  const usuario = await getUsuarioAtual();
  if (!usuario) return { erro: "Sessão expirada." };

  const periodicidade = Number(formData.get("periodicidade_troca_meses"));

  const supabase = await createClient();
  const { error } = await supabase.from("epi").insert({
    consultoria_id: usuario.consultoria_id,
    nome,
    ca: String(formData.get("ca") ?? "").trim() || null,
    fabricante: String(formData.get("fabricante") ?? "").trim() || null,
    validade_ca: String(formData.get("validade_ca") ?? "").trim() || null,
    periodicidade_troca_meses:
      Number.isFinite(periodicidade) && periodicidade > 0 ? periodicidade : null,
    descricao: String(formData.get("descricao") ?? "").trim() || null,
  });
  if (error) {
    if (error.code === "23505") return { erro: "Já existe um EPI com esse nome." };
    return { erro: `Não foi possível salvar: ${error.message}` };
  }
  redirect("/epi");
}
