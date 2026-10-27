import Link from "next/link";
import { listarRiscos } from "@/lib/data/riscos";
import { CAMADAS_RISCO } from "@/lib/sst";
import { AvisoBanco, Vazio } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function RiscosPage({
  searchParams,
}: {
  searchParams: Promise<{ camada?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const camada = (sp.camada as "esocial" | "consultoria" | "empresa") || "consultoria";
  const res = await listarRiscos(camada, sp.q);
  const readonly = CAMADAS_RISCO.find((c) => c.id === camada)?.readonly;

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <h1 className="text-xl font-bold">Catálogo de Riscos</h1>
        {camada === "consultoria" ? (
          <Link
            href="/riscos/nova"
            className="ml-auto px-4 py-2 rounded-lg bg-brand text-white text-sm font-semibold"
          >
            + Cadastrar Risco
          </Link>
        ) : null}
      </div>

      <div className="flex gap-1 bg-[var(--surface)] border border-gray-200 rounded-xl p-1.5 mb-4 w-fit">
        {CAMADAS_RISCO.map((c) => (
          <Link
            key={c.id}
            href={`/riscos?camada=${c.id}`}
            className={[
              "px-3 py-2 rounded-lg text-sm",
              c.id === camada ? "bg-brand text-white font-semibold" : "opacity-70 hover:bg-gray-100",
            ].join(" ")}
          >
            {c.label}
          </Link>
        ))}
      </div>

      <form className="mb-4">
        <input type="hidden" name="camada" value={camada} />
        <input
          name="q"
          defaultValue={sp.q ?? ""}
          placeholder="Buscar por risco ou código…"
          className="w-full max-w-md px-3 py-2 rounded-lg border border-gray-300 bg-[var(--surface)]"
        />
      </form>

      {readonly ? (
        <p className="text-xs opacity-60 mb-3">
          Camada oficial do eSocial — somente leitura. Cadastre riscos próprios nas
          camadas Consultoria ou Empresa.
        </p>
      ) : null}

      {!res.ok ? (
        <AvisoBanco erro={res.erro} />
      ) : res.dados.length === 0 ? (
        <Vazio texto="Nenhum risco nesta camada ainda." />
      ) : (
        <div className="bg-[var(--surface)] rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide opacity-60 border-b">
                <th className="p-3">Risco</th>
                <th className="p-3">Categoria</th>
                <th className="p-3">Código (Tabela 24)</th>
                <th className="p-3">Qualitativo</th>
                {!readonly ? <th className="p-3"></th> : null}
              </tr>
            </thead>
            <tbody>
              {res.dados.map((r) => (
                <tr key={r.id} className="border-b last:border-0">
                  <td className="p-3 font-semibold">{r.nome}</td>
                  <td className="p-3">{r.categoria}</td>
                  <td className="p-3">{r.codigo_tabela24 ?? "—"}</td>
                  <td className="p-3">{r.qualitativo ? "Sim" : "Não"}</td>
                  {!readonly ? (
                    <td className="p-3 text-right">
                      <Link href={`/riscos/${r.id}/editar`} className="text-brand-ink font-medium">
                        Editar
                      </Link>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
