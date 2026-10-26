import { createClient } from "@/lib/supabase/server";

export type ExameTipo = {
  id: string;
  nome: string;
  aso_admissional: boolean;
  aso_periodico: boolean;
  aso_demissional: boolean;
  aso_retorno: boolean;
  aso_mudanca: boolean;
};

type Res<T> = { ok: true; dados: T } | { ok: false; erro: string };

export async function listarTiposExame(): Promise<Res<ExameTipo[]>> {
  try {
    const sb = await createClient();
    const { data, error } = await sb
      .from("exame_tipo")
      .select("id,nome,aso_admissional,aso_periodico,aso_demissional,aso_retorno,aso_mudanca")
      .eq("ativo", true)
      .order("nome");
    if (error) return { ok: false, erro: error.message };
    return { ok: true, dados: (data ?? []) as ExameTipo[] };
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : "Erro" };
  }
}

export const LABEL_TIPO_ASO: Record<string, string> = {
  admissional: "Admissional",
  periodico: "Periódico",
  demissional: "Demissional",
  retorno: "Retorno ao trabalho",
  mudanca: "Mudança de risco/função",
};

export type Aso = {
  id: string;
  tipo: string;
  data_exame: string;
  periodicidade_meses: number | null;
  data_proximo: string | null;
  resultado: string | null;
  medico_responsavel: string | null;
  empregado: { nome: string; cpf: string } | null;
  empresa: { razao_social: string; nome_fantasia: string | null } | null;
};

export async function listarAsos(empresaId?: string): Promise<Res<Aso[]>> {
  try {
    const sb = await createClient();
    let q = sb
      .from("aso")
      .select(
        "id,tipo,data_exame,periodicidade_meses,data_proximo,resultado,medico_responsavel,empregado:empregado_id(nome,cpf),empresa:empresa_id(razao_social,nome_fantasia)",
      )
      .order("data_exame", { ascending: false });
    if (empresaId) q = q.eq("empresa_id", empresaId);
    const { data, error } = await q;
    if (error) return { ok: false, erro: error.message };
    return { ok: true, dados: (data ?? []) as unknown as Aso[] };
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : "Erro" };
  }
}
