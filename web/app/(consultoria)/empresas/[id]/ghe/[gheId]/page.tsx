import {
  getGheCompleto,
  listarAmbientes,
  listarFuncoes,
  listarEmpregados,
  listarRiscosCatalogo,
} from "@/lib/data/empresa-ctx";
import { GheWizard } from "./wizard";

export const dynamic = "force-dynamic";

export default async function GheEditorPage({
  params,
}: {
  params: Promise<{ id: string; gheId: string }>;
}) {
  const { id, gheId } = await params;

  const [completo, amb, fun, emp, ris] = await Promise.all([
    getGheCompleto(gheId),
    listarAmbientes(id),
    listarFuncoes(id),
    listarEmpregados(id),
    listarRiscosCatalogo(id),
  ]);

  return (
    <GheWizard
      empresaId={id}
      gheId={gheId}
      referencia={completo.ghe?.referencia ?? "Grupo de Trabalho"}
      initial={completo}
      disp={{
        ambientes: amb.ok ? amb.dados : [],
        funcoes: fun.ok ? fun.dados : [],
        empregados: emp.ok ? emp.dados.map((e) => ({ id: e.id, nome: e.nome })) : [],
        riscos: ris.ok ? ris.dados : [],
      }}
    />
  );
}
