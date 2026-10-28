import Link from "next/link";
import { listarVencimentos } from "@/lib/data/vencimentos";
import { AvisoBanco, Vazio } from "@/components/ui";

export const dynamic = "force-dynamic";

const HORIZONTES = [15, 30, 60, 90, 120];

function fmt(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function Card({ titulo, valor, cor }: { titulo: string; valor: number; cor: string }) {
  return (
    <div className="bg-[var(--surface)] rounded-xl shadow p-4">
      <div className={`text-2xl font-bold ${cor}`}>{valor}</div>
      <div className="text-xs opacity-60 uppercase tracking-wide">{titulo}</div>
    </div>
  );
}

export default async function VencimentosPage({
  searchParams,
}: {
  searchParams: Promise<{ h?: string }>;
}) {
  const { h } = await searchParams;
  const horizonte = HORIZONTES.includes(Number(h)) ? Number(h) : 90;
  const res = await listarVencimentos({ horizonteDias: horizonte });

  const itens = res.ok ? res.dados : [];
  const vencidos = itens.filter((i) => i.dias < 0).length;
  const aVencer = itens.filter((i) => i.dias >= 0).length;
  const colaborador = itens.filter((i) => i.natureza === "colaborador").length;
  const programas = itens.filter((i) => i.natureza === "acoes_programas").length;

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">Gestão de Vencimentos</h1>
      <p className="text-sm opacity-70 mb-4">
        Prazos de exames (próximo ASO) e documentos (vigência). Calculado ao vivo a
        partir da periodicidade do plano de cada empresa.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <Card titulo="Vencidos" valor={vencidos} cor="text-red-600" />
        <Card titulo={`A vencer (${horizonte}d)`} valor={aVencer} cor="text-brand-ink" />
        <Card titulo="Por colaborador" valor={colaborador} cor="text-gray-700" />
        <Card titulo="Ações e programas" valor={programas} cor="text-gray-700" />
      </div>

      <div className="flex flex-wrap items-center gap-1 mb-4">
        <span className="text-xs opacity-60 mr-1">Horizonte:</span>
        {HORIZONTES.map((d) => (
          <Link
            key={d}
            href={`/vencimentos?h=${d}`}
            className={[
              "px-3 py-1.5 rounded-lg text-sm",
              horizonte === d ? "bg-brand text-white" : "bg-gray-100 text-gray-700",
            ].join(" ")}
          >
            {d} dias
          </Link>
        ))}
        <a
          href={`/vencimentos/export?h=${horizonte}`}
          className="ml-auto px-3 py-1.5 rounded-lg text-sm border border-gray-300 hover:bg-gray-50"
        >
          Exportar CSV
        </a>
      </div>

      {!res.ok ? (
        <AvisoBanco erro={res.erro} />
      ) : itens.length === 0 ? (
        <Vazio texto="Nenhum vencimento no horizonte selecionado." />
      ) : (
        <div className="bg-[var(--surface)] rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide opacity-60 border-b">
                <th className="p-3">Item</th>
                <th className="p-3">Empresa</th>
                <th className="p-3">Colaborador</th>
                <th className="p-3">Prazo</th>
                <th className="p-3">Situação</th>
              </tr>
            </thead>
            <tbody>
              {itens.map((i) => (
                <tr key={i.chave} className="border-b last:border-0">
                  <td className="p-3 font-semibold">{i.item}</td>
                  <td className="p-3">{i.empresa}</td>
                  <td className="p-3">{i.empregado ?? "—"}</td>
                  <td className="p-3">{fmt(i.data_prazo)}</td>
                  <td className="p-3">
                    {i.dias < 0 ? (
                      <span className="text-xs font-semibold rounded px-2 py-0.5 bg-red-100 text-red-700">
                        {Math.abs(i.dias)} dias em atraso
                      </span>
                    ) : (
                      <span className="text-xs font-semibold rounded px-2 py-0.5 bg-brand-light text-brand-ink">
                        em {i.dias} dias
                      </span>
                    )}
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
