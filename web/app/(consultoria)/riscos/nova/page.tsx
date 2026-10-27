import Link from "next/link";
import { listarAgentesEsocial } from "@/lib/data/riscos";
import { listarTiposExame } from "@/lib/data/medicina";
import { listarTreinamentos } from "@/lib/data/treinamentos";
import { listarEpis } from "@/lib/data/epi";
import { FormRisco } from "./form";

export const dynamic = "force-dynamic";

export default async function NovoRiscoPage() {
  const [agentes, examesR, treinosR, episR] = await Promise.all([
    listarAgentesEsocial(),
    listarTiposExame(),
    listarTreinamentos(),
    listarEpis(),
  ]);

  const exames = examesR.ok ? examesR.dados.map((e) => ({ id: e.id, nome: e.nome })) : [];
  const treinamentos = treinosR.ok
    ? treinosR.dados.map((t) => ({ id: t.id, nome: t.nr ? `${t.nome} (${t.nr})` : t.nome }))
    : [];
  const epis = episR.ok
    ? episR.dados.map((e) => ({ id: e.id, nome: e.ca ? `${e.nome} (CA ${e.ca})` : e.nome }))
    : [];

  return (
    <div>
      <Link href="/riscos?camada=consultoria" className="text-sm text-brand-ink">
        ← Voltar ao catálogo
      </Link>
      <h1 className="text-xl font-bold mt-2 mb-1">Cadastro de Risco</h1>
      <p className="text-sm opacity-70 mb-4">
        Camada <b>Consultoria</b>. Ao editar um risco, lembre de reaplicá-lo ao GHE
        para persistir as mudanças no mapeamento.
      </p>
      <FormRisco agentes={agentes} exames={exames} treinamentos={treinamentos} epis={epis} />
    </div>
  );
}
