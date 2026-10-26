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

export type Ambiente = { id: string; nome: string };
export async function listarAmbientes(empresaId: string) {
  return consulta<Ambiente[]>((sb) =>
    sb
      .from("ambiente")
      .select("id,nome,estabelecimento!inner(empresa_id)")
      .eq("estabelecimento.empresa_id", empresaId)
      .order("nome"),
  );
}

export type RiscoCat = { id: string; nome: string; categoria: string; codigo_tabela24: string | null; camada: string };
export async function listarRiscosCatalogo(empresaId: string) {
  return consulta<RiscoCat[]>((sb) =>
    sb
      .from("risco_catalogo")
      .select("id,nome,categoria,codigo_tabela24,camada")
      .eq("ativo", true)
      .or(`camada.eq.esocial,camada.eq.consultoria,empresa_id.eq.${empresaId}`)
      .order("categoria"),
  );
}

export type GheCompleto = {
  ghe: {
    id: string; referencia: string; numero: number; processo: string | null;
    jornada: string | null; obs_geral: string | null; obs_pgr: string | null;
    obs_ltcat: string | null; obs_pcmso: string | null;
    atividades: Record<string, unknown>; situacao: string;
  } | null;
  ambienteIds: string[];
  funcaoIds: string[];
  empregados: { empregado_id: string; inicio: string | null; fim: string | null }[];
  riscoIds: string[];
  medidas: { id: string; tipo: string; descricao: string; periodicidade_meses: number | null }[];
};

export async function getGheCompleto(gheId: string): Promise<GheCompleto> {
  const vazio: GheCompleto = {
    ghe: null, ambienteIds: [], funcaoIds: [], empregados: [], riscoIds: [], medidas: [],
  };
  try {
    const sb = await createClient();
    const [ghe, amb, fun, emp, ris, med] = await Promise.all([
      sb.from("ghe").select("id,referencia,numero,processo,jornada,obs_geral,obs_pgr,obs_ltcat,obs_pcmso,atividades,situacao").eq("id", gheId).single(),
      sb.from("ghe_ambiente").select("ambiente_id").eq("ghe_id", gheId),
      sb.from("ghe_funcao").select("funcao_id").eq("ghe_id", gheId),
      sb.from("ghe_empregado").select("empregado_id,inicio,fim").eq("ghe_id", gheId),
      sb.from("ghe_risco").select("risco_id").eq("ghe_id", gheId),
      sb.from("medida_controle").select("id,tipo,descricao,periodicidade_meses").eq("ghe_id", gheId),
    ]);
    return {
      ghe: (ghe.data as GheCompleto["ghe"]) ?? null,
      ambienteIds: ((amb.data ?? []) as { ambiente_id: string }[]).map((r) => r.ambiente_id),
      funcaoIds: ((fun.data ?? []) as { funcao_id: string }[]).map((r) => r.funcao_id),
      empregados: (emp.data ?? []) as GheCompleto["empregados"],
      riscoIds: ((ris.data ?? []) as { risco_id: string }[]).map((r) => r.risco_id),
      medidas: (med.data ?? []) as GheCompleto["medidas"],
    };
  } catch {
    return vazio;
  }
}
