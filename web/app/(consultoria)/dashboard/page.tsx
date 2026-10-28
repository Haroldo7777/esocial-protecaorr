import Link from "next/link";
import { metricasDashboard } from "@/lib/data/dashboard";
import { AvisoBanco } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const res = await metricasDashboard();

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">Dashboard</h1>
      <p className="opacity-70 text-sm mb-6">
        Visão geral da consultoria. Os indicadores de eventos eSocial entram na fase
        de auditoria/transmissão.
      </p>

      {!res.ok ? (
        <AvisoBanco erro={res.erro} />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <Card titulo="Empresas ativas" valor={res.dados.empresasAtivas} href="/empresas" />
            <Card titulo="Empregados ativos" valor={res.dados.empregadosAtivos} />
            <Card titulo="Turmas" valor={res.dados.turmas} href="/treinamentos/turmas" />
            <Card titulo="Total de ASOs" valor={res.dados.asos} href="/medicina/aso" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Atalho
              titulo="Gestão de Vencimentos"
              texto="Exames, documentos, treinamentos e EPI a vencer ou vencidos."
              href="/vencimentos"
            />
            <Atalho
              titulo="Auditoria"
              texto="Exposições sem exame/treinamento/EPI e lacunas de cadastro."
              href="/auditoria"
            />
          </div>
        </>
      )}
    </div>
  );
}

function Card({ titulo, valor, href }: { titulo: string; valor: number; href?: string }) {
  const inner = (
    <div className="bg-[var(--surface)] rounded-xl shadow p-4 h-full">
      <div className="text-xs uppercase tracking-wide opacity-60">{titulo}</div>
      <div className="text-2xl font-extrabold mt-1">{valor.toLocaleString("pt-BR")}</div>
    </div>
  );
  return href ? (
    <Link href={href} className="block hover:opacity-90">
      {inner}
    </Link>
  ) : (
    inner
  );
}

function Atalho({ titulo, texto, href }: { titulo: string; texto: string; href: string }) {
  return (
    <Link href={href} className="block bg-[var(--surface)] rounded-xl shadow p-5 hover:bg-gray-50">
      <div className="font-semibold text-brand-ink">{titulo}</div>
      <div className="text-sm opacity-70 mt-1">{texto}</div>
    </Link>
  );
}
