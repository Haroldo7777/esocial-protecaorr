import { listarEpis } from "@/lib/data/epi";
import { CabecalhoLista, AvisoBanco, Vazio } from "@/components/ui";
import { EpiTabs } from "@/components/epi-tabs";

export const dynamic = "force-dynamic";

function fmt(iso: string | null) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function caVencido(iso: string | null) {
  if (!iso) return false;
  return iso < new Date().toISOString().slice(0, 10);
}

export default async function EpiPage() {
  const res = await listarEpis();

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">EPI</h1>
      <p className="text-sm opacity-70 mb-4">
        Catálogo de equipamentos (CA, fabricante, validade do CA). As entregas são
        registradas por empregado e a troca alimenta os vencimentos.
      </p>
      <EpiTabs />

      <CabecalhoLista titulo="Catálogo" hrefNovo="/epi/nova" rotuloNovo="+ Novo EPI" />
      {!res.ok ? (
        <AvisoBanco erro={res.erro} />
      ) : res.dados.length === 0 ? (
        <Vazio texto="Nenhum EPI cadastrado." />
      ) : (
        <div className="bg-[var(--surface)] rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide opacity-60 border-b">
                <th className="p-3">EPI</th>
                <th className="p-3">CA</th>
                <th className="p-3">Fabricante</th>
                <th className="p-3">Validade do CA</th>
                <th className="p-3">Troca</th>
              </tr>
            </thead>
            <tbody>
              {res.dados.map((e) => (
                <tr key={e.id} className="border-b last:border-0">
                  <td className="p-3 font-semibold">{e.nome}</td>
                  <td className="p-3">{e.ca ?? "—"}</td>
                  <td className="p-3">{e.fabricante ?? "—"}</td>
                  <td className="p-3">
                    {e.validade_ca ? (
                      <span
                        className={
                          caVencido(e.validade_ca) ? "text-red-600 font-semibold" : ""
                        }
                      >
                        {fmt(e.validade_ca)}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="p-3">
                    {e.periodicidade_troca_meses
                      ? `${e.periodicidade_troca_meses} meses`
                      : "Sem troca periódica"}
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
