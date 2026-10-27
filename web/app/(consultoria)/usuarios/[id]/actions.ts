"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Estado = { erro?: string };

export async function atualizarAcesso(
  id: string,
  _prev: Estado,
  formData: FormData,
): Promise<Estado> {
  const ativo = formData.get("ativo") === "on";
  const perfis = formData.getAll("perfil").map(String).filter(Boolean);

  const supabase = await createClient();

  const { error: eU } = await supabase.from("usuario").update({ ativo }).eq("id", id);
  if (eU) return { erro: `Não foi possível atualizar o status: ${eU.message}` };

  // substitui os perfis do usuário
  const { error: eDel } = await supabase.from("usuario_perfil").delete().eq("usuario_id", id);
  if (eDel) return { erro: `Erro ao atualizar perfis: ${eDel.message}` };

  if (perfis.length > 0) {
    const linhas = perfis.map((perfil_acesso_id) => ({ usuario_id: id, perfil_acesso_id }));
    const { error: eIns } = await supabase.from("usuario_perfil").insert(linhas);
    if (eIns) return { erro: `Erro ao salvar perfis: ${eIns.message}` };
  }
  redirect("/usuarios");
}
