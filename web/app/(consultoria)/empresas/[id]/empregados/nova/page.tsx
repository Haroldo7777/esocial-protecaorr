import Link from "next/link";
import { listarFuncoes } from "@/lib/data/empresa-ctx";
import { FormEmpregado } from "./form";

export const dynamic = "force-dynamic";

export default async function NovoEmpregado({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await listarFuncoes(id);
  const funcoes = res.ok ? res.dados.map((f) => ({ id: f.id, nome: f.nome })) : [];

  return (
    <div className="max-w-3xl">
      <Link href={`/empresas/${id}/empregados`} className="text-sm text-brand-ink">
        ← Voltar
      </Link>
      <h2 className="text-lg font-bold mt-2 mb-1">Novo empregado</h2>
      <p className="text-sm opacity-70 mb-4">
        Campos conforme o leiaute S-2200. Dados pessoais não são usados em
        testes; aqui entram dados reais só com o banco no ar (LGPD).
      </p>
      <FormEmpregado empresaId={id} funcoes={funcoes} />
    </div>
  );
}
