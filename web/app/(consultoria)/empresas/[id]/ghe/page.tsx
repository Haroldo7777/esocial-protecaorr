import { listarGhe } from "@/lib/data/empresa-ctx";
import { CabecalhoLista, AvisoBanco, Vazio } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function GhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await listarGhe(id);

  return (
    <div>
      <CabecalhoLista titulo="GHE — Grupos Homogêneos de Exposição" hrefNovo={`/empresas/${id}/ghe/nova`} rotuloNovo="+ Novo Grupo de Trabalho" />
      <p className="text-sm opacity-70 -mt-2 mb-4">
        O GHE é o núcleo do mapeamento: agrupa empregados com exposição
        semelhante e amarra ambientes, funções, riscos e medidas de controle. O
        empregado herda do GHE seus riscos e exigências.
      </p>
      {!res.ok ? (
        <AvisoBanco erro={res.erro} />
      ) : res.dados.length === 0 ? (
        <Vazio texto="Nenhum GHE. Crie o primeiro grupo de trabalho." />
      ) : (
        <div className="bg-[var(--surface)] rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide opacity-60 border-b">
                <th className="p-3">Referência</th>
                <th className="p-3">Número</th>
                <th className="p-3">Processo</th>
                <th className="p-3">Situação</th>
              </tr>
            </thead>
            <tbody>
              {res.dados.map((g) => (
                <tr key={g.id} className="border-b last:border-0">
                  <td className="p-3 font-semibold">{g.referencia}</td>
                  <td className="p-3">{g.numero}</td>
                  <td className="p-3">{g.processo ?? "—"}</td>
                  <td className="p-3">
                    {g.situacao === "completo" ? "✓ Completo" : "⚠ Incompleto"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
