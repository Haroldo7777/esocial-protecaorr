import { listarEntregasEpi, TIPOS_MOV_EPI } from "@/lib/data/epi";
import { mascaraCpf } from "@/lib/validators";
import { CabecalhoLista, AvisoBanco, Vazio } from "@/components/ui";
import { EpiTabs } from "@/components/epi-tabs";

export const dynamic = "force-dynamic";

const LABEL_TIPO = Object.fromEntries(TIPOS_MOV_EPI);

function fmt(iso: string | null) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function badgeProxima(iso: string | null) {
  if (!iso) return <span className="opacity-50">—</span>;
  const venc = iso < new Date().toISOString().slice(0, 10);
  return (
    <span
      className={[
        "text-xs font-semibold rounded px-2 py-0.5",
        venc ? "bg-red-100 text-red-700" : "bg-brand-light text-brand-ink",
      ].join(" ")}
    >
      {fmt(iso)}
    </span>
  );
}

export default async function EntregasEpiPage() {
  const res = await listarEntregasEpi();

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">EPI</h1>
      <p className="text-sm opacity-70 mb-4">
        Ficha de entregas por empregado. A troca (data + periodicidade) alimenta os
        vencimentos.
      </p>
      <EpiTabs />

      <CabecalhoLista titulo="Entregas" hrefNovo="/epi/entregas/nova" rotuloNovo="+ Registrar entrega" hrefExport="/epi/entregas/export" />
      {!res.ok ? (
        <AvisoBanco erro={res.erro} />
      ) : res.dados.length === 0 ? (
        <Vazio texto="Nenhuma entrega registrada." />
      ) : (
        <div className="bg-[var(--surface)] rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide opacity-60 border-b">
                <th className="p-3">Empregado</th>
                <th className="p-3">EPI</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Qtd</th>
                <th className="p-3">Entrega</th>
                <th className="p-3">Próxima troca</th>
                <th className="p-3">Recibo</th>
              </tr>
            </thead>
            <tbody>
              {res.dados.map((e) => (
                <tr key={e.id} className="border-b last:border-0">
                  <td className="p-3">
                    <div className="font-semibold">{e.empregado?.nome ?? "—"}</div>
                    {e.empregado?.cpf ? (
                      <div className="text-xs opacity-60">{mascaraCpf(e.empregado.cpf)}</div>
                    ) : null}
                  </td>
                  <td className="p-3">
                    {e.epi?.nome ?? "—"}
                    {e.epi?.ca ? (
                      <span className="ml-1 text-xs opacity-60">CA {e.epi.ca}</span>
                    ) : null}
                  </td>
                  <td className="p-3">{LABEL_TIPO[e.tipo] ?? e.tipo}</td>
                  <td className="p-3">{e.quantidade}</td>
                  <td className="p-3">{fmt(e.data_entrega)}</td>
                  <td className="p-3">{badgeProxima(e.data_proxima)}</td>
                  <td className="p-3">{e.assinado ? "Assinado" : "Pendente"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
