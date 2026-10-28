import { gerarCsv, respostaCsv } from "@/lib/csv";

// Modelo de planilha para importação de empresas (uma linha de exemplo).
export async function GET() {
  const cab = [
    "razao_social",
    "nome_fantasia",
    "tipo_inscricao",
    "inscricao",
    "grau_risco",
    "situacao",
    "modalidade",
  ];
  const exemplo = [
    "EMPRESA EXEMPLO LTDA",
    "Exemplo",
    "cnpj",
    "00000000000191",
    "3",
    "liberado",
    "gestao",
  ];
  // observações: tipo_inscricao = cnpj|cpf|caepf|cno; situacao = liberado|bloqueado;
  // modalidade = gestao|treinamentos|link; grau_risco = 1..4
  return respostaCsv("modelo_empresas.csv", gerarCsv(cab, [exemplo]));
}
