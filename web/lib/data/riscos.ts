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

export type RiscoCompleto = {
  id: string;
  camada: string;
  nome: string;
  codigo_tabela24: string | null;
  categoria: string;
  qualitativo: boolean;
  observacoes: string | null;
  medidas_recomendadas: string[];
  exigencias: { exames?: string[]; treinamentos?: string[]; epis?: string[] } | null;
  intensidade: string | null;
  limite_tolerancia: string | null;
  metodo_medicao: string | null;
  tipo_exposicao: string | null;
  aposentadoria_especial: boolean;
  doc_lip: boolean;
  doc_ltcat: boolean;
  doc_pgr: boolean;
  doc_pcmso: boolean;
  doc_aep: boolean;
};

/** Busca um risco com todos os campos (para edição). */
export async function getRisco(id: string): Promise<Res<RiscoCompleto>> {
  try {
    const sb = await createClient();
    const { data, error } = await sb
      .from("risco_catalogo")
      .select(
        "id,camada,nome,codigo_tabela24,categoria,qualitativo,observacoes,medidas_recomendadas,exigencias,intensidade,limite_tolerancia,metodo_medicao,tipo_exposicao,aposentadoria_especial,doc_lip,doc_ltcat,doc_pgr,doc_pcmso,doc_aep",
      )
      .eq("id", id)
      .single();
    if (error) return { ok: false, erro: error.message };
    return { ok: true, dados: data as unknown as RiscoCompleto };
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
