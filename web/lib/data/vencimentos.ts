import { createClient } from "@/lib/supabase/server";

export type ItemVencimento = {
  chave: string;
  natureza: "colaborador" | "acoes_programas";
  tipo: "exame" | "programa" | "treinamento" | "epi";
  item: string; // ex.: "ASO Periódico" ou "PCMSO"
  empresa: string;
  empregado: string | null;
  data_prazo: string; // yyyy-mm-dd
  dias: number; // dias até o prazo (negativo = em atraso)
};

type Res<T> = { ok: true; dados: T } | { ok: false; erro: string };

function diasAte(iso: string): number {
  const hoje = new Date();
  hoje.setUTCHours(0, 0, 0, 0);
  const [y, m, d] = iso.split("-").map(Number);
  const alvo = Date.UTC(y, m - 1, d);
  return Math.round((alvo - hoje.getTime()) / 86400000);
}

function somaMeses(iso: string, meses: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const base = new Date(Date.UTC(y, m - 1, d));
  base.setUTCMonth(base.getUTCMonth() + meses);
  return base.toISOString().slice(0, 10);
}

const LABEL_ASO: Record<string, string> = {
  admissional: "ASO Admissional",
  periodico: "ASO Periódico",
  demissional: "ASO Demissional",
  retorno: "ASO Retorno",
  mudanca: "ASO Mudança de risco",
};

/**
 * Vencimentos calculados ao vivo:
 *  - exames: o próximo ASO devido de cada empregado (último ASO com data_proximo)
 *  - programas: a vigência final de cada documento emitido
 * `horizonte` (dias) limita os "a vencer"; vencidos entram sempre.
 */
