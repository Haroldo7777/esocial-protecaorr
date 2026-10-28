import { listarEmpregados } from "@/lib/data/empresa-ctx";
import { mascaraCpf } from "@/lib/validators";
import { gerarCsv, respostaCsv } from "@/lib/csv";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const url = new URL(req.url);
  const situacao = url.searchParams.get("situacao") || "ativo";
  const res = await listarEmpregados(id, situacao);
  if (!res.ok) return new Response(res.erro, { status: 500 });

  const linhas = res.dados.map((e) => [
    e.nome,
    mascaraCpf(e.cpf),
    e.matricula ?? "",
    e.funcao?.nome ?? "",
    e.categoria_esocial ?? "",
    e.situacao,
  ]);
  const csv = gerarCsv(
    ["Nome", "CPF", "Matrícula", "Função", "Categoria eSocial", "Situação"],
    linhas,
  );
  return respostaCsv("empregados.csv", csv);
}
