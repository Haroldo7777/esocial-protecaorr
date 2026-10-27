import Link from "next/link";
import { listarUsuarios } from "@/lib/data/admin";
import { AvisoBanco, Vazio } from "@/components/ui";

export const dynamic = "force-dynamic";

const LABEL_TIPO: Record<string, string> = {
  consultoria: "Consultoria",
  empresa: "Empresa",
  empregado: "Empregado",
  aluno: "Aluno",
  contador: "Contador",
  instrutor: "Instrutor",
  parceiro_saude: "Parceiro de saúde",
};

export default async function UsuariosPage() {
  const res = await listarUsuarios();

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">Usuários</h1>
      <p className="text-sm opacity-70 mb-4">
        Pessoas com acesso à consultoria e seus perfis. As permissões vêm dos perfis
        atribuídos (ver Perfis de acesso).
      </p>

      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
        Convite por e-mail de novos usuários entra no lançamento (depende do Supabase
        Auth). Aqui já é possível gerir perfis e status de quem já tem conta.
      </p>

      {!res.ok ? (
        <AvisoBanco erro={res.erro} />
      ) : res.dados.length === 0 ? (
        <Vazio texto="Nenhum usuário cadastrado ainda." />
      ) : (
        <div className="bg-[var(--surface)] rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide opacity-60 border-b">
                <th className="p-3">Nome</th>
                <th className="p-3">E-mail</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Perfis</th>
                <th className="p-3">Status</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {res.dados.map((u) => (
                <tr key={u.id} className="border-b last:border-0">
                  <td className="p-3 font-semibold">{u.nome}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{LABEL_TIPO[u.tipo] ?? u.tipo}</td>
                  <td className="p-3">
                    {u.perfis && u.perfis.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {u.perfis.map((p, i) =>
                          p.perfil ? (
                            <span key={i} className="text-xs bg-brand-light text-brand-ink rounded px-2 py-0.5">
                              {p.perfil.nome}
                            </span>
                          ) : null,
                        )}
                      </div>
                    ) : (
                      <span className="opacity-50">—</span>
                    )}
                  </td>
                  <td className="p-3">
                    <span
                      className={[
                        "text-xs font-semibold rounded px-2 py-0.5",
                        u.ativo ? "bg-brand-light text-brand-ink" : "bg-gray-100 text-gray-500",
                      ].join(" ")}
                    >
                      {u.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <Link href={`/usuarios/${u.id}`} className="text-brand-ink font-medium">
                      Gerir acesso
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
