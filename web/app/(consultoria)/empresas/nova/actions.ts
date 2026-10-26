"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUsuarioAtual } from "@/lib/rbac";
import { cnpjValido, cpfValido } from "@/lib/validators";

export type EstadoNova = { erro?: string };

const LEN: Record<string, number> = { cnpj: 14, cpf: 11, caepf: 14, cno: 12 };

export async function criarEmpresa(
  _prev: EstadoNova,
  formData: FormData,
): Promise<EstadoNova> {
  const tipo = String(formData.get("tipo_inscricao") ?? "cnpj");
  const inscricao = String(formData.get("inscricao") ?? "").replace(/\D/g, "");
  const razao = String(formData.get("razao_social") ?? "").trim();
  const grauRaw = String(formData.get("grau_risco") ?? "");
  const termos = formData.get("termos") === "on";

  if (!razao) return { erro: "Informe a razão social." };
  if (inscricao.length !== (LEN[tipo] ?? 14))
    return { erro: `Número do ${tipo.toUpperCase()} incompleto.` };
  if (tipo === "cnpj" && !cnpjValido(inscricao))
    return { erro: "CNPJ inválido — confira os dígitos." };
  if ((tipo === "cpf" || tipo === "caepf") && !cpfValido(inscricao.slice(0, 11)))
    return { erro: "CPF inválido — confira os dígitos." };
  if (!termos) return { erro: "É preciso aceitar os termos de uso." };

  const usuario = await getUsuarioAtual();
  if (!usuario) return { erro: "Sessão expirada. Entre novamente." };

  const modalidade = String(formData.get("modalidade") ?? "gestao");
  const grau = grauRaw ? Number(grauRaw) : null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("empresa")
    .insert({
      consultoria_id: usuario.consultoria_id,
      tipo_inscricao: tipo,
      inscricao,
      razao_social: razao.toUpperCase(),
      nome_fantasia: String(formData.get("nome_fantasia") ?? "").trim() || null,
      cnaes: String(formData.get("cnae") ?? "").trim()
        ? [String(formData.get("cnae")).trim()]
        : [],
      grau_risco: grau,
      email: String(formData.get("email") ?? "").trim() || null,
      email_cobranca: String(formData.get("email_cobranca") ?? "").trim() || null,
      telefone: String(formData.get("telefone") ?? "").trim() || null,
      situacao: "bloqueado",
      modalidade,
      instalacao_etapa: modalidade === "gestao" ? 1 : 5,
    })
    .select("id")
    .single();

  if (error) return { erro: `Não foi possível salvar: ${error.message}` };
  redirect(`/empresas/${data!.id}`);
}
