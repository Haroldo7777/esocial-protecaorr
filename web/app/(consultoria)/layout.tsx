import { getUsuarioAtual } from "@/lib/rbac";
import { sair } from "@/app/login/actions";
import { ConsultoriaNav } from "@/components/consultoria-nav";

export const dynamic = "force-dynamic";

export default async function ConsultoriaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const usuario = await getUsuarioAtual();

  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr] max-md:grid-cols-1">
      <aside className="bg-[#0c3b22] text-white max-md:hidden sticky top-0 h-screen overflow-y-auto">
        <div className="flex items-center gap-2 px-4 py-4">
          <div className="w-9 h-9 rounded-lg bg-brand grid place-items-center font-extrabold text-sm text-[#06281a]">
            RR
          </div>
          <div>
            <b className="block text-sm leading-tight">Proteção RR</b>
            <small className="text-[11px] opacity-70">Auditor eSocial</small>
          </div>
        </div>
        <ConsultoriaNav />
      </aside>

      <div className="flex flex-col min-w-0">
        <header className="bg-[var(--surface)] border-b border-gray-200 flex items-center gap-3 px-4 h-14 sticky top-0 z-10">
          <span className="text-sm opacity-70 ml-auto">
            {usuario ? `Olá, ${usuario.nome}` : "—"}
          </span>
          <form action={sair}>
            <button className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm">
              Sair
            </button>
          </form>
        </header>
        <main className="p-6 max-w-6xl w-full">{children}</main>
      </div>
    </div>
  );
}
