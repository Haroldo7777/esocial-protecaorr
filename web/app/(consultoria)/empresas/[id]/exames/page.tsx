import { listarPlanoExame, sugestoesExamesGhe } from "@/lib/data/empresa-ctx";
import { incluirSugestao } from "./suggest-actions";
import { CabecalhoLista, AvisoBanco, Vazio } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function ExamesEmpresaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [res, sug] = await Promise.all([
    listarPlanoExame(id),
    sugestoesExamesGhe(id),
  ]);
  const incluir = incluirSugestao.bind(null, id);

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

      {/* Sugestões automáticas a partir dos riscos dos GHE */}
      {sug.ok && sug.dados.length > 0 ? (
        <div className="mt-8">
          <h2 className="text-sm font-bold uppercase tracking-wide opacity-70 mb-1">
            Sugeridos pelos riscos dos GHE
          </h2>
          <p className="text-xs opacity-60 mb-3">
            Exames exigidos pelos riscos vinculados a cada GHE (do catálogo). Defina a
            periodicidade (meses) e inclua no plano desta empresa.
          </p>
          <div className="grid gap-4">
            {sug.dados.map((g) => {
              const pendentes = g.exames.filter((e) => !e.jaNoPlano);
              if (pendentes.length === 0) return null;
              return (
                <div key={g.gheId} className="bg-[var(--surface)] rounded-xl shadow p-4">
                  <div className="font-semibold mb-2">GHE {g.referencia}</div>
                  <div className="grid gap-2">
                    {pendentes.map((e) => (
                      <form
                        key={e.nome}
                        action={incluir}
                        className="flex flex-wrap items-center gap-2 text-sm border-b last:border-0 pb-2 last:pb-0"
                      >
                        <input type="hidden" name="ghe_id" value={g.gheId} />
                        <input type="hidden" name="nome" value={e.nome} />
                        {e.exameTipoId ? (
                          <input type="hidden" name="exame_tipo_id" value={e.exameTipoId} />
                        ) : null}
                        <span className="font-medium flex-1 min-w-[10rem]">{e.nome}</span>
                        <label className="flex items-center gap-1 opacity-70">
                          <input
                            type="number"
                            name="periodicidade_meses"
                            min={1}
                            defaultValue={12}
                            className="w-16 rounded border border-gray-300 px-2 py-1"
                          />
                          meses
                        </label>
                        <button className="px-3 py-1 rounded-lg bg-brand text-white text-xs font-semibold">
                          Incluir
                        </button>
                      </form>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
