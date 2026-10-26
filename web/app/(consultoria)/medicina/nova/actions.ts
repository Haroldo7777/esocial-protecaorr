"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUsuarioAtual } from "@/lib/rbac";

export type Estado = { erro?: string };

export async function criarTipoExame(
  _prev: Estado,
  formData: FormData,
): Promise<Estado> {
  const nome = String(formData.get("nome") ?? "").trim();
  if (!nome) return { erro: "Informe o nome do exame." };

  const usuario = await getUsuarioAtual();
  if (!usuario) return { erro: "Sessão expirada." };

  const supabase = await createClient();
  const { error } = await supabase.from("exame_tipo").insert({
    consultoria_id: usuario.consultoria_id,
    nome,
    aso_admissional: formData.get("a") === "on",
    aso_periodico: formData.get("p") === "on",
    aso_demissional: formData.get("d") === "on",
    aso_retorno: formData.get("rt") === "on",
    aso_mudanca: formData.get("mr") === "on",
  });
  if (error) return { erro: `Não foi possível salvar: ${error.message}` };
  redirect("/medicina");
}
