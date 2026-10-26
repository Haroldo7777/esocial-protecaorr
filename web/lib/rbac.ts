import { createClient } from "@/lib/supabase/server";

export type Acao = "ver" | "criar" | "editar" | "excluir";

/** Usuário logado (com dados da tabela usuario) ou null. */
export async function getUsuarioAtual() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("usuario")
    .select("id, nome, email, tipo, consultoria_id, ativo")
    .eq("id", user.id)
    .single();
  return data ?? null;
}

/**
 * Verifica no banco se o usuário logado tem a permissão (modulo, acao).
 * Usa a função SQL app_tem_permissao — o enforcement real é no servidor + RLS.
 */
export async function temPermissao(modulo: string, acao: Acao): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("app_tem_permissao", {
    p_modulo: modulo,
    p_acao: acao,
  });
  if (error) return false;
  return data === true;
}

/** Lança (para ser capturado pela página/action) quando não há permissão. */
export async function exigirPermissao(modulo: string, acao: Acao) {
  if (!(await temPermissao(modulo, acao))) {
    throw new Error("SEM_PERMISSAO");
  }
}
