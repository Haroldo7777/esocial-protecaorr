import { listarTiposExame } from "@/lib/data/medicina";
import { CabecalhoLista, AvisoBanco, Vazio } from "@/components/ui";
import { MedicinaTabs } from "@/components/medicina-tabs";

export const dynamic = "force-dynamic";

function Flag({ on, l }: { on: boolean; l: string }) {
  return (
    <span
      className={[
        "inline-block w-7 text-center text-xs font-bold rounded",
        on ? "bg-brand-light text-brand-ink" : "bg-gray-100 text-gray-400",
      ].join(" ")}
      title={l}
    >
      {on ? l : "–"}
    </span>
  );
}

export default async function MedicinaPage() {
  const res = await listarTiposExame();

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">Medicina</h1>
      <p className="text-sm opacity-70 mb-4">
        Catálogo de tipos de exame por tipo de ASO. A periodicidade de cada exame é
        definida no plano de cada empresa (Empresa → Exames do PCMSO).
      </p>
      <MedicinaTabs />

      <CabecalhoLista titulo="Tipos de exame" hrefNovo="/medicina/nova" rotuloNovo="+ Novo tipo de exame" />
      {!res.ok ? (
        <AvisoBanco erro={res.erro} />
      ) : res.dados.length === 0 ? (
        <Vazio texto="Nenhum tipo de exame cadastrado." />
      ) : (
        <div className="bg-[var(--surface)] rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide opacity-60 border-b">
                <th className="p-3">Exame</th>
                <th className="p-3">Tipos de ASO (A/P/D/RT/MR)</th>
              </tr>
            </thead>
            <tbody>
              {res.dados.map((e) => (
                <tr key={e.id} className="border-b last:border-0">
                  <td className="p-3 font-semibold">{e.nome}</td>
                  <td className="p-3 flex gap-1">
                    <Flag on={e.aso_admissional} l="A" />
                    <Flag on={e.aso_periodico} l="P" />
                    <Flag on={e.aso_demissional} l="D" />
                    <Flag on={e.aso_retorno} l="RT" />
                    <Flag on={e.aso_mudanca} l="MR" />
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
