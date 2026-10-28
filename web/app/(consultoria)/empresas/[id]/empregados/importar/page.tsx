import FormImportarEmpregados from "./form";

export const dynamic = "force-dynamic";

export default async function ImportarEmpregadosPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <FormImportarEmpregados empresaId={id} />;
}
