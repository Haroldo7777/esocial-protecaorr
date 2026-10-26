import { createClient } from "@/lib/supabase/server";
import type { Programa } from "@/lib/documentos-defs";

export {
  TIPOS_PROGRAMA,
  VIGENCIA_PADRAO,
  MODELOS_PGR,
  type Programa,
} from "@/lib/documentos-defs";

type Res<T> = { ok: true; dados: T } | { ok: false; erro: string };

export async function listarProgramas(tipo?: string): Promise<Res<Programa[]>> {
  try {
    const sb = await createClient();
    let q = sb
      .from("programa")
      .select(
        "id,tipo,modelo,numero,vigencia_inicio,vigencia_fim,status,responsavel_tecnico,empresa:empresa_id(razao_social,nome_fantasia)",
      )
      .order("created_at", { ascending: false });
    if (tipo) q = q.eq("tipo", tipo);
    const { data, error } = await q;
    if (error) return { ok: false, erro: error.message };
    return { ok: true, dados: (data ?? []) as unknown as Programa[] };
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : "Erro" };
  }
}
