import { createClient } from "@/lib/supabase/server";

type Res<T> = { ok: true; dados: T } | { ok: false; erro: string };

export type PerfilLista = {
  id: string;
  nome: string;
  descricao: string | null;
  tipo_usuario: string;
  padrao_sistema: boolean;
  usuarios: { count: number }[];
  permissoes: { count: number }[];
};

export async function listarPerfis(): Promise<Res<PerfilLista[]>> {
  try {
    const sb = await createClient();
    const { data, error } = await sb
      .from("perfil_acesso")
      .select(
        "id,nome,descricao,tipo_usuario,padrao_sistema,usuarios:usuario_perfil(count),permissoes:permissao(count)",
      )
      .order("nome");
    if (error) return { ok: false, erro: error.message };
    return { ok: true, dados: (data ?? []) as unknown as PerfilLista[] };
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : "Erro" };
  }
}

export type PerfilCompleto = {
  id: string;
  nome: string;
  descricao: string | null;
  tipo_usuario: string;
  padrao_sistema: boolean;
  permissoes: string[]; // "modulo:acao"
};

export async function getPerfil(id: string): Promise<Res<PerfilCompleto>> {
  try {
    const sb = await createClient();
    const [p, perms] = await Promise.all([
      sb.from("perfil_acesso").select("id,nome,descricao,tipo_usuario,padrao_sistema").eq("id", id).single(),
      sb.from("permissao").select("modulo,acao").eq("perfil_acesso_id", id),
    ]);
    if (p.error) return { ok: false, erro: p.error.message };
    if (perms.error) return { ok: false, erro: perms.error.message };
    const permissoes = ((perms.data ?? []) as { modulo: string; acao: string }[]).map(
      (r) => `${r.modulo}:${r.acao}`,
    );
    return { ok: true, dados: { ...(p.data as Omit<PerfilCompleto, "permissoes">), permissoes } };
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : "Erro" };
  }
}

export type UsuarioLista = {
  id: string;
  nome: string;
  email: string;
  tipo: string;
  ativo: boolean;
  perfis: { perfil: { id: string; nome: string } | null }[];
};

export async function listarUsuarios(): Promise<Res<UsuarioLista[]>> {
  try {
    const sb = await createClient();
    const { data, error } = await sb
      .from("usuario")
      .select("id,nome,email,tipo,ativo,perfis:usuario_perfil(perfil:perfil_acesso_id(id,nome))")
      .order("nome");
    if (error) return { ok: false, erro: error.message };
    return { ok: true, dados: (data ?? []) as unknown as UsuarioLista[] };
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : "Erro" };
  }
}

export type UsuarioAcesso = {
  id: string;
  nome: string;
  email: string;
  ativo: boolean;
  perfilIds: string[];
};
export async function getUsuario(id: string): Promise<Res<UsuarioAcesso>> {
  try {
    const sb = await createClient();
    const { data, error } = await sb
      .from("usuario")
      .select("id,nome,email,ativo,perfis:usuario_perfil(perfil_acesso_id)")
      .eq("id", id)
      .single();
    if (error) return { ok: false, erro: error.message };
    const d = data as unknown as {
      id: string; nome: string; email: string; ativo: boolean;
      perfis: { perfil_acesso_id: string }[];
    };
    return {
      ok: true,
      dados: {
        id: d.id, nome: d.nome, email: d.email, ativo: d.ativo,
        perfilIds: (d.perfis ?? []).map((p) => p.perfil_acesso_id),
      },
    };
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : "Erro" };
  }
}

export type PerfilOpt = { id: string; nome: string };
export async function listarPerfisSimples(): Promise<Res<PerfilOpt[]>> {
  try {
    const sb = await createClient();
    const { data, error } = await sb.from("perfil_acesso").select("id,nome").order("nome");
    if (error) return { ok: false, erro: error.message };
    return { ok: true, dados: (data ?? []) as PerfilOpt[] };
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : "Erro" };
  }
}