export async function listarVencimentos(opts?: {
  horizonteDias?: number;
  empresaId?: string;
}): Promise<Res<ItemVencimento[]>> {
  const horizonte = opts?.horizonteDias ?? 90;
  try {
    const sb = await createClient();

    let qAso = sb
      .from("aso")
      .select(
        "id,tipo,data_exame,data_proximo,empregado_id,empregado:empregado_id(nome),empresa:empresa_id(razao_social,nome_fantasia)",
      )
      .not("data_proximo", "is", null)
      .order("data_exame", { ascending: false });
    if (opts?.empresaId) qAso = qAso.eq("empresa_id", opts.empresaId);

    let qProg = sb
      .from("programa")
      .select(
        "id,tipo,vigencia_fim,empresa:empresa_id(razao_social,nome_fantasia)",
      )
      .not("vigencia_fim", "is", null);
    if (opts?.empresaId) qProg = qProg.eq("empresa_id", opts.empresaId);

    let qTreino = sb
      .from("turma_aluno")
      .select(
        "empregado_id,empregado:empregado_id(nome),turma:turma_id!inner(data_fim,periodicidade_meses,empresa_id,treinamento:treinamento_id(nome),empresa:empresa_id(razao_social,nome_fantasia))",
      )
      .not("turma.data_fim", "is", null)
      .not("turma.periodicidade_meses", "is", null);
    if (opts?.empresaId) qTreino = qTreino.eq("turma.empresa_id", opts.empresaId);

    let qEpi = sb
      .from("epi_entrega")
      .select(
        "id,empregado_id,data_entrega,data_proxima,epi:epi_id(nome),empregado:empregado_id(nome),empresa:empresa_id(razao_social,nome_fantasia)",
      )
      .not("data_proxima", "is", null)
      .order("data_entrega", { ascending: false });
    if (opts?.empresaId) qEpi = qEpi.eq("empresa_id", opts.empresaId);

    const [asoR, progR, treinoR, epiR] = await Promise.all([qAso, qProg, qTreino, qEpi]);
    if (asoR.error) return { ok: false, erro: asoR.error.message };
    if (progR.error) return { ok: false, erro: progR.error.message };
    if (treinoR.error) return { ok: false, erro: treinoR.error.message };
    if (epiR.error) return { ok: false, erro: epiR.error.message };

    const itens: ItemVencimento[] = [];

    // exames: manter só o ASO mais recente por empregado (já vem ordenado desc)
    const vistos = new Set<string>();
    for (const a of (asoR.data ?? []) as unknown as {
      id: string;
      tipo: string;
      empregado_id: string;
      data_proximo: string;
      empregado: { nome: string } | null;
      empresa: { razao_social: string; nome_fantasia: string | null } | null;
    }[]) {
      if (vistos.has(a.empregado_id)) continue;
      vistos.add(a.empregado_id);
      itens.push({
        chave: `aso:${a.id}`,
        natureza: "colaborador",
        tipo: "exame",
        item: LABEL_ASO[a.tipo] ?? "ASO",
        empresa: a.empresa?.nome_fantasia || a.empresa?.razao_social || "—",
        empregado: a.empregado?.nome ?? null,
        data_prazo: a.data_proximo,
        dias: diasAte(a.data_proximo),
      });
    }

    for (const p of (progR.data ?? []) as unknown as {
      id: string;
      tipo: string;
      vigencia_fim: string;
      empresa: { razao_social: string; nome_fantasia: string | null } | null;
    }[]) {
      itens.push({
        chave: `prog:${p.id}`,
        natureza: "acoes_programas",
        tipo: "programa",
        item: p.tipo.toUpperCase(),
        empresa: p.empresa?.nome_fantasia || p.empresa?.razao_social || "—",
        empregado: null,
        data_prazo: p.vigencia_fim,
        dias: diasAte(p.vigencia_fim),
      });
    }

    // treinamentos: próxima reciclagem por empregado × treinamento
    // (mantém só a turma concluída mais recente de cada combinação)
    const maisRecente = new Map<
      string,
      { empregado: string | null; empresa: string; treino: string; data_fim: string; periodicidade: number }
    >();
    for (const r of (treinoR.data ?? []) as unknown as {
      empregado_id: string;
      empregado: { nome: string } | null;
      turma: {
        data_fim: string;
        periodicidade_meses: number;
        treinamento: { nome: string } | null;
        empresa: { razao_social: string; nome_fantasia: string | null } | null;
      } | null;
    }[]) {
      if (!r.turma) continue;
      const treino = r.turma.treinamento?.nome ?? "Treinamento";
      const chave = `${r.empregado_id}|${treino}`;
      const atual = maisRecente.get(chave);
      if (!atual || r.turma.data_fim > atual.data_fim) {
        maisRecente.set(chave, {
          empregado: r.empregado?.nome ?? null,
          empresa: r.turma.empresa?.nome_fantasia || r.turma.empresa?.razao_social || "—",
          treino,
          data_fim: r.turma.data_fim,
          periodicidade: r.turma.periodicidade_meses,
        });
      }
    }
    for (const [chave, v] of maisRecente) {
      const prazo = somaMeses(v.data_fim, v.periodicidade);
      itens.push({
        chave: `treino:${chave}`,
        natureza: "colaborador",
        tipo: "treinamento",
        item: v.treino,
        empresa: v.empresa,
        empregado: v.empregado,
        data_prazo: prazo,
        dias: diasAte(prazo),
      });
    }

    // EPI: próxima troca por empregado × EPI (entrega mais recente de cada combinação)
    const epiRecente = new Map<
      string,
      { empregado: string | null; empresa: string; epi: string; data_entrega: string; data_proxima: string }
    >();
    for (const r of (epiR.data ?? []) as unknown as {
      empregado_id: string;
      data_entrega: string;
      data_proxima: string;
      epi: { nome: string } | null;
      empregado: { nome: string } | null;
      empresa: { razao_social: string; nome_fantasia: string | null } | null;
    }[]) {
      const nomeEpi = r.epi?.nome ?? "EPI";
      const chave = `${r.empregado_id}|${nomeEpi}`;
      const atual = epiRecente.get(chave);
      if (!atual || r.data_entrega > atual.data_entrega) {
        epiRecente.set(chave, {
          empregado: r.empregado?.nome ?? null,
          empresa: r.empresa?.nome_fantasia || r.empresa?.razao_social || "—",
          epi: nomeEpi,
          data_entrega: r.data_entrega,
          data_proxima: r.data_proxima,
        });
      }
    }
    for (const [chave, v] of epiRecente) {
      itens.push({
        chave: `epi:${chave}`,
        natureza: "colaborador",
        tipo: "epi",
        item: `EPI ${v.epi}`,
        empresa: v.empresa,
        empregado: v.empregado,
        data_prazo: v.data_proxima,
        dias: diasAte(v.data_proxima),
      });
    }

    const filtrados = itens
      .filter((i) => i.dias < 0 || i.dias <= horizonte)
      .sort((a, b) => a.dias - b.dias);

    return { ok: true, dados: filtrados };
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : "Erro" };
  }
}
