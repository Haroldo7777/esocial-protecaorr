import { listarEntregasEpi, TIPOS_MOV_EPI } from "@/lib/data/epi";
import { mascaraCpf } from "@/lib/validators";
import { gerarCsv, respostaCsv } from "@/lib/csv";

const LABEL_TIPO = Object.fromEntries(TIPOS_MOV_EPI);

export async function GET() {
  const res = await listarEntregasEpi();
  if (!res.ok) return new Response(res.erro, { status: 500 });
  const linhas = res.dados.map((e) => [
    e.empregado?.nome ?? "",
    e.empregado?.cpf ? mascaraCpf(e.empregado.cpf) : "",
    e.empresa?.nome_fantasia || e.empresa?.razao_social || "",
    e.epi?.nome ?? "",
    e.epi?.ca ?? "",
    LABEL_TIPO[e.tipo] ?? e.tipo,
    e.quantidade,
    e.data_entrega,
    e.data_proxima ?? "",
    e.assinado ? "Assinado" : "Pendente",
  ]);
  const csv = gerarCsv(
    ["Empregado", "CPF", "Empresa", "EPI", "CA", "Tipo", "Qtd", "Entrega", "Próxima troca", "Recibo"],
    linhas,
  );
  return respostaCsv("epi_entregas.csv", csv);
}
