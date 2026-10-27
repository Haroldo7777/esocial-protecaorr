import { createClient } from "@/lib/supabase/server";

export { TIPOS_MOV_EPI } from "@/lib/epi-defs";

export type Epi = {
  id: string;
  nome: string;
  ca: string | null;
  fabricante: string | null;
  validade_ca: string | null;
  periodicidade_troca_meses: number | null;
};

export type EpiEntrega = {
  id: string;
  tipo: string;
  data_entrega: string;
  quantidade: number;
  data_proxima: string | null;
  assinado: boolean;
  epi: { nome: string; ca: string | null } | null;
  empregado: { nome: string; cpf: string } | null;
  empresa: { razao_social: string; nome_fantasia: string | null } | null;
};

type Res<T> = { ok: true; dados: T } | { ok: false; erro: string };

export async function listarEpis(): Promise<Res<Epi[]>> {
  try {
    const sb = await createClient();
    const { data, error } = await sb
      .from("epi")
      .select("id,nome,ca,fabricante,validade_ca,periodicidade_troca_meses")
      .eq("ativo", true)
      .order("nome");
    if (error) return { ok: false, erro: error.message };
    return { ok: true, dados: (data ?? []) as Epi[] };
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : "Erro" };
  }
}

export async function listarEntregasEpi(empresaId?: string): Promise<Res<EpiEntrega[]>> {
  try {
    const sb = await createClient();
    let q = sb
      .from("epi_entrega")
      .select(
        "id,tipo,data_entrega,quantidade,data_proxima,assinado,epi:epi_id(nome,ca),empregado:empregado_id(nome,cpf),empresa:empresa_id(razao_social,nome_fantasia)",
      )
      .order("data_entrega", { ascending: false });
    if (empresaId) q = q.eq("empresa_id", empresaId);
    const { data, error } = await q;
    if (error) return { ok: false, erro: error.message };
    return { ok: true, dados: (data ?? []) as unknown as EpiEntrega[] };
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : "Erro" };
  }
}
