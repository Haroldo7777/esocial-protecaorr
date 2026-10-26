"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { cpfValido } from "@/lib/validators";

export type Estado = { erro?: string };

export async function criarEmpregado(
  empresaId: string,
  _prev: Estado,
  formData: FormData,
): Promise<Estado> {
  const nome = String(formData.get("nome") ?? "").trim();
  const cpf = String(formData.get("cpf") ?? "").replace(/\D/g, "");
  const nascimento = String(formData.get("nascimento") ?? "") || null;
  const admissao = String(formData.get("admissao") ?? "") || null;

  if (!nome) return { erro: "Informe o nome." };
  if (!cpfValido(cpf)) return { erro: "CPF inválido — confira os dígitos." };

  // regra: admissão ≥ nascimento + 14 anos
  if (nascimento && admissao) {
    const n = new Date(nascimento);
    const a = new Date(admissao);
    const min = new Date(n);
    min.setFullYear(min.getFullYear() + 14);
    if (a < min) return { erro: "Admissão deve ser ao menos 14 anos após o nascimento." };
  }

  const funcaoId = String(formData.get("funcao_id") ?? "");
  const supabase = await createClient();
  const { error } = await supabase.from("empregado").insert({
    empresa_id: empresaId,
    funcao_id: funcaoId || null,
    cpf,
    matricula: String(formData.get("matricula") ?? "").trim() || null,
    nome,
    nascimento,
    sexo: String(formData.get("sexo") ?? "").trim() || null,
    categoria_esocial: String(formData.get("categoria_esocial") ?? "").trim() || null,
    admissao,
    situacao: "ativo",
  });
  if (error) {
    if (error.message.includes("empregado_empresa_id_cpf_key"))
      return { erro: "Já existe um empregado com esse CPF nesta empresa." };
    return { erro: `Não foi possível salvar: ${error.message}` };
  }
  redirect(`/empresas/${empresaId}/empregados`);
}
