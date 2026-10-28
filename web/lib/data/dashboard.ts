import { createClient } from "@/lib/supabase/server";

export type Metricas = {
  empresasAtivas: number;
  empregadosAtivos: number;
  turmas: number;
  asos: number;
};

type Res<T> = { ok: true; dados: T } | { ok: false; erro: string };

export async function metricasDashboard(): Promise<Res<Metricas>> {
  try {
    const sb = await createClient();
    const head = { count: "exact" as const, head: true };
    const [emp, trab, turmas, asos] = await Promise.all([
      sb.from("empresa").select("id", head).eq("situacao", "liberado").is("arquivada_em", null),
      sb.from("empregado").select("id", head).eq("situacao", "ativo"),
      sb.from("turma").select("id", head),
      sb.from("aso").select("id", head),
    ]);
    const err = emp.error || trab.error || turmas.error || asos.error;
    if (err) return { ok: false, erro: err.message };
    return {
      ok: true,
      dados: {
        empresasAtivas: emp.count ?? 0,
        empregadosAtivos: trab.count ?? 0,
        turmas: turmas.count ?? 0,
        asos: asos.count ?? 0,
      },
    };
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : "Erro" };
  }
}
