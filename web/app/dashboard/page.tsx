import { getUsuarioAtual } from "@/lib/rbac";
import { sair } from "@/app/login/actions";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const usuario = await getUsuarioAtual();

  return (
    <main className="min-h-screen">
      <header className="bg-[var(--surface)] border-b border-gray-200 flex items-center gap-3 px-4 h-14">
        <div className="w-8 h-8 rounded-lg bg-brand text-white grid place-items-center font-extrabold text-xs">
          RR
        </div>
        <b className="text-brand-ink">Auditor eSocial — Proteção RR</b>
        <div className="ml-auto flex items-center gap-3 text-sm">
          <span className="opacity-70">
            {usuario ? `Olá, ${usuario.nome}` : "—"}
          </span>
          <form action={sair}>
            <button className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm">
              Sair
            </button>
          </form>
        </div>
      </header>

      <section className="max-w-5xl mx-auto p-6">
        <h1 className="text-xl font-bold mb-2">Dashboard</h1>
        <p className="opacity-70 text-sm mb-6">
          Fundação (Fase 0) no ar: autenticação, multiempresa e RBAC. Os módulos
          da Fase 1 (empresas, GHE, empregados, riscos, vencimentos) entram a
          seguir.
        </p>

        <div className="grid sm:grid-cols-3 gap-4">
          <Card titulo="Empresas" valor="—" nota="módulo da Fase 1" />
          <Card titulo="Empregados" valor="—" nota="módulo da Fase 1" />
          <Card titulo="Vencimentos" valor="—" nota="módulo da Fase 1" />
        </div>
      </section>
    </main>
  );
}

function Card({
  titulo,
  valor,
  nota,
}: {
  titulo: string;
  valor: string;
  nota: string;
}) {
  return (
    <div className="bg-[var(--surface)] rounded-xl shadow p-4">
      <div className="text-xs uppercase tracking-wide opacity-60">{titulo}</div>
      <div className="text-2xl font-extrabold mt-1">{valor}</div>
      <div className="text-xs opacity-50 mt-1">{nota}</div>
    </div>
  );
}
