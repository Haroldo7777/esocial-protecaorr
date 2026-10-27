"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUsuarioAtual } from "@/lib/rbac";

export type Estado = { erro?: string };

export async function criarRisco(
  _prev: Estado,
  formData: FormData,
): Promise<Estado> {
  const nome = String(formData.get("nome") ?? "").trim();
  const categoria = String(formData.get("categoria") ?? "").trim();
  if (!nome) return { erro: "Informe o nome do risco." };
  if (!categoria) return { erro: "Selecione a categoria." };

  const usuario = await getUsuarioAtual();
  if (!usuario) return { erro: "Sessão expirada." };

  const medidas = String(formData.get("medidas_recomendadas") ?? "")
    .split("\n").map((s) => s.trim()).filter(Boolean);
  // exigências por ID (seleção do catálogo)
  const treinamentos = formData.getAll("treinamentos").map(String).filter(Boolean);
  const exames = formData.getAll("exames").map(String).filter(Boolean);
  const epis = formData.getAll("epis").map(String).filter(Boolean);

  const supabase = await createClient();
  const { error } = await supabase.from("risco_catalogo").insert({
    camada: "consultoria",
    consultoria_id: usuario.consultoria_id,
    nome,
    categoria,
    codigo_tabela24: String(formData.get("codigo_tabela24") ?? "").trim() || null,
    qualitativo: formData.get("qualitativo") === "sim",
    observacoes: String(formData.get("observacoes") ?? "").trim() || null,
    medidas_recomendadas: medidas,
    exigencias: { treinamentos, exames, epis },
    intensidade: String(formData.get("intensidade") ?? "").trim() || null,
    limite_tolerancia: String(formData.get("limite_tolerancia") ?? "").trim() || null,
    metodo_medicao: String(formData.get("metodo_medicao") ?? "").trim() || null,
    aposentadoria_especial: formData.get("aposentadoria_especial") === "on",
    tipo_exposicao: String(formData.get("tipo_exposicao") ?? "").trim() || null,
    doc_lip: formData.get("doc_lip") === "on",
    doc_ltcat: formData.get("doc_ltcat") === "on",
    doc_pgr: formData.get("doc_pgr") === "on",
    doc_pcmso: formData.get("doc_pcmso") === "on",
    doc_aep: formData.get("doc_aep") === "on",
  });
  if (error) return { erro: `Não foi possível salvar: ${error.message}` };
  redirect("/riscos?camada=consultoria");
}
