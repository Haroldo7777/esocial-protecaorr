import FormPrograma from "./form";
import { listarEmpresas } from "@/lib/data/empresas";

export const dynamic = "force-dynamic";

export default async function NovoProgramaPage() {
  const res = await listarEmpresas();
  const empresas = res.ok
    ? res.empresas.map((e) => ({
        id: e.id,
        razao_social: e.razao_social,
        nome_fantasia: e.nome_fantasia,
      }))
    : [];
  return <FormPrograma empresas={empresas} />;
}
