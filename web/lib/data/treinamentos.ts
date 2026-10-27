import { createClient } from "@/lib/supabase/server";

export { TIPOS_TREINAMENTO, MODALIDADES } from "@/lib/treinamentos-defs";

export type Treinamento = {
  id: string;
  nome: string;
  nr: string | null;
  tipo: string;
  carga_horaria_h: number | null;
  periodicidade_meses: number | null;
};

export type Turma = {
  id: string;
  data_inicio: string;
  data_fim: string | null;
  modalidade: string;
  instrutor: string | null;
  periodicidade_meses: number | null;
  treinamento: { nome: string; nr: string | null } | null;
  empresa: { razao_social: string; nome_fantasia: string | null } | null;
  alunos: { count: number }[];
};

type Res<T> = { ok: true; dados: T } | { ok: false; erro: string };

export async function listarTreinamentos(): Promise<Res<Treinamento[]>> {
  try {
    const sb = await createClient();
    const { data, error } = await sb
      .from("treinamento")
      .select("id,nome,nr,tipo,carga_horaria_h,periodicidade_meses")
      .eq("ativo", true)
      .order("nome");
    if (error) return { ok: false, erro: error.message };
    return { ok: true, dados: (data ?? []) as Treinamento[] };
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : "Erro" };
  }
}

export async function listarTurmas(empresaId?: string): Promise<Res<Turma[]>> {
  try {
    const sb = await createClient();
    let q = sb
      .from("turma")
      .select(
        "id,data_inicio,data_fim,modalidade,instrutor,periodicidade_meses,treinamento:treinamento_id(nome,nr),empresa:empresa_id(razao_social,nome_fantasia),alunos:turma_aluno(count)",
      )
      .order("data_inicio", { ascending: false });
    if (empresaId) q = q.eq("empresa_id", empresaId);
    const { data, error } = await q;
    if (error) return { ok: false, erro: error.message };
    return { ok: true, dados: (data ?? []) as unknown as Turma[] };
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : "Erro" };
  }
}
