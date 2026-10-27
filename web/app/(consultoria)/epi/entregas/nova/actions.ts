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

export async function registrarEntrega(
  empresaId: string,
  _prev: Estado,
  formData: FormData,
): Promise<Estado> {
  const empregado_id = String(formData.get("empregado_id") ?? "");
  const epi_id = String(formData.get("epi_id") ?? "");
  const data_entrega = String(formData.get("data_entrega") ?? "").trim();
  if (!empregado_id) return { erro: "Selecione o empregado." };
  if (!epi_id) return { erro: "Selecione o EPI." };
  if (!data_entrega) return { erro: "Informe a data da entrega." };

  const qtd = Number(formData.get("quantidade"));
  const periodicidade = Number(formData.get("periodicidade_meses"));
  const temPeriodicidade = Number.isFinite(periodicidade) && periodicidade > 0;
  const data_proxima = temPeriodicidade ? somaMeses(data_entrega, periodicidade) : null;

  const supabase = await createClient();
  const { error } = await supabase.from("epi_entrega").insert({
    empresa_id: empresaId,
    empregado_id,
    epi_id,
    tipo: String(formData.get("tipo") ?? "entrega"),
    data_entrega,
    quantidade: Number.isFinite(qtd) && qtd > 0 ? qtd : 1,
    periodicidade_meses: temPeriodicidade ? periodicidade : null,
    data_proxima,
    assinado: formData.get("assinado") === "on",
    observacoes: String(formData.get("observacoes") ?? "").trim() || null,
  });
  if (error) return { erro: `Não foi possível salvar: ${error.message}` };
  redirect("/epi/entregas");
}
