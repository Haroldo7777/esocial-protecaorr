import FormPlanoExame from "./form";
import { listarTiposExame } from "@/lib/data/medicina";
import { listarGhe } from "@/lib/data/empresa-ctx";

export const dynamic = "force-dynamic";

export default async function NovoPlanoExamePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [tiposR, gheR] = await Promise.all([listarTiposExame(), listarGhe(id)]);
  const exames = tiposR.ok ? tiposR.dados.map((e) => ({ id: e.id, nome: e.nome })) : [];
  const ghes = gheR.ok ? gheR.dados.map((g) => ({ id: g.id, referencia: g.referencia })) : [];
  return <FormPlanoExame empresaId={id} exames={exames} ghes={ghes} />;
}
