import { listarPlanoExame } from "@/lib/data/empresa-ctx";
import { CabecalhoLista, AvisoBanco, Vazio } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function ExamesEmpresaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await listarPlanoExame(id);

  return (
    <div>
      <p className="text-sm opacity-70 mb-4">
        Quadro de exames desta empresa. A periodicidade definida aqui é a que sai no
        PCMSO e calcula o vencimento do próximo ASO de cada empregado.
      </p>
      <CabecalhoLista
        titulo="Exames do PCMSO"
        hrefNovo={`/empresas/${id}/exames/nova`}
        rotuloNovo="+ Incluir exame"
      />
      {!res.ok ? (
        <AvisoBanco erro={res.erro} />
      ) : res.dados.length === 0 ? (
        <Vazio texto="Nenhum exame incluído no plano desta empresa." />
      ) : (
        <div className="bg-[var(--surface)] rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide opacity-60 border-b">
                <th className="p-3">Exame</th>
                <th className="p-3">Periodicidade</th>
                <th className="p-3">Abrangência</th>
                <th className="p-3">Observação</th>
              </tr>
            </thead>
            <tbody>
              {res.dados.map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="p-3 font-semibold">{p.exame?.nome ?? "—"}</td>
                  <td className="p-3">{p.periodicidade_meses} meses</td>
                  <td className="p-3">
                    {p.ghe ? `GHE ${p.ghe.referencia}` : "Empresa toda"}
                  </td>
                  <td className="p-3 opacity-70">{p.observacao ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
