"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUsuarioAtual } from "@/lib/rbac";
import { VIGENCIA_PADRAO } from "@/lib/documentos-defs";

export type Estado = { erro?: string };

/** Soma `meses` a uma data ISO (yyyy-mm-dd) preservando o fim do mês. */
function somaMeses(iso: string, meses: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const base = new Date(Date.UTC(y, m - 1, d));
  base.setUTCMonth(base.getUTCMonth() + meses);
  return base.toISOString().slice(0, 10);
}

export async function criarPrograma(
  _prev: Estado,
  formData: FormData,
): Promise<Estado> {
  const empresa_id = String(formData.get("empresa_id") ?? "");
  const tipo = String(formData.get("tipo") ?? "");
  const vigencia_inicio = String(formData.get("vigencia_inicio") ?? "").trim();

  if (!empresa_id) return { erro: "Selecione a empresa." };
  if (!tipo) return { erro: "Selecione o tipo de documento." };
  if (!vigencia_inicio) return { erro: "Informe a data de início da vigência." };

  const usuario = await getUsuarioAtual();
  if (!usuario) return { erro: "Sessão expirada." };

  // Vigência (meses) escolhida na emissão: PGR/PGRTR aceita 12 ou 24;
  // os demais usam o padrão de 12 meses (ver docs/REGRAS_PERIODICIDADE.md).
  const mesesForm = Number(formData.get("vigencia_meses"));
  const vigencia_meses =
    tipo === "pgr" && (mesesForm === 12 || mesesForm === 24)
      ? mesesForm
      : (VIGENCIA_PADRAO[tipo] ?? 12);
  const vigencia_fim = somaMeses(vigencia_inicio, vigencia_meses);

  const modelo = tipo === "pgr" ? String(formData.get("modelo") ?? "") || null : null;
  const numero = String(formData.get("numero") ?? "").trim() || null;
  const responsavel_tecnico =
    String(formData.get("responsavel_tecnico") ?? "").trim() || null;
  const registro_rt = String(formData.get("registro_rt") ?? "").trim() || null;
  const descricao = String(formData.get("descricao") ?? "").trim() || null;

  const supabase = await createClient();
  const { error } = await supabase.from("programa").insert({
    empresa_id,
    tipo,
    modelo,
    numero,
    vigencia_inicio,
    vigencia_meses,
    vigencia_fim,
    responsavel_tecnico,
    registro_rt,
    descricao,
    status: "emitido",
  });
  if (error) return { erro: `Não foi possível salvar: ${error.message}` };
  redirect(`/documentos?tipo=${tipo}`);
}
