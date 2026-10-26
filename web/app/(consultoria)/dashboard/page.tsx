export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-xl font-bold mb-2">Dashboard</h1>
      <p className="opacity-70 text-sm mb-6">
        Fundação no ar. Os indicadores reais aparecem quando o banco estiver
        conectado e houver empresas/empregados cadastrados.
      </p>
      <div className="grid sm:grid-cols-4 gap-4">
        <Card titulo="Empresas ativas" valor="—" />
        <Card titulo="Empregados" valor="—" />
        <Card titulo="Turmas" valor="—" />
        <Card titulo="Total de ASOs" valor="—" />
      </div>
    </div>
  );
}

function Card({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="bg-[var(--surface)] rounded-xl shadow p-4">
      <div className="text-xs uppercase tracking-wide opacity-60">{titulo}</div>
      <div className="text-2xl font-extrabold mt-1">{valor}</div>
    </div>
  );
}
