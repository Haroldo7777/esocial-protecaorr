import { createClient } from "@/lib/supabase/server";

export type Consultoria = {
  id: string;
  razao_social: string;
  nome_fantasia: string | null;
  cnpj: string | null;
  cor_primaria: string | null;
  logo_url: string | null;
};

type Res<T> = { ok: true; dados: T | null } | { ok: false; erro: string };

/** Consultoria do usuário logado (RLS já isola; há no máximo uma visível). */
export async function getConsultoria(): Promise<Res<Consultoria>> {
  try {
    const sb = await createClient();
    const { data, error } = await sb
      .from("consultoria")
      .select("id,razao_social,nome_fantasia,cnpj,cor_primaria,logo_url")
      .limit(1)
      .maybeSingle();
    if (error) return { ok: false, erro: error.message };
    return { ok: true, dados: (data as Consultoria) ?? null };
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : "Erro" };
  }
}
