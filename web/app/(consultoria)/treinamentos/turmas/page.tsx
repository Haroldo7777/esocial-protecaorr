import { listarTurmas, MODALIDADES } from "@/lib/data/treinamentos";
import { CabecalhoLista, AvisoBanco, Vazio } from "@/components/ui";
import { TreinamentosTabs } from "@/components/treinamentos-tabs";

export const dynamic = "force-dynamic";

const LABEL_MOD = Object.fromEntries(MODALIDADES);

function fmt(iso: string | null) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export default async function TurmasPage() {
  const res = await listarTurmas();

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">Treinamentos</h1>
      <p className="text-sm opacity-70 mb-4">
        Turmas realizadas por empresa. A periodicidade da turma calcula o próximo
        vencimento de cada aluno.
      </p>
      <TreinamentosTabs />

      <CabecalhoLista titulo="Turmas" hrefNovo="/treinamentos/turmas/nova" rotuloNovo="+ Nova turma" />
      {!res.ok ? (
        <AvisoBanco erro={res.erro} />
      ) : res.dados.length === 0 ? (
        <Vazio texto="Nenhuma turma registrada." />
      ) : (
        <div className="bg-[var(--surface)] rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide opacity-60 border-b">
                <th className="p-3">Treinamento</th>
                <th className="p-3">Empresa</th>
                <th className="p-3">Período</th>
                <th className="p-3">Modalidade</th>
                <th className="p-3">Alunos</th>
              </tr>
            </thead>
            <tbody>
              {res.dados.map((t) => (
                <tr key={t.id} className="border-b last:border-0">
                  <td className="p-3 font-semibold">
                    {t.treinamento?.nome ?? "—"}
                    {t.treinamento?.nr ? (
                      <span className="ml-1 text-xs font-normal opacity-60">
                        {t.treinamento.nr}
                      </span>
                    ) : null}
                  </td>
                  <td className="p-3">
                    {t.empresa?.nome_fantasia || t.empresa?.razao_social || "—"}
                  </td>
                  <td className="p-3">
                    {fmt(t.data_inicio)}
                    {t.data_fim ? ` → ${fmt(t.data_fim)}` : ""}
                  </td>
                  <td className="p-3">{LABEL_MOD[t.modalidade] ?? t.modalidade}</td>
                  <td className="p-3">{t.alunos?.[0]?.count ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
