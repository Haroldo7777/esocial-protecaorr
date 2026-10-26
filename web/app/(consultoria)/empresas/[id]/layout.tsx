import Link from "next/link";
import { getEmpresa } from "@/lib/data/empresa-ctx";
import { EmpresaTabs } from "@/components/empresa-tabs";

export const dynamic = "force-dynamic";

export default async function EmpresaLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await getEmpresa(id);
  const nome = res.ok ? res.dados.nome_fantasia || res.dados.razao_social : "Empresa";

  return (
    <div>
      <div className="flex items-center gap-3 flex-wrap mb-3">
        <Link href="/empresas" className="text-sm text-brand-ink">
          ← Voltar ao painel da consultoria
        </Link>
        <span className="ml-auto text-sm font-bold text-brand-ink bg-brand-light px-3 py-1 rounded-full">
          {nome}
        </span>
      </div>
      <EmpresaTabs empresaId={id} />
      {children}
    </div>
  );
}
