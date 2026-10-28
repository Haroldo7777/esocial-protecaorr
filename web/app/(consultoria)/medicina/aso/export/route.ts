import { listarAsos, LABEL_TIPO_ASO } from "@/lib/data/medicina";
import { mascaraCpf } from "@/lib/validators";
import { gerarCsv, respostaCsv } from "@/lib/csv";

export async function GET() {
  const res = await listarAsos();
  if (!res.ok) return new Response(res.erro, { status: 500 });
  const linhas = res.dados.map((a) => [
    a.empregado?.nome ?? "",
    a.empregado?.cpf ? mascaraCpf(a.empregado.cpf) : "",
    a.empresa?.nome_fantasia || a.empresa?.razao_social || "",
    LABEL_TIPO_ASO[a.tipo] ?? a.tipo,
    a.data_exame,
    a.resultado ?? "",
    a.medico_responsavel ?? "",
    a.data_proximo ?? "",
  ]);
  const csv = gerarCsv(
    ["Empregado", "CPF", "Empresa", "Tipo", "Data", "Resultado", "Médico", "Próximo"],
    linhas,
  );
  return respostaCsv("aso.csv", csv);
}
