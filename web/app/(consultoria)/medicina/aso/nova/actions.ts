"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Estado = { erro?: string };

function somaMeses(iso: string, meses: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const base = new Date(Date.UTC(y, m - 1, d));
  base.setUTCMonth(base.getUTCMonth() + meses);
  return base.toISOString().slice(0, 10);
}

export async function registrarAso(
  empresaId: string,
  _prev: Estado,
  formData: FormData,
): Promise<Estado> {
  const empregado_id = String(formData.get("empregado_id") ?? "");
  const tipo = String(formData.get("tipo") ?? "");
  const data_exame = String(formData.get("data_exame") ?? "").trim();
  if (!empregado_id) return { erro: "Selecione o empregado." };
  if (!tipo) return { erro: "Selecione o tipo de ASO." };
  if (!data_exame) return { erro: "Informe a data do exame." };

  const exames = formData.getAll("exames").map(String).filter(Boolean);

  // periodicidade (meses) → próximo ASO (não se aplica ao demissional)
  const periodicidade = Number(formData.get("periodicidade_meses"));
  const temPeriodicidade = Number.isFinite(periodicidade) && periodicidade > 0;
  const data_proximo =
    tipo !== "demissional" && temPeriodicidade
      ? somaMeses(data_exame, periodicidade)
      : null;

  const supabase = await createClient();
  const { data: aso, error } = await supabase
    .from("aso")
    .insert({
      empresa_id: empresaId,
      empregado_id,
      tipo,
      data_exame,
      periodicidade_meses: temPeriodicidade ? periodicidade : null,
      data_proximo,
      medico_responsavel: String(formData.get("medico_responsavel") ?? "").trim() || null,
      crm_medico: String(formData.get("crm_medico") ?? "").trim() || null,
      resultado: String(formData.get("resultado") ?? "") || null,
      observacoes: String(formData.get("observacoes") ?? "").trim() || null,
    })
    .select("id")
    .single();
  if (error) return { erro: `Não foi possível salvar: ${error.message}` };

  if (exames.length > 0) {
    const linhas = exames.map((exame_tipo_id) => ({ aso_id: aso.id, exame_tipo_id }));
    const { error: e2 } = await supabase.from("aso_exame").insert(linhas);
    if (e2) return { erro: `ASO salvo, mas houve erro nos exames: ${e2.message}` };
  }

  redirect("/medicina/aso");
}
