import Link from "next/link";
import FormTurma from "./form";
import { TreinamentosTabs } from "@/components/treinamentos-tabs";
import { AvisoBanco, Vazio } from "@/components/ui";
import { listarEmpresas } from "@/lib/data/empresas";
import { listarTreinamentos } from "@/lib/data/treinamentos";
import { getEmpresa, listarEmpregados } from "@/lib/data/empresa-ctx";

export const dynamic = "force-dynamic";

export default async function NovaTurmaPage({
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
        <h1 className="text-xl font-bold mb-1">Nova turma</h1>
        <p className="text-sm opacity-70 mb-4">Escolha a empresa da turma.</p>
        <TreinamentosTabs />
        {!res.ok ? (
          <AvisoBanco erro={res.erro} />
        ) : res.empresas.length === 0 ? (
          <Vazio texto="Nenhuma empresa cadastrada." />
        ) : (
          <div className="grid gap-1 max-w-xl">
            {res.empresas.map((e) => (
              <Link
                key={e.id}
                href={`/treinamentos/turmas/nova?empresa=${e.id}`}
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
  const [empR, treinosR, empregadosR] = await Promise.all([
    getEmpresa(empresa),
    listarTreinamentos(),
    listarEmpregados(empresa, "ativo"),
  ]);

  const nome = empR.ok ? empR.dados.nome_fantasia || empR.dados.razao_social : "Empresa";
  const treinamentos = treinosR.ok
    ? treinosR.dados.map((t) => ({
        id: t.id,
        nome: t.nome,
        nr: t.nr,
        periodicidade_meses: t.periodicidade_meses,
      }))
    : [];
  const empregados = empregadosR.ok
    ? empregadosR.dados.map((e) => ({ id: e.id, nome: e.nome }))
    : [];

  return (
    <FormTurma
      empresaId={empresa}
      empresaNome={nome}
      treinamentos={treinamentos}
      empregados={empregados}
    />
  );
}
