"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUsuarioAtual } from "@/lib/rbac";

export type Estado = { erro?: string };

function numOuNull(v: FormDataEntryValue | null): number | null {
  const n = Number(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : null;
}

export async function criarTreinamento(
  _prev: Estado,
  formData: FormData,
): Promise<Estado> {
  const nome = String(formData.get("nome") ?? "").trim();
  if (!nome) return { erro: "Informe o nome do treinamento." };

  const usuario = await getUsuarioAtual();
  if (!usuario) return { erro: "Sessão expirada." };

  const supabase = await createClient();
  const { error } = await supabase.from("treinamento").insert({
    consultoria_id: usuario.consultoria_id,
    nome,
    nr: String(formData.get("nr") ?? "").trim() || null,
    tipo: String(formData.get("tipo") ?? "inicial"),
    carga_horaria_h: numOuNull(formData.get("carga_horaria_h")),
    periodicidade_meses: numOuNull(formData.get("periodicidade_meses")),
  });
  if (error) {
    if (error.code === "23505") return { erro: "Já existe um treinamento com esse nome." };
    return { erro: `Não foi possível salvar: ${error.message}` };
  }
  redirect("/treinamentos");
}
