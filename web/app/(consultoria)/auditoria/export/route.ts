import { auditar, type Severidade } from "@/lib/data/auditoria";
import { gerarCsv, respostaCsv } from "@/lib/csv";

const SEV_LABEL: Record<Severidade, string> = { alta: "Alta", media: "Média", baixa: "Baixa" };
const LABEL_CAT: Record<string, string> = {
  exame_aso: "Exame / ASO",
  exame_plano: "Plano de exames",
  treinamento: "Treinamento",
  epi: "EPI",
  cadastro: "Cadastro",
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const empresa = url.searchParams.get("empresa") || undefined;
  const sev = url.searchParams.get("sev");
  const res = await auditar(empresa);
  if (!res.ok) return new Response(res.erro, { status: 500 });

  let itens = res.dados;
  if (sev === "alta" || sev === "media" || sev === "baixa") {
    itens = itens.filter((a) => a.severidade === sev);
  }

  const linhas = itens.map((a) => [
    SEV_LABEL[a.severidade],
    LABEL_CAT[a.categoria] ?? a.categoria,
    a.empresa,
    a.titulo,
    a.detalhe,
  ]);
  const csv = gerarCsv(["Severidade", "Categoria", "Empresa", "Achado", "Detalhe"], linhas);
  return respostaCsv("auditoria.csv", csv);
}
