"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Estado = { erro?: string };

export async function criarGhe(
  empresaId: string,
  _prev: Estado,
  formData: FormData,
): Promise<Estado> {
  const referencia = String(formData.get("referencia") ?? "").trim();
  if (!referencia) return { erro: "Informe a referência do grupo." };

  const numero = Number(formData.get("numero") ?? 1);
  const supabase = await createClient();
  const { error } = await supabase.from("ghe").insert({
    empresa_id: empresaId,
    referencia,
    numero: Number.isFinite(numero) ? numero : 1,
    processo: String(formData.get("processo") ?? "").trim() || null,
    jornada: String(formData.get("jornada") ?? "").trim() || null,
    obs_geral: String(formData.get("obs_geral") ?? "").trim() || null,
    situacao: "incompleto",
  });
  if (error) return { erro: `Não foi possível salvar: ${error.message}` };
  redirect(`/empresas/${empresaId}/ghe`);
}
