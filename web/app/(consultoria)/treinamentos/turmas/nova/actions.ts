"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Estado = { erro?: string };

export async function criarTurma(
  empresaId: string,
  _prev: Estado,
  formData: FormData,
): Promise<Estado> {
  const treinamento_id = String(formData.get("treinamento_id") ?? "");
  const data_inicio = String(formData.get("data_inicio") ?? "").trim();
  if (!treinamento_id) return { erro: "Selecione o treinamento." };
  if (!data_inicio) return { erro: "Informe a data de início." };

  const data_fim = String(formData.get("data_fim") ?? "").trim() || null;
  const carga = Number(String(formData.get("carga_horaria_h") ?? "").replace(",", "."));
  const periodicidade = Number(formData.get("periodicidade_meses"));
  const alunos = formData.getAll("alunos").map(String).filter(Boolean);

  const supabase = await createClient();
  const { data: turma, error } = await supabase
    .from("turma")
    .insert({
      empresa_id: empresaId,
      treinamento_id,
      data_inicio,
      data_fim,
      carga_horaria_h: Number.isFinite(carga) && carga > 0 ? carga : null,
      modalidade: String(formData.get("modalidade") ?? "presencial"),
      instrutor: String(formData.get("instrutor") ?? "").trim() || null,
      periodicidade_meses:
        Number.isFinite(periodicidade) && periodicidade > 0 ? periodicidade : null,
      observacoes: String(formData.get("observacoes") ?? "").trim() || null,
    })
    .select("id")
    .single();
  if (error) return { erro: `Não foi possível salvar: ${error.message}` };

  if (alunos.length > 0) {
    const linhas = alunos.map((empregado_id) => ({ turma_id: turma.id, empregado_id }));
    const { error: e2 } = await supabase.from("turma_aluno").insert(linhas);
    if (e2) return { erro: `Turma salva, mas houve erro nas matrículas: ${e2.message}` };
  }

  redirect("/treinamentos/turmas");
}
