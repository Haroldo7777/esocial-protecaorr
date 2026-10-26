import { createClient } from "@/lib/supabase/server";

export type Risco = {
  id: string;
  nome: string;
  categoria: string;
  codigo_tabela24: string | null;
  camada: string;
  qualitativo: boolean;
};

type Res<T> = { ok: true; dados: T } | { ok: false; erro: string };

/** Lista riscos de uma camada (RLS isola consultoria/empresa; esocial é visível a todos). */
export async function listarRiscos(
  camada: "esocial" | "consultoria" | "empresa",
  busca?: string,
): Promise<Res<Risco[]>> {
  try {
    const sb = await createClient();
    let q = sb
      .from("risco_catalogo")
      .select("id,nome,categoria,codigo_tabela24,camada,qualitativo")
      .eq("camada", camada)
      .eq("ativo", true)
      .order("categoria")
      .order("nome");
    if (busca && busca.trim()) {
      const t = busca.trim();
      q = q.or(`nome.ilike.%${t}%,codigo_tabela24.ilike.%${t}%`);
    }
    const { data, error } = await q;
    if (error) return { ok: false, erro: error.message };
    return { ok: true, dados: (data ?? []) as Risco[] };
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : "Erro" };
  }
}

/** Agentes da camada eSocial (Tabela 24) para o dropdown do cadastro. */
export async function listarAgentesEsocial(): Promise<
  { id: string; nome: string; codigo_tabela24: string | null }[]
> {
  try {
    const sb = await createClient();
    const { data } = await sb
      .from("risco_catalogo")
      .select("id,nome,codigo_tabela24")
      .eq("camada", "esocial")
      .eq("ativo", true)
      .order("codigo_tabela24");
    return (data ?? []) as { id: string; nome: string; codigo_tabela24: string | null }[];
  } catch {
    return [];
  }
}
