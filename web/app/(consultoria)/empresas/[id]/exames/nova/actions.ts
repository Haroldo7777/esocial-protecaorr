"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Estado = { erro?: string };

export async function incluirExameNoPlano(
  empresaId: string,
  _prev: Estado,
  formData: FormData,
): Promise<Estado> {
  const exame_tipo_id = String(formData.get("exame_tipo_id") ?? "");
  if (!exame_tipo_id) return { erro: "Selecione o exame." };

  const periodicidade = Number(formData.get("periodicidade_meses"));
  if (!Number.isFinite(periodicidade) || periodicidade <= 0)
    return { erro: "Informe uma periodicidade válida (em meses)." };

  const gheRaw = String(formData.get("ghe_id") ?? "");
  const ghe_id = gheRaw ? gheRaw : null;
  const observacao = String(formData.get("observacao") ?? "").trim() || null;

  const supabase = await createClient();
  const { error } = await supabase.from("plano_exame").insert({
    empresa_id: empresaId,
    ghe_id,
    exame_tipo_id,
    periodicidade_meses: periodicidade,
    observacao,
  });
  if (error) {
    if (error.code === "23505")
      return { erro: "Esse exame já está no plano para essa abrangência." };
    return { erro: `Não foi possível salvar: ${error.message}` };
  }
  redirect(`/empresas/${empresaId}/exames`);
}
