import { listarTreinamentos, TIPOS_TREINAMENTO } from "@/lib/data/treinamentos";
import { CabecalhoLista, AvisoBanco, Vazio } from "@/components/ui";
import { TreinamentosTabs } from "@/components/treinamentos-tabs";

export const dynamic = "force-dynamic";

const LABEL_TIPO = Object.fromEntries(TIPOS_TREINAMENTO);

export default async function TreinamentosPage() {
  const res = await listarTreinamentos();

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">Treinamentos</h1>
      <p className="text-sm opacity-70 mb-4">
        Catálogo de treinamentos (NR, carga horária, periodicidade). As turmas são
        registradas por empresa e alimentam os vencimentos.
      </p>
      <TreinamentosTabs />

      <CabecalhoLista titulo="Catálogo" hrefNovo="/treinamentos/nova" rotuloNovo="+ Novo treinamento" />
      {!res.ok ? (
        <AvisoBanco erro={res.erro} />
      ) : res.dados.length === 0 ? (
        <Vazio texto="Nenhum treinamento cadastrado." />
      ) : (
        <div className="bg-[var(--surface)] rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide opacity-60 border-b">
                <th className="p-3">Treinamento</th>
                <th className="p-3">NR</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Carga horária</th>
                <th className="p-3">Periodicidade</th>
              </tr>
            </thead>
            <tbody>
              {res.dados.map((t) => (
                <tr key={t.id} className="border-b last:border-0">
                  <td className="p-3 font-semibold">{t.nome}</td>
                  <td className="p-3">{t.nr ?? "—"}</td>
                  <td className="p-3">{LABEL_TIPO[t.tipo] ?? t.tipo}</td>
                  <td className="p-3">{t.carga_horaria_h ? `${t.carga_horaria_h} h` : "—"}</td>
                  <td className="p-3">
                    {t.periodicidade_meses ? `${t.periodicidade_meses} meses` : "Sem reciclagem"}
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
