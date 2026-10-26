import Link from "next/link";
import { listarProgramas, TIPOS_PROGRAMA } from "@/lib/data/documentos";
import { CabecalhoLista, AvisoBanco, Vazio } from "@/components/ui";

export const dynamic = "force-dynamic";

function fmtData(iso: string | null) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function badgeVigencia(fim: string | null) {
  if (!fim) return { txt: "Sem vigência", cls: "bg-gray-100 text-gray-500" };
  const hoje = new Date().toISOString().slice(0, 10);
  if (fim < hoje) return { txt: "Vencido", cls: "bg-red-100 text-red-700" };
  return { txt: "Em dia", cls: "bg-brand-light text-brand-ink" };
}

export default async function DocumentosPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>;
}) {
  const { tipo } = await searchParams;
  const tipoAtivo =
    tipo && TIPOS_PROGRAMA.some((t) => t.id === tipo) ? tipo : undefined;
  const res = await listarProgramas(tipoAtivo);

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">Documentos</h1>
      <p className="text-sm opacity-70 mb-4">
        Programas e laudos (PGR, PCMSO, LTCAT, LIP, PPR, PCA…). A vigência é definida
        na emissão; só PGR/PGRTR variam entre 1 e 2 anos.
      </p>

      <div className="flex flex-wrap gap-1 mb-4">
        <Link
          href="/documentos"
          className={[
            "px-3 py-1.5 rounded-lg text-sm",
            !tipoAtivo ? "bg-brand text-white" : "bg-gray-100 text-gray-700",
          ].join(" ")}
        >
          Todos
        </Link>
        {TIPOS_PROGRAMA.map((t) => (
          <Link
            key={t.id}
            href={`/documentos?tipo=${t.id}`}
            className={[
              "px-3 py-1.5 rounded-lg text-sm",
              tipoAtivo === t.id ? "bg-brand text-white" : "bg-gray-100 text-gray-700",
            ].join(" ")}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <CabecalhoLista
        titulo="Documentos emitidos"
        hrefNovo="/documentos/nova"
        rotuloNovo="+ Novo documento"
      />
      {!res.ok ? (
        <AvisoBanco erro={res.erro} />
      ) : res.dados.length === 0 ? (
        <Vazio texto="Nenhum documento emitido." />
      ) : (
        <div className="bg-[var(--surface)] rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide opacity-60 border-b">
                <th className="p-3">Tipo</th>
                <th className="p-3">Empresa</th>
                <th className="p-3">Responsável</th>
                <th className="p-3">Vigência</th>
                <th className="p-3">Situação</th>
              </tr>
            </thead>
            <tbody>
              {res.dados.map((p) => {
                const b = badgeVigencia(p.vigencia_fim);
                return (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="p-3 font-semibold uppercase">
                      {p.tipo}
                      {p.modelo ? (
                        <span className="ml-1 text-xs font-normal opacity-60">
                          {p.modelo}
                        </span>
                      ) : null}
                    </td>
                    <td className="p-3">
                      {p.empresa?.nome_fantasia || p.empresa?.razao_social || "—"}
                    </td>
                    <td className="p-3">{p.responsavel_tecnico ?? "—"}</td>
                    <td className="p-3">
                      {fmtData(p.vigencia_inicio)} → {fmtData(p.vigencia_fim)}
                    </td>
                    <td className="p-3">
                      <span className={`text-xs font-semibold rounded px-2 py-0.5 ${b.cls}`}>
                        {b.txt}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
