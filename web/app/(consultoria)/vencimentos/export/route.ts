import { listarVencimentos } from "@/lib/data/vencimentos";
import { gerarCsv, respostaCsv } from "@/lib/csv";

const LABEL_TIPO: Record<string, string> = {
  exame: "Exame (ASO)",
  programa: "Documento",
  treinamento: "Treinamento",
  epi: "EPI",
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const h = Number(url.searchParams.get("h"));
  const horizonteDias = [15, 30, 60, 90, 120].includes(h) ? h : 90;
  const res = await listarVencimentos({ horizonteDias });
  if (!res.ok) return new Response(res.erro, { status: 500 });

  const linhas = res.dados.map((i) => [
    LABEL_TIPO[i.tipo] ?? i.tipo,
    i.item,
    i.empresa,
    i.empregado ?? "",
    i.data_prazo,
    i.dias < 0 ? `${Math.abs(i.dias)} dias em atraso` : `em ${i.dias} dias`,
  ]);
  const csv = gerarCsv(
    ["Tipo", "Item", "Empresa", "Colaborador", "Prazo", "Situação"],
    linhas,
  );
  return respostaCsv("vencimentos.csv", csv);
}
