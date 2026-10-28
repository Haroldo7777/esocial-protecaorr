import Link from "next/link";
import { auditar, type Achado, type Severidade } from "@/lib/data/auditoria";
import { getConsultoria } from "@/lib/data/consultoria";
import { BotaoImprimir } from "@/components/botao-imprimir";

export const dynamic = "force-dynamic";

const SEV_LABEL: Record<Severidade, string> = { alta: "Alta", media: "Média", baixa: "Baixa" };
const SEV_CLS: Record<Severidade, string> = {
  alta: "bg-red-100 text-red-700",
  media: "bg-amber-100 text-amber-700",
  baixa: "bg-gray-100 text-gray-600",
};
const LABEL_CAT: Record<string, string> = {
  exame_aso: "Exame / ASO",
  exame_plano: "Plano de exames",
  treinamento: "Treinamento",
  epi: "EPI",
  cadastro: "Cadastro",
};

export default async function RelatorioAuditoria({
  searchParams,
}: {
  searchParams: Promise<{ empresa?: string; sev?: string }>;
}) {
  const { empresa, sev } = await searchParams;
  const [res, consR] = await Promise.all([auditar(empresa || undefined), getConsultoria()]);
  const hoje = new Date().toLocaleDateString("pt-BR");
  const consultoria = consR.ok && consR.dados ? consR.dados.nome_fantasia || consR.dados.razao_social : "Consultoria";

  let itens: Achado[] = res.ok ? res.dados : [];
  if (sev === "alta" || sev === "media" || sev === "baixa") itens = itens.filter((a) => a.severidade === sev);

  const alta = itens.filter((a) => a.severidade === "alta").length;
  const media = itens.filter((a) => a.severidade === "media").length;
  const baixa = itens.filter((a) => a.severidade === "baixa").length;

  // agrupa por empresa
  const grupos = new Map<string, Achado[]>();
  for (const a of itens) {
    if (!grupos.has(a.empresa)) grupos.set(a.empresa, []);
    grupos.get(a.empresa)!.push(a);
  }

  return (
    <div className="max-w-3xl mx-auto p-8 text-sm text-gray-800">
      <style>{`@media print { .no-print { display: none !important; } @page { margin: 16mm; } }`}</style>

      <div className="flex items-center justify-between mb-6">
        <Link href="/auditoria" className="no-print text-sm text-brand-ink">
          ← Voltar
        </Link>
        <BotaoImprimir />
      </div>

      <header className="border-b pb-4 mb-6">
        <h1 className="text-2xl font-bold">Relatório de Auditoria — SST</h1>
        <p className="opacity-70 mt-1">{consultoria}</p>
        <p className="opacity-60 text-xs mt-1">
          Emitido em {hoje}
          {empresa ? " · filtrado por empresa" : " · todas as empresas"}
          {sev ? ` · severidade ${SEV_LABEL[sev as Severidade] ?? sev}` : ""}
        </p>
      </header>

      {!res.ok ? (
        <p className="text-red-600">Não foi possível gerar: {res.erro}</p>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[
              ["Total", itens.length, "text-gray-800"],
              ["Alta", alta, "text-red-600"],
              ["Média", media, "text-amber-600"],
              ["Baixa", baixa, "text-gray-600"],
            ].map(([t, v, c]) => (
              <div key={t as string} className="border rounded-lg p-3">
                <div className={`text-xl font-bold ${c}`}>{v as number}</div>
                <div className="text-[11px] uppercase tracking-wide opacity-60">{t as string}</div>
              </div>
            ))}
          </div>

          {itens.length === 0 ? (
            <p className="opacity-70">Nenhum achado de auditoria. Cadastro conforme.</p>
          ) : (
            [...grupos.entries()].map(([emp, achados]) => (
              <section key={emp} className="mb-6 break-inside-avoid">
                <h2 className="font-bold border-b pb-1 mb-2">{emp}</h2>
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-wide opacity-60 border-b">
                      <th className="py-1 pr-2">Sev.</th>
                      <th className="py-1 pr-2">Categoria</th>
                      <th className="py-1">Achado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {achados.map((a) => (
                      <tr key={a.chave} className="border-b last:border-0 align-top">
                        <td className="py-1 pr-2">
                          <span className={`text-[10px] font-semibold rounded px-1.5 py-0.5 ${SEV_CLS[a.severidade]}`}>
                            {SEV_LABEL[a.severidade]}
                          </span>
                        </td>
                        <td className="py-1 pr-2 whitespace-nowrap opacity-70">{LABEL_CAT[a.categoria] ?? a.categoria}</td>
                        <td className="py-1">
                          <div className="font-semibold">{a.titulo}</div>
                          <div className="text-xs opacity-60">{a.detalhe}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            ))
          )}

          <footer className="border-t pt-3 mt-8 text-xs opacity-50">
            Gerado pelo Auditor eSocial / SST — {consultoria}. Conferência de conformidade
            do cadastro (riscos do GHE × exames/ASO, treinamentos e EPI).
          </footer>
        </>
      )}
    </div>
  );
}
