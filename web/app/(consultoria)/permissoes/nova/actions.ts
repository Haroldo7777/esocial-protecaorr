"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUsuarioAtual } from "@/lib/rbac";

export type Estado = { erro?: string };

// transforma ["empresas:ver", ...] em linhas da tabela permissao
function parsePermissoes(formData: FormData, perfilId: string) {
  return formData
    .getAll("perm")
    .map(String)
    .filter(Boolean)
    .map((p) => {
      const [modulo, acao] = p.split(":");
      return { perfil_acesso_id: perfilId, modulo, acao };
    });
}

export async function criarPerfil(_prev: Estado, formData: FormData): Promise<Estado> {
  const nome = String(formData.get("nome") ?? "").trim();
  if (!nome) return { erro: "Informe o nome do perfil." };

  const usuario = await getUsuarioAtual();
  if (!usuario) return { erro: "Sessão expirada." };

  const supabase = await createClient();
  const { data: perfil, error } = await supabase
    .from("perfil_acesso")
    .insert({
      consultoria_id: usuario.consultoria_id,
      nome,
      descricao: String(formData.get("descricao") ?? "").trim() || null,
    })
    .select("id")
    .single();
  if (error) {
    if (error.code === "23505") return { erro: "Já existe um perfil com esse nome." };
    return { erro: `Não foi possível salvar: ${error.message}` };
  }

  const perms = parsePermissoes(formData, perfil.id);
  if (perms.length > 0) {
    const { error: e2 } = await supabase.from("permissao").insert(perms);
    if (e2) return { erro: `Perfil criado, mas houve erro nas permissões: ${e2.message}` };
  }
  redirect("/permissoes");
}
