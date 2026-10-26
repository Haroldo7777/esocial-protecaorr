import Link from "next/link";
import { listarEmpresas } from "@/lib/data/empresas";

export const dynamic = "force-dynamic";

const MODAL: Record<string, string> = {
  gestao: "🛡️ Gestão Completa",
  treinamentos: "🎓 Só treinamentos",
  link: "🔗 Via link",
};
const TP: Record<string, string> = {
  cnpj: "CNPJ",
  cpf: "CPF",
  caepf: "CAEPF",
  cno: "CNO",
};

export default async function EmpresasPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const res = await listarEmpresas(q);

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-xl font-bold">Empresas</h1>
        <Link
          href="/empresas/nova"
          className="ml-auto px-4 py-2 rounded-lg bg-brand text-white text-sm font-semibold"
        >
          + Nova Empresa
        </Link>
      </div>

      <form className="mb-4">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Buscar por nome ou inscrição…"
          className="w-full max-w-md px-3 py-2 rounded-lg border border-gray-300 bg-[var(--surface)]"
        />
      </form>

      {!res.ok ? (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 text-sm">
          Não foi possível carregar as empresas — o banco de dados ainda não
          está conectado (projeto Supabase será criado no lançamento). Assim que
          o <code>.env.local</code> estiver preenchido, esta lista funciona.
          <div className="opacity-60 mt-1 text-xs">Detalhe: {res.erro}</div>
        </div>
      ) : res.empresas.length === 0 ? (
        <div className="bg-[var(--surface)] rounded-xl shadow p-8 text-center text-sm opacity-70">
          Nenhuma empresa cadastrada ainda. Clique em <b>+ Nova Empresa</b>.
        </div>
      ) : (
        <div className="bg-[var(--surface)] rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide opacity-60 border-b">
                <th className="p-3">Empresa</th>
                <th className="p-3">Inscrição</th>
                <th className="p-3">Modalidade</th>
                <th className="p-3">Situação</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {res.empresas.map((e) => (
                <tr key={e.id} className="border-b last:border-0">
                  <td className="p-3">
                    <div className="font-semibold">
                      {e.nome_fantasia || e.razao_social}
                    </div>
                    <div className="text-xs opacity-60">{e.razao_social}</div>
                  </td>
                  <td className="p-3">
                    {TP[e.tipo_inscricao]}: {e.inscricao}
                  </td>
                  <td className="p-3">{MODAL[e.modalidade]}</td>
                  <td className="p-3">
                    {e.situacao === "liberado" ? "🟢 Liberado" : "🔴 Bloqueado"}
                    {e.instalacao_etapa < 5 ? (
                      <div className="text-xs opacity-50">
                        instalação {e.instalacao_etapa}/5
                      </div>
                    ) : null}
                  </td>
                  <td className="p-3">
                    <Link
                      href={`/empresas/${e.id}`}
                      className="text-brand-ink font-semibold"
                    >
                      Acessar →
                    </Link>
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
