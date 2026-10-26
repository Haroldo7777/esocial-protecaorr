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
