import Link from "next/link";
import { listarPerfis } from "@/lib/data/admin";
import { CabecalhoLista, AvisoBanco, Vazio } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function PermissoesPage() {
  const res = await listarPerfis();

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">Perfis de acesso</h1>
      <p className="text-sm opacity-70 mb-4">
        Cada perfil concede permissões por módulo × ação (ver, criar, editar, excluir).
        Usuários herdam as permissões dos perfis atribuídos.
      </p>

      <CabecalhoLista titulo="Perfis" hrefNovo="/permissoes/nova" rotuloNovo="+ Novo perfil" />
      {!res.ok ? (
        <AvisoBanco erro={res.erro} />
      ) : res.dados.length === 0 ? (
        <Vazio texto="Nenhum perfil cadastrado." />
      ) : (
        <div className="bg-[var(--surface)] rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide opacity-60 border-b">
                <th className="p-3">Perfil</th>
                <th className="p-3">Descrição</th>
                <th className="p-3">Permissões</th>
                <th className="p-3">Usuários</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {res.dados.map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="p-3 font-semibold">
                    {p.nome}
                    {p.padrao_sistema ? (
                      <span className="ml-2 text-[10px] uppercase bg-gray-100 text-gray-500 rounded px-1.5 py-0.5">
                        padrão
                      </span>
                    ) : null}
                  </td>
                  <td className="p-3 opacity-70">{p.descricao ?? "—"}</td>
                  <td className="p-3">{p.permissoes?.[0]?.count ?? 0}</td>
                  <td className="p-3">{p.usuarios?.[0]?.count ?? 0}</td>
                  <td className="p-3 text-right">
                    <Link href={`/permissoes/${p.id}/editar`} className="text-brand-ink font-medium">
                      Editar
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
