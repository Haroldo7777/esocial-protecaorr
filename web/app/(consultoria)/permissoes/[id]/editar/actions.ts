"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Estado = { erro?: string };

export async function atualizarPerfil(
  id: string,
  _prev: Estado,
  formData: FormData,
): Promise<Estado> {
  const nome = String(formData.get("nome") ?? "").trim();
  if (!nome) return { erro: "Informe o nome do perfil." };

  const supabase = await createClient();

  // perfis padrão do sistema não podem ser editados
  const { data: perfil } = await supabase
    .from("perfil_acesso")
    .select("padrao_sistema")
    .eq("id", id)
    .single();
  if (perfil?.padrao_sistema) return { erro: "Perfil padrão do sistema é somente leitura." };

  const { error } = await supabase
    .from("perfil_acesso")
    .update({
      nome,
      descricao: String(formData.get("descricao") ?? "").trim() || null,
    })
    .eq("id", id);
  if (error) {
    if (error.code === "23505") return { erro: "Já existe um perfil com esse nome." };
    return { erro: `Não foi possível salvar: ${error.message}` };
  }

  // substitui as permissões: apaga e reinsere
  const { error: eDel } = await supabase.from("permissao").delete().eq("perfil_acesso_id", id);
  if (eDel) return { erro: `Erro ao atualizar permissões: ${eDel.message}` };

  const perms = formData
    .getAll("perm")
    .map(String)
    .filter(Boolean)
    .map((p) => {
      const [modulo, acao] = p.split(":");
      return { perfil_acesso_id: id, modulo, acao };
    });
  if (perms.length > 0) {
    const { error: eIns } = await supabase.from("permissao").insert(perms);
    if (eIns) return { erro: `Erro ao salvar permissões: ${eIns.message}` };
  }
  redirect("/permissoes");
}
