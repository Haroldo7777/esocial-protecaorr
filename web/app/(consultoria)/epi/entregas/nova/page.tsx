import Link from "next/link";
import FormEntrega from "./form";
import { EpiTabs } from "@/components/epi-tabs";
import { AvisoBanco, Vazio } from "@/components/ui";
import { listarEmpresas } from "@/lib/data/empresas";
import { listarEpis } from "@/lib/data/epi";
import { getEmpresa, listarEmpregados } from "@/lib/data/empresa-ctx";

export const dynamic = "force-dynamic";

export default async function NovaEntregaPage({
  searchParams,
}: {
  searchParams: Promise<{ empresa?: string }>;
}) {
  const { empresa } = await searchParams;

  // Passo 1 — escolher a empresa
  if (!empresa) {
    const res = await listarEmpresas();
    return (
      <div>
        <h1 className="text-xl font-bold mb-1">Registrar entrega de EPI</h1>
        <p className="text-sm opacity-70 mb-4">Escolha a empresa do empregado.</p>
        <EpiTabs />
        {!res.ok ? (
          <AvisoBanco erro={res.erro} />
        ) : res.empresas.length === 0 ? (
          <Vazio texto="Nenhuma empresa cadastrada." />
        ) : (
          <div className="grid gap-1 max-w-xl">
            {res.empresas.map((e) => (
              <Link
                key={e.id}
                href={`/epi/entregas/nova?empresa=${e.id}`}
                className="bg-[var(--surface)] rounded-lg shadow px-4 py-3 text-sm hover:bg-gray-50"
              >
                {e.nome_fantasia || e.razao_social}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Passo 2 — formulário para a empresa escolhida
  const [empR, episR, empregadosR] = await Promise.all([
    getEmpresa(empresa),
    listarEpis(),
    listarEmpregados(empresa, "ativo"),
  ]);

  const nome = empR.ok ? empR.dados.nome_fantasia || empR.dados.razao_social : "Empresa";
  const epis = episR.ok
    ? episR.dados.map((e) => ({
        id: e.id,
        nome: e.nome,
        ca: e.ca,
        periodicidade_troca_meses: e.periodicidade_troca_meses,
      }))
    : [];
  const empregados = empregadosR.ok
    ? empregadosR.dados.map((e) => ({ id: e.id, nome: e.nome }))
    : [];

  return (
    <FormEntrega
      empresaId={empresa}
      empresaNome={nome}
      epis={epis}
      empregados={empregados}
    />
  );
}
