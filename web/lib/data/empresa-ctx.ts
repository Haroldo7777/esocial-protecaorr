import { createClient } from "@/lib/supabase/server";

type Res<T> = { ok: true; dados: T } | { ok: false; erro: string };

async function consulta<T>(
  fn: (sb: Awaited<ReturnType<typeof createClient>>) => PromiseLike<{
    data: unknown;
    error: { message: string } | null;
  }>,
): Promise<Res<T>> {
  try {
    const sb = await createClient();
    const { data, error } = await fn(sb);
    if (error) return { ok: false, erro: error.message };
    return { ok: true, dados: (data ?? []) as T };
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : "Erro" };
  }
}

export async function getEmpresa(id: string) {
  return consulta<{ id: string; razao_social: string; nome_fantasia: string | null; situacao: string; instalacao_etapa: number; tipo_inscricao: string; inscricao: string }>(
    (sb) =>
      sb.from("empresa").select("id,razao_social,nome_fantasia,situacao,instalacao_etapa,tipo_inscricao,inscricao").eq("id", id).single(),
  );
}

export type Estabelecimento = { id: string; tipo_unidade: string; tipo_inscricao: string; inscricao: string; apelido: string | null; cidade: string | null; uf: string | null };
export async function listarEstabelecimentos(empresaId: string) {
  return consulta<Estabelecimento[]>((sb) =>
    sb.from("estabelecimento").select("id,tipo_unidade,tipo_inscricao,inscricao,apelido,cidade,uf").eq("empresa_id", empresaId).order("tipo_unidade"),
  );
}

export type Funcao = { id: string; nome: string; cbo: string | null; aso_periodicidade_meses: number | null };
export async function listarFuncoes(empresaId: string) {
  return consulta<Funcao[]>((sb) =>
    sb.from("funcao").select("id,nome,cbo,aso_periodicidade_meses").eq("empresa_id", empresaId).order("nome"),
  );
}

export type Empregado = { id: string; nome: string; cpf: string; matricula: string | null; categoria_esocial: string | null; situacao: string; funcao: { nome: string } | null };
export async function listarEmpregados(empresaId: string, situacao = "ativo") {
  return consulta<Empregado[]>((sb) =>
    sb.from("empregado").select("id,nome,cpf,matricula,categoria_esocial,situacao,funcao:funcao_id(nome)").eq("empresa_id", empresaId).eq("situacao", situacao).order("nome"),
  );
}

export type Ghe = { id: string; referencia: string; numero: number; processo: string | null; situacao: string };
export async function listarGhe(empresaId: string) {
  return consulta<Ghe[]>((sb) =>
    sb.from("ghe").select("id,referencia,numero,processo,situacao").eq("empresa_id", empresaId).order("referencia"),
  );
}
