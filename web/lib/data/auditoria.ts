import { createClient } from "@/lib/supabase/server";

export type Severidade = "alta" | "media" | "baixa";
export type CategoriaAchado =
  | "exame_aso"
  | "exame_plano"
  | "treinamento"
  | "epi"
  | "cadastro";

export type Achado = {
  chave: string;
  severidade: Severidade;
  categoria: CategoriaAchado;
  empresa: string;
  titulo: string;
  detalhe: string;
};

type Res<T> = { ok: true; dados: T } | { ok: false; erro: string };

const hojeISO = () => new Date().toISOString().slice(0, 10);

function somaMeses(iso: string, meses: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const base = new Date(Date.UTC(y, m - 1, d));
  base.setUTCMonth(base.getUTCMonth() + meses);
  return base.toISOString().slice(0, 10);
}

/**
 * Auditoria de conformidade do cadastro: cruza os riscos vinculados a cada GHE
 * com os exames do plano, os ASO válidos, os treinamentos e os EPIs entregues,
 * além de verificar lacunas de cadastro. As exigências do risco referenciam o
 * catálogo por ID (exame_tipo / treinamento / epi), então o cruzamento é exato.
 * Tudo calculado ao vivo (RLS isola a consultoria).
 */
export async function auditar(empresaId?: string): Promise<Res<Achado[]>> {
  try {
    const sb = await createClient();
    const hoje = hojeISO();

    let qEmpresas = sb.from("empresa").select("id,razao_social,nome_fantasia,grau_risco").is("arquivada_em", null);
    let qGhe = sb.from("ghe").select("id,empresa_id,referencia,situacao");
    let qEmpregados = sb.from("empregado").select("id,empresa_id,nome,funcao_id,situacao").eq("situacao", "ativo");
    let qFuncoes = sb.from("funcao").select("id,cbo");
    let qPlano = sb.from("plano_exame").select("empresa_id,ghe_id,exame_tipo_id").eq("ativo", true);
    let qAso = sb.from("aso").select("empregado_id,data_proximo");
    let qTurma = sb.from("turma_aluno").select("empregado_id,turma:turma_id!inner(data_fim,periodicidade_meses,empresa_id,treinamento_id)");
    let qEpiEntrega = sb.from("epi_entrega").select("empregado_id,tipo,data_proxima,empresa_id,epi_id");
    if (empresaId) {
      qEmpresas = qEmpresas.eq("id", empresaId);
      qGhe = qGhe.eq("empresa_id", empresaId);
      qEmpregados = qEmpregados.eq("empresa_id", empresaId);
      qFuncoes = qFuncoes.eq("empresa_id", empresaId);
      qPlano = qPlano.eq("empresa_id", empresaId);
      qAso = qAso.eq("empresa_id", empresaId);
      qTurma = qTurma.eq("turma.empresa_id", empresaId);
      qEpiEntrega = qEpiEntrega.eq("empresa_id", empresaId);
    }

    const [
      empresasR, gheR, gheRiscoR, gheEmpR, empregadosR, funcoesR, planoR, asoR, turmaR, epiEntregaR,
      exameCatR, treinoCatR, epiCatR,
    ] = await Promise.all([
      qEmpresas,
      qGhe,
      sb.from("ghe_risco").select("ghe_id,risco:risco_id(exigencias),ghe:ghe_id!inner(empresa_id)"),
      sb.from("ghe_empregado").select("ghe_id,empregado_id,ghe:ghe_id!inner(empresa_id)"),
      qEmpregados,
      qFuncoes,
      qPlano,
      qAso,
      qTurma,
      qEpiEntrega,
      sb.from("exame_tipo").select("id,nome"),
      sb.from("treinamento").select("id,nome,nr"),
      sb.from("epi").select("id,nome,ca"),
    ]);

    for (const r of [
      empresasR, gheR, gheRiscoR, gheEmpR, empregadosR, funcoesR, planoR, asoR, turmaR, epiEntregaR,
      exameCatR, treinoCatR, epiCatR,
    ]) {
      if (r.error) return { ok: false, erro: r.error.message };
    }

    // catálogos (id → nome para exibição)
    const exameNome = new Map<string, string>();
    for (const e of (exameCatR.data ?? []) as { id: string; nome: string }[]) exameNome.set(e.id, e.nome);
    const treinoNome = new Map<string, string>();
    for (const t of (treinoCatR.data ?? []) as { id: string; nome: string; nr: string | null }[])
      treinoNome.set(t.id, t.nr ? `${t.nome} (${t.nr})` : t.nome);
    const epiNome = new Map<string, string>();
    for (const p of (epiCatR.data ?? []) as { id: string; nome: string; ca: string | null }[])
      epiNome.set(p.id, p.ca ? `${p.nome} (CA ${p.ca})` : p.nome);

    const nomeEmpresa = new Map<string, string>();
    for (const e of (empresasR.data ?? []) as { id: string; razao_social: string; nome_fantasia: string | null }[]) {
      nomeEmpresa.set(e.id, e.nome_fantasia || e.razao_social);
    }

    // GHE
    const ghes = (gheR.data ?? []) as { id: string; empresa_id: string; referencia: string; situacao: string }[];
    const gheMap = new Map(ghes.map((g) => [g.id, g]));

    // exigências por GHE (IDs do catálogo, acumulados dos riscos do GHE)
    const exigGhe = new Map<string, { exames: Set<string>; treinos: Set<string>; epis: Set<string> }>();
    for (const row of (gheRiscoR.data ?? []) as unknown as {
      ghe_id: string;
      risco: { exigencias: { exames?: string[]; treinamentos?: string[]; epis?: string[] } | null } | null;
    }[]) {
      if (!gheMap.has(row.ghe_id)) continue; // respeita filtro de empresa
      if (!exigGhe.has(row.ghe_id))
        exigGhe.set(row.ghe_id, { exames: new Set(), treinos: new Set(), epis: new Set() });
      const alvo = exigGhe.get(row.ghe_id)!;
      for (const id of row.risco?.exigencias?.exames ?? []) if (id) alvo.exames.add(id);
      for (const id of row.risco?.exigencias?.treinamentos ?? []) if (id) alvo.treinos.add(id);
      for (const id of row.risco?.exigencias?.epis ?? []) if (id) alvo.epis.add(id);
    }

    // empregados por GHE
    const empregadosDoGhe = new Map<string, string[]>();
    const empregadoTemGhe = new Set<string>();
    for (const row of (gheEmpR.data ?? []) as { ghe_id: string; empregado_id: string }[]) {
      if (!gheMap.has(row.ghe_id)) continue;
      if (!empregadosDoGhe.has(row.ghe_id)) empregadosDoGhe.set(row.ghe_id, []);
      empregadosDoGhe.get(row.ghe_id)!.push(row.empregado_id);
      empregadoTemGhe.add(row.empregado_id);
    }

    // empregados ativos
    const empregados = (empregadosR.data ?? []) as {
      id: string;
      empresa_id: string;
      nome: string;
      funcao_id: string | null;
    }[];
    const empregadoMap = new Map(empregados.map((e) => [e.id, e]));
    const funcaoCbo = new Map<string, string | null>();
    for (const f of (funcoesR.data ?? []) as { id: string; cbo: string | null }[]) funcaoCbo.set(f.id, f.cbo);

    // plano de exames: cobertura por exame_tipo_id (empresa-wide e por GHE)
    const planoEmpresa = new Set<string>(); // `${empresa_id}|${exameTipoId}`
    const planoPorGhe = new Set<string>(); // `${ghe_id}|${exameTipoId}`
    for (const p of (planoR.data ?? []) as {
      empresa_id: string;
      ghe_id: string | null;
      exame_tipo_id: string;
    }[]) {
      if (p.ghe_id) planoPorGhe.add(`${p.ghe_id}|${p.exame_tipo_id}`);
      else planoEmpresa.add(`${p.empresa_id}|${p.exame_tipo_id}`);
    }

    // ASO válido (data_proximo >= hoje) por empregado
    const asoValido = new Set<string>();
    for (const a of (asoR.data ?? []) as { empregado_id: string; data_proximo: string | null }[]) {
      if (a.data_proximo && a.data_proximo >= hoje) asoValido.add(a.empregado_id);
    }

    // treinamentos válidos por empregado (por treinamento_id; sem reciclagem = sempre válido)
    const treinoValido = new Map<string, Set<string>>();
    for (const r of (turmaR.data ?? []) as unknown as {
      empregado_id: string;
      turma: {
        data_fim: string | null;
        periodicidade_meses: number | null;
        empresa_id: string;
        treinamento_id: string;
      } | null;
    }[]) {
      const t = r.turma;
      if (!t || !t.data_fim) continue;
      if (empresaId && t.empresa_id !== empresaId) continue;
      const vence = t.periodicidade_meses ? somaMeses(t.data_fim, t.periodicidade_meses) : null;
      if (vence && vence < hoje) continue; // reciclagem vencida não conta
      if (!treinoValido.has(r.empregado_id)) treinoValido.set(r.empregado_id, new Set());
      treinoValido.get(r.empregado_id)!.add(t.treinamento_id);
    }

    // EPIs válidos por empregado (por epi_id; entrega/troca com troca em dia; devolução não conta)
    const epiValido = new Map<string, Set<string>>();
    for (const r of (epiEntregaR.data ?? []) as {
      empregado_id: string;
      tipo: string;
      data_proxima: string | null;
      epi_id: string;
    }[]) {
      if (r.tipo === "devolucao") continue;
      if (r.data_proxima && r.data_proxima < hoje) continue; // troca vencida não conta
      if (!epiValido.has(r.empregado_id)) epiValido.set(r.empregado_id, new Set());
      epiValido.get(r.empregado_id)!.add(r.epi_id);
    }

    const achados: Achado[] = [];
    const vistos = new Set<string>();
    const add = (a: Achado) => {
      if (vistos.has(a.chave)) return;
      vistos.add(a.chave);
      achados.push(a);
    };

    // --- achados por GHE/exposição ---
    for (const g of ghes) {
      const emp = nomeEmpresa.get(g.empresa_id) ?? "—";
      const exig = exigGhe.get(g.id);

      if (g.situacao === "incompleto") {
        add({
          chave: `ghe_incompleto:${g.id}`,
          severidade: "baixa",
          categoria: "cadastro",
          empresa: emp,
          titulo: `GHE ${g.referencia} incompleto`,
          detalhe: "Mapeamento do GHE não finalizado (ambientes, funções, riscos ou empregados).",
        });
      }
      if (!exig) continue;

      // exame exigido fora do plano (PCMSO)
      for (const exameId of exig.exames) {
        const coberto =
          planoEmpresa.has(`${g.empresa_id}|${exameId}`) || planoPorGhe.has(`${g.id}|${exameId}`);
        if (!coberto) {
          const nome = exameNome.get(exameId) ?? "exame";
          add({
            chave: `exame_plano:${g.id}:${exameId}`,
            severidade: "media",
            categoria: "exame_plano",
            empresa: emp,
            titulo: `Exame fora do plano: ${nome}`,
            detalhe: `GHE ${g.referencia} tem risco que exige "${nome}", mas o exame não está no plano (PCMSO) da empresa.`,
          });
        }
      }

      const temExameExigido = exig.exames.size > 0;
      for (const empId of empregadosDoGhe.get(g.id) ?? []) {
        const e = empregadoMap.get(empId);
        if (!e) continue; // só ativos

        // exposto sem ASO válido
        if (temExameExigido && !asoValido.has(empId)) {
          add({
            chave: `exame_aso:${empId}`,
            severidade: "alta",
            categoria: "exame_aso",
            empresa: emp,
            titulo: `Exposto sem ASO válido: ${e.nome}`,
            detalhe: `Empregado em GHE com risco que exige exame, sem ASO vigente (vencido ou inexistente).`,
          });
        }

        // exposto sem treinamento exigido
        const treinoOk = treinoValido.get(empId) ?? new Set<string>();
        for (const treinoId of exig.treinos) {
          if (!treinoOk.has(treinoId)) {
            const nome = treinoNome.get(treinoId) ?? "treinamento";
            add({
              chave: `treino:${empId}:${treinoId}`,
              severidade: "alta",
              categoria: "treinamento",
              empresa: emp,
              titulo: `Sem treinamento exigido: ${e.nome}`,
              detalhe: `GHE ${g.referencia} exige "${nome}" e o empregado não tem turma válida (vencida ou inexistente).`,
            });
          }
        }

        // exposto sem EPI exigido
        const episOk = epiValido.get(empId) ?? new Set<string>();
        for (const epiId of exig.epis) {
          if (!episOk.has(epiId)) {
            const nome = epiNome.get(epiId) ?? "EPI";
            add({
              chave: `epi:${empId}:${epiId}`,
              severidade: "alta",
              categoria: "epi",
              empresa: emp,
              titulo: `Sem EPI exigido: ${e.nome}`,
              detalhe: `GHE ${g.referencia} exige "${nome}" e o empregado não tem entrega válida (troca vencida ou inexistente).`,
            });
          }
        }
      }
    }

    // --- achados de cadastro por empregado ---
    for (const e of empregados) {
      const emp = nomeEmpresa.get(e.empresa_id) ?? "—";
      if (!empregadoTemGhe.has(e.id)) {
        add({
          chave: `sem_ghe:${e.id}`,
          severidade: "media",
          categoria: "cadastro",
          empresa: emp,
          titulo: `Empregado sem GHE: ${e.nome}`,
          detalhe: "Empregado ativo não vinculado a nenhum GHE — sem base para exigências de SST.",
        });
      }
      if (!e.funcao_id) {
        add({
          chave: `sem_funcao:${e.id}`,
          severidade: "baixa",
          categoria: "cadastro",
          empresa: emp,
          titulo: `Empregado sem função: ${e.nome}`,
          detalhe: "Empregado ativo sem função/cargo definido (CBO exigido no S-2200).",
        });
      } else if (!funcaoCbo.get(e.funcao_id)) {
        add({
          chave: `funcao_sem_cbo:${e.id}`,
          severidade: "baixa",
          categoria: "cadastro",
          empresa: emp,
          titulo: `Função sem CBO: ${e.nome}`,
          detalhe: "A função do empregado não tem CBO preenchido (obrigatório no eSocial).",
        });
      }
    }

    // --- empresa sem grau de risco ---
    for (const e of (empresasR.data ?? []) as { id: string; razao_social: string; nome_fantasia: string | null; grau_risco: number | null }[]) {
      if (e.grau_risco == null) {
        add({
          chave: `sem_grau:${e.id}`,
          severidade: "baixa",
          categoria: "cadastro",
          empresa: e.nome_fantasia || e.razao_social,
          titulo: "Empresa sem grau de risco",
          detalhe: "Grau de risco (NR-04) não informado — base para dimensionamento e exigências.",
        });
      }
    }

    const ordem: Record<Severidade, number> = { alta: 0, media: 1, baixa: 2 };
    achados.sort((a, b) => ordem[a.severidade] - ordem[b.severidade] || a.empresa.localeCompare(b.empresa));
    return { ok: true, dados: achados };
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : "Erro" };
  }
}
