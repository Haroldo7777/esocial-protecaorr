import { listarEmpresas } from "@/lib/data/empresas";
import { mascaraCnpj, mascaraCpf } from "@/lib/validators";
import { gerarCsv, respostaCsv } from "@/lib/csv";

const LABEL_MOD: Record<string, string> = {
  gestao: "Gestão",
  treinamentos: "Só treinamentos",
  link: "Via link",
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const busca = url.searchParams.get("q") || undefined;
  const res = await listarEmpresas(busca);
  if (!res.ok) return new Response(res.erro, { status: 500 });

  const insc = (tipo: string, n: string) =>
    tipo === "cnpj" ? mascaraCnpj(n) : tipo === "cpf" ? mascaraCpf(n) : n;

  const linhas = res.empresas.map((e) => [
    e.razao_social,
    e.nome_fantasia ?? "",
    e.tipo_inscricao.toUpperCase(),
    insc(e.tipo_inscricao, e.inscricao),
    e.grau_risco ?? "",
    e.situacao === "liberado" ? "Liberado" : "Bloqueado",
    LABEL_MOD[e.modalidade] ?? e.modalidade,
  ]);
  const csv = gerarCsv(
    ["Razão social", "Nome fantasia", "Tipo", "Inscrição", "Grau de risco", "Situação", "Contrato"],
    linhas,
  );
  return respostaCsv("empresas.csv", csv);
}
