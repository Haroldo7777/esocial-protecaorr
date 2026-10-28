import { listarAsos, LABEL_TIPO_ASO } from "@/lib/data/medicina";
import { mascaraCpf } from "@/lib/validators";
import { CabecalhoLista, AvisoBanco, Vazio } from "@/components/ui";
import { MedicinaTabs } from "@/components/medicina-tabs";

export const dynamic = "force-dynamic";

function fmt(iso: string | null) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function badgeProximo(iso: string | null) {
  if (!iso) return null;
  const hoje = new Date().toISOString().slice(0, 10);
  const venc = iso < hoje;
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

export default async function AsoPage() {
  const res = await listarAsos();

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">Medicina</h1>
      <p className="text-sm opacity-70 mb-4">
        ASO emitidos. O vencimento do próximo periódico usa a periodicidade do plano
        de exames da empresa.
      </p>
      <MedicinaTabs />

      <CabecalhoLista titulo="ASO" hrefNovo="/medicina/aso/nova" rotuloNovo="+ Registrar ASO" hrefExport="/medicina/aso/export" />
      {!res.ok ? (
        <AvisoBanco erro={res.erro} />
      ) : res.dados.length === 0 ? (
        <Vazio texto="Nenhum ASO registrado." />
      ) : (
        <div className="bg-[var(--surface)] rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide opacity-60 border-b">
                <th className="p-3">Empregado</th>
                <th className="p-3">Empresa</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Data</th>
                <th className="p-3">Resultado</th>
                <th className="p-3">Próximo</th>
              </tr>
            </thead>
            <tbody>
              {res.dados.map((a) => (
                <tr key={a.id} className="border-b last:border-0">
                  <td className="p-3">
                    <div className="font-semibold">{a.empregado?.nome ?? "—"}</div>
                    {a.empregado?.cpf ? (
                      <div className="text-xs opacity-60">{mascaraCpf(a.empregado.cpf)}</div>
                    ) : null}
                  </td>
                  <td className="p-3">
                    {a.empresa?.nome_fantasia || a.empresa?.razao_social || "—"}
                  </td>
                  <td className="p-3">{LABEL_TIPO_ASO[a.tipo] ?? a.tipo}</td>
                  <td className="p-3">{fmt(a.data_exame)}</td>
                  <td className="p-3">{a.resultado ?? "—"}</td>
                  <td className="p-3">{badgeProximo(a.data_proximo)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
