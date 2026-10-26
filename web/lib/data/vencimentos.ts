import { createClient } from "@/lib/supabase/server";

export type ItemVencimento = {
  chave: string;
  natureza: "colaborador" | "acoes_programas";
  tipo: "exame" | "programa";
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

    const [asoR, progR] = await Promise.all([qAso, qProg]);
    if (asoR.error) return { ok: false, erro: asoR.error.message };
    if (progR.error) return { ok: false, erro: progR.error.message };

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

    const filtrados = itens
      .filter((i) => i.dias < 0 || i.dias <= horizonte)
      .sort((a, b) => a.dias - b.dias);

    return { ok: true, dados: filtrados };
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : "Erro" };
  }
}
