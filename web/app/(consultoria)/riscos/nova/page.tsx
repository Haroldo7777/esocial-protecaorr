import Link from "next/link";
import { listarAgentesEsocial } from "@/lib/data/riscos";
import { FormRisco } from "./form";

export const dynamic = "force-dynamic";

export default async function NovoRiscoPage() {
  const agentes = await listarAgentesEsocial();

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
      <FormRisco agentes={agentes} />
    </div>
  );
}
