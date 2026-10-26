import { listarFuncoes } from "@/lib/data/empresa-ctx";
import { CabecalhoLista, AvisoBanco, Vazio } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function FuncoesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await listarFuncoes(id);

  return (
    <div>
      <CabecalhoLista titulo="Funções / Cargos" hrefNovo={`/empresas/${id}/funcoes/nova`} rotuloNovo="+ Nova função" />
      {!res.ok ? (
        <AvisoBanco erro={res.erro} />
      ) : res.dados.length === 0 ? (
        <Vazio texto="Nenhuma função. Cadastre os cargos com CBO (leiaute S-2200)." />
      ) : (
        <div className="bg-[var(--surface)] rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide opacity-60 border-b">
                <th className="p-3">Função</th>
                <th className="p-3">CBO</th>
                <th className="p-3">Periodicidade ASO</th>
              </tr>
            </thead>
            <tbody>
              {res.dados.map((f) => (
                <tr key={f.id} className="border-b last:border-0">
                  <td className="p-3 font-semibold">{f.nome}</td>
                  <td className="p-3">{f.cbo ?? "—"}</td>
                  <td className="p-3">{f.aso_periodicidade_meses ?? 12} meses</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
