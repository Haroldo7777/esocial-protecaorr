import { createClient } from "@/lib/supabase/server";

export type Empresa = {
  id: string;
  tipo_inscricao: "cnpj" | "cpf" | "caepf" | "cno";
  inscricao: string;
  razao_social: string;
  nome_fantasia: string | null;
  grau_risco: number | null;
  situacao: "liberado" | "bloqueado";
  modalidade: "gestao" | "treinamentos" | "link";
  instalacao_etapa: number;
  created_at: string;
};

export type ListaEmpresas =
  | { ok: true; empresas: Empresa[] }
  | { ok: false; erro: string };

/** Lista empresas da consultoria do usuário (RLS cuida do isolamento). */
export async function listarEmpresas(busca?: string): Promise<ListaEmpresas> {
  try {
    const supabase = await createClient();
    let q = supabase
      .from("empresa")
      .select(
        "id,tipo_inscricao,inscricao,razao_social,nome_fantasia,grau_risco,situacao,modalidade,instalacao_etapa,created_at",
      )
      .is("arquivada_em", null)
      .order("razao_social");

    if (busca && busca.trim()) {
      const t = busca.trim();
      q = q.or(
        `razao_social.ilike.%${t}%,nome_fantasia.ilike.%${t}%,inscricao.ilike.%${t.replace(/\D/g, "")}%`,
      );
    }
    const { data, error } = await q;
    if (error) return { ok: false, erro: error.message };
    return { ok: true, empresas: (data ?? []) as Empresa[] };
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : "Erro" };
  }
}
