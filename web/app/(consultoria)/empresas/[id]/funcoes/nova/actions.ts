"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { cboFormatoValido } from "@/lib/validators";

export type Estado = { erro?: string };

export async function criarFuncao(
  empresaId: string,
  _prev: Estado,
  formData: FormData,
): Promise<Estado> {
  const nome = String(formData.get("nome") ?? "").trim();
  const cbo = String(formData.get("cbo") ?? "").replace(/\D/g, "");
  if (!nome) return { erro: "Informe o nome da função." };
  if (cbo && !cboFormatoValido(cbo)) return { erro: "CBO deve ter 6 dígitos." };

  const periodicidade = Number(formData.get("aso_periodicidade_meses") ?? 12);

  const supabase = await createClient();
  const { error } = await supabase.from("funcao").insert({
    empresa_id: empresaId,
    nome,
    cbo: cbo || null,
    descricao: String(formData.get("descricao") ?? "").trim() || null,
    aso_periodicidade_meses: Number.isFinite(periodicidade) ? periodicidade : 12,
  });
  if (error) return { erro: `Não foi possível salvar: ${error.message}` };
  redirect(`/empresas/${empresaId}/funcoes`);
}
