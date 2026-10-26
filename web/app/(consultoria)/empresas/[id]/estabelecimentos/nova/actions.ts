"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { cnpjValido, cpfValido } from "@/lib/validators";

export type Estado = { erro?: string };
const LEN: Record<string, number> = { cnpj: 14, cpf: 11, caepf: 14, cno: 12 };

export async function criarEstabelecimento(
  empresaId: string,
  _prev: Estado,
  formData: FormData,
): Promise<Estado> {
  const tipo = String(formData.get("tipo_inscricao") ?? "cnpj");
  const inscricao = String(formData.get("inscricao") ?? "").replace(/\D/g, "");
  if (inscricao.length !== (LEN[tipo] ?? 14))
    return { erro: `Número do ${tipo.toUpperCase()} incompleto.` };
  if (tipo === "cnpj" && !cnpjValido(inscricao))
    return { erro: "CNPJ inválido." };
  if ((tipo === "cpf" || tipo === "caepf") && !cpfValido(inscricao.slice(0, 11)))
    return { erro: "CPF inválido." };

  const supabase = await createClient();
  const { error } = await supabase.from("estabelecimento").insert({
    empresa_id: empresaId,
    tipo_unidade: String(formData.get("tipo_unidade") ?? "matriz"),
    tipo_inscricao: tipo,
    inscricao,
    apelido: String(formData.get("apelido") ?? "").trim() || null,
    cep: String(formData.get("cep") ?? "").trim() || null,
    logradouro: String(formData.get("logradouro") ?? "").trim() || null,
    bairro: String(formData.get("bairro") ?? "").trim() || null,
    cidade: String(formData.get("cidade") ?? "").trim() || null,
    uf: String(formData.get("uf") ?? "").trim().toUpperCase().slice(0, 2) || null,
  });
  if (error) return { erro: `Não foi possível salvar: ${error.message}` };
  redirect(`/empresas/${empresaId}/estabelecimentos`);
}
