"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AplicarPayload = {
  dados: {
    numero: number;
    processo: string;
    jornada: string;
    obs_geral: string;
    obs_pgr: string;
    obs_ltcat: string;
    obs_pcmso: string;
  };
  atividades: {
    insalubridade_grau: string;
    periculosas: string[];
    insalubres: string[];
  };
  ambienteIds: string[];
  funcaoIds: string[];
  empregados: { empregado_id: string; inicio: string | null; fim: string | null }[];
  riscoIds: string[];
  medidas: { tipo: string; descricao: string; periodicidade_meses: number | null }[];
};

export async function aplicarGhe(
  gheId: string,
  empresaId: string,
  p: AplicarPayload,
): Promise<{ erro?: string }> {
  const sb = await createClient();

  const completo =
    p.funcaoIds.length > 0 && p.riscoIds.length > 0 && p.medidas.length > 0;

  const { error: e1 } = await sb
    .from("ghe")
    .update({
      numero: p.dados.numero,
      processo: p.dados.processo || null,
      jornada: p.dados.jornada || null,
      obs_geral: p.dados.obs_geral || null,
      obs_pgr: p.dados.obs_pgr || null,
      obs_ltcat: p.dados.obs_ltcat || null,
      obs_pcmso: p.dados.obs_pcmso || null,
      atividades: p.atividades,
      situacao: completo ? "completo" : "incompleto",
    })
    .eq("id", gheId);
  if (e1) return { erro: e1.message };

  // substitui os vínculos (deleta e reinsere)
  const troca = async (
    tabela: string,
    linhas: Record<string, unknown>[],
  ): Promise<string | null> => {
    const d = await sb.from(tabela).delete().eq("ghe_id", gheId);
    if (d.error) return d.error.message;
    if (linhas.length) {
      const i = await sb.from(tabela).insert(linhas);
      if (i.error) return i.error.message;
    }
    return null;
  };

  const erros = await Promise.all([
    troca("ghe_ambiente", p.ambienteIds.map((ambiente_id) => ({ ghe_id: gheId, ambiente_id }))),
    troca("ghe_funcao", p.funcaoIds.map((funcao_id) => ({ ghe_id: gheId, funcao_id }))),
    troca("ghe_risco", p.riscoIds.map((risco_id) => ({ ghe_id: gheId, risco_id }))),
    troca(
      "ghe_empregado",
      p.empregados.map((e) => ({
        ghe_id: gheId,
        empregado_id: e.empregado_id,
        inicio: e.inicio || null,
        fim: e.fim || null,
      })),
    ),
    troca(
      "medida_controle",
      p.medidas.map((m) => ({
        ghe_id: gheId,
        tipo: m.tipo,
        descricao: m.descricao,
        periodicidade_meses: m.periodicidade_meses,
      })),
    ),
  ]);
  const err = erros.find(Boolean);
  if (err) return { erro: err };

  redirect(`/empresas/${empresaId}/ghe`);
}
