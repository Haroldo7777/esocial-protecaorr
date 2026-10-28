import { listarTurmas, MODALIDADES } from "@/lib/data/treinamentos";
import { gerarCsv, respostaCsv } from "@/lib/csv";

const LABEL_MOD = Object.fromEntries(MODALIDADES);

export async function GET() {
  const res = await listarTurmas();
  if (!res.ok) return new Response(res.erro, { status: 500 });
  const linhas = res.dados.map((t) => [
    t.treinamento?.nome ?? "",
    t.treinamento?.nr ?? "",
    t.empresa?.nome_fantasia || t.empresa?.razao_social || "",
    t.data_inicio,
    t.data_fim ?? "",
    LABEL_MOD[t.modalidade] ?? t.modalidade,
    t.instrutor ?? "",
    t.alunos?.[0]?.count ?? 0,
  ]);
  const csv = gerarCsv(
    ["Treinamento", "NR", "Empresa", "Início", "Conclusão", "Modalidade", "Instrutor", "Alunos"],
    linhas,
  );
  return respostaCsv("turmas.csv", csv);
}
