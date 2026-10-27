import Link from "next/link";
import { getRisco, listarAgentesEsocial } from "@/lib/data/riscos";
import { listarTiposExame } from "@/lib/data/medicina";
import { listarTreinamentos } from "@/lib/data/treinamentos";
import { listarEpis } from "@/lib/data/epi";
import { FormRisco, type RiscoInicial } from "../../nova/form";
import { atualizarRisco } from "./actions";
import { AvisoBanco } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function EditarRiscoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [riscoR, agentes, examesR, treinosR, episR] = await Promise.all([
    getRisco(id),
    listarAgentesEsocial(),
    listarTiposExame(),
    listarTreinamentos(),
    listarEpis(),
  ]);

  if (!riscoR.ok) {
    return (
      <div>
        <Link href="/riscos?camada=consultoria" className="text-sm text-brand-ink">
          ← Voltar ao catálogo
        </Link>
        <AvisoBanco erro={riscoR.erro} />
      </div>
    );
  }

  const r = riscoR.dados;
  if (r.camada === "esocial") {
    return (
      <div>
        <Link href="/riscos?camada=esocial" className="text-sm text-brand-ink">
          ← Voltar ao catálogo
        </Link>
        <p className="text-sm text-red-600 mt-3">
          Riscos da camada oficial do eSocial são somente leitura.
        </p>
      </div>
    );
  }

  const exames = examesR.ok ? examesR.dados.map((e) => ({ id: e.id, nome: e.nome })) : [];
  const treinamentos = treinosR.ok
    ? treinosR.dados.map((t) => ({ id: t.id, nome: t.nr ? `${t.nome} (${t.nr})` : t.nome }))
    : [];
  const epis = episR.ok
    ? episR.dados.map((e) => ({ id: e.id, nome: e.ca ? `${e.nome} (CA ${e.ca})` : e.nome }))
    : [];

  const initial: RiscoInicial = {
    nome: r.nome,
    codigo_tabela24: r.codigo_tabela24,
    categoria: r.categoria,
    qualitativo: r.qualitativo,
    observacoes: r.observacoes,
    medidas_recomendadas: Array.isArray(r.medidas_recomendadas) ? r.medidas_recomendadas : [],
    exames: r.exigencias?.exames ?? [],
    treinamentos: r.exigencias?.treinamentos ?? [],
    epis: r.exigencias?.epis ?? [],
    intensidade: r.intensidade,
    limite_tolerancia: r.limite_tolerancia,
    metodo_medicao: r.metodo_medicao,
    tipo_exposicao: r.tipo_exposicao,
    aposentadoria_especial: r.aposentadoria_especial,
    doc_lip: r.doc_lip,
    doc_ltcat: r.doc_ltcat,
    doc_pgr: r.doc_pgr,
    doc_pcmso: r.doc_pcmso,
    doc_aep: r.doc_aep,
  };

  const acao = atualizarRisco.bind(null, id);

  return (
    <div>
      <Link href="/riscos?camada=consultoria" className="text-sm text-brand-ink">
        ← Voltar ao catálogo
      </Link>
      <h1 className="text-xl font-bold mt-2 mb-1">Editar Risco</h1>
      <p className="text-sm opacity-70 mb-4">
        Ao alterar as exigências, reaplique o risco aos GHE para refletir no mapeamento
        e na auditoria.
      </p>
      <FormRisco
        agentes={agentes}
        exames={exames}
        treinamentos={treinamentos}
        epis={epis}
        action={acao}
        initial={initial}
        submitLabel="Salvar alterações"
      />
    </div>
  );
}
