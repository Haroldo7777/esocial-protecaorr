import { getEmpresa } from "@/lib/data/empresa-ctx";

export const dynamic = "force-dynamic";

const ETAPAS = ["Empresa", "Ambientes", "Riscos", "Empregados", "Faturamento"];

export default async function EmpresaDashboard({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await getEmpresa(id);
  const etapa = res.ok ? res.dados.instalacao_etapa : 1;
  const pct = Math.round((etapa / 5) * 100);

  return (
    <div className="space-y-4">
      <div className="bg-[var(--surface)] rounded-xl shadow p-5">
        <div className="flex items-center gap-3 flex-wrap mb-2">
          <span className="text-sm opacity-70">Progresso de Instalação</span>
          <div className="flex-1 min-w-[150px] h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-brand" style={{ width: `${pct}%` }} />
          </div>
          <b>{pct}%</b>
          <span className="text-sm opacity-70">
            {etapa < 5 ? `próxima etapa: ${ETAPAS[etapa]}` : "instalação concluída ✓"}
          </span>
        </div>
        {res.ok ? (
          <div className="grid sm:grid-cols-3 gap-3 mt-3">
            <Item k={res.dados.tipo_inscricao.toUpperCase()} v={res.dados.inscricao} />
            <Item k="Razão social" v={res.dados.razao_social} />
            <Item k="Situação" v={res.dados.situacao === "liberado" ? "🟢 Liberado" : "🔴 Bloqueado"} />
          </div>
        ) : (
          <p className="text-sm opacity-60">
            Dados da empresa aparecem quando o banco estiver conectado.
          </p>
        )}
      </div>

      <div className="bg-[var(--surface)] rounded-xl shadow p-5">
        <h2 className="font-semibold mb-1">Cobertura & vencimentos</h2>
        <p className="text-sm opacity-70">
          Cobertura (EPIs/Exames/Treinamentos) e o painel de vencimentos desta
          empresa entram junto com o motor de vencimentos (próximo bloco).
        </p>
      </div>
    </div>
  );
}

function Item({ k, v }: { k: string; v: string }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
      <div className="text-xs uppercase tracking-wide opacity-50">{k}</div>
      <div className="font-semibold text-sm">{v}</div>
    </div>
  );
}
