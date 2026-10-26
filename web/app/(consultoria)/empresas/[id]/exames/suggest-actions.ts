"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUsuarioAtual } from "@/lib/rbac";

/**
 * Inclui no plano da empresa um exame sugerido pelos riscos de um GHE.
 * Se o exame ainda não existir no catálogo (exame_tipo), cria-o antes.
 */
export async function incluirSugestao(empresaId: string, formData: FormData) {
  const ghe_id = String(formData.get("ghe_id") ?? "") || null;
  const nome = String(formData.get("nome") ?? "").trim();
  let exame_tipo_id = String(formData.get("exame_tipo_id") ?? "") || "";
  const periodicidade = Number(formData.get("periodicidade_meses"));
  const meses = Number.isFinite(periodicidade) && periodicidade > 0 ? periodicidade : 12;

  if (!nome && !exame_tipo_id) return;

  const usuario = await getUsuarioAtual();
  if (!usuario) return;

  const supabase = await createClient();

  // garante o tipo de exame no catálogo da consultoria
  if (!exame_tipo_id) {
    const { data: achado } = await supabase
      .from("exame_tipo")
      .select("id")
      .eq("consultoria_id", usuario.consultoria_id)
      .ilike("nome", nome)
      .maybeSingle();
    if (achado?.id) {
      exame_tipo_id = achado.id;
    } else {
      const { data: criado, error } = await supabase
        .from("exame_tipo")
        .insert({ consultoria_id: usuario.consultoria_id, nome, aso_periodico: true })
        .select("id")
        .single();
      if (error || !criado) return;
      exame_tipo_id = criado.id;
    }
  }

  await supabase.from("plano_exame").insert({
    empresa_id: empresaId,
    ghe_id,
    exame_tipo_id,
    periodicidade_meses: meses,
  });
  // 23505 (já no plano) é silenciosamente ignorado

  revalidatePath(`/empresas/${empresaId}/exames`);
}
