import Link from "next/link";
import FormAso from "./form";
import { MedicinaTabs } from "@/components/medicina-tabs";
import { AvisoBanco, Vazio } from "@/components/ui";
import { listarEmpresas } from "@/lib/data/empresas";
import { getEmpresa, listarEmpregados, listarPlanoExame } from "@/lib/data/empresa-ctx";

export const dynamic = "force-dynamic";

export default async function NovoAsoPage({
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
        <h1 className="text-xl font-bold mb-1">Registrar ASO</h1>
        <p className="text-sm opacity-70 mb-4">Escolha a empresa do empregado.</p>
        <MedicinaTabs />
        {!res.ok ? (
          <AvisoBanco erro={res.erro} />
        ) : res.empresas.length === 0 ? (
          <Vazio texto="Nenhuma empresa cadastrada." />
        ) : (
          <div className="grid gap-1 max-w-xl">
            {res.empresas.map((e) => (
              <Link
                key={e.id}
                href={`/medicina/aso/nova?empresa=${e.id}`}
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
  const [empR, empregadosR, planoR] = await Promise.all([
    getEmpresa(empresa),
    listarEmpregados(empresa, "ativo"),
    listarPlanoExame(empresa),
  ]);

  const nome = empR.ok ? empR.dados.nome_fantasia || empR.dados.razao_social : "Empresa";
  const empregados = empregadosR.ok
    ? empregadosR.dados.map((e) => ({ id: e.id, nome: e.nome }))
    : [];

  // exames do plano, deduplicados por tipo (mantém a menor periodicidade)
  const mapa = new Map<string, { id: string; nome: string; periodicidade_meses: number }>();
  if (planoR.ok) {
    for (const p of planoR.dados) {
      if (!p.exame) continue;
      const atual = mapa.get(p.exame.id);
      if (!atual || p.periodicidade_meses < atual.periodicidade_meses) {
        mapa.set(p.exame.id, {
          id: p.exame.id,
          nome: p.exame.nome,
          periodicidade_meses: p.periodicidade_meses,
        });
      }
    }
  }

  return (
    <FormAso
      empresaId={empresa}
      empresaNome={nome}
      empregados={empregados}
      exames={[...mapa.values()]}
    />
  );
}
