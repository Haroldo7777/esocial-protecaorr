import { listarRiscos } from "@/lib/data/riscos";
import { gerarCsv, respostaCsv } from "@/lib/csv";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const camadaRaw = url.searchParams.get("camada");
  const camada =
    camadaRaw === "esocial" || camadaRaw === "consultoria" || camadaRaw === "empresa"
      ? camadaRaw
      : "consultoria";
  const busca = url.searchParams.get("q") || undefined;
  const res = await listarRiscos(camada, busca);
  if (!res.ok) return new Response(res.erro, { status: 500 });

  const linhas = res.dados.map((r) => [
    r.nome,
    r.categoria,
    r.codigo_tabela24 ?? "",
    r.qualitativo ? "Sim" : "Não",
  ]);
  const csv = gerarCsv(["Risco", "Categoria", "Código Tabela 24", "Qualitativo"], linhas);
  return respostaCsv(`riscos_${camada}.csv`, csv);
}
