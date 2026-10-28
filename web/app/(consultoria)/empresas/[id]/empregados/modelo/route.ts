import { gerarCsv, respostaCsv } from "@/lib/csv";

// Modelo de planilha para importação de empregados de uma empresa.
export async function GET() {
  const cab = ["cpf", "matricula", "nome", "nascimento", "sexo", "admissao", "categoria_esocial", "funcao"];
  const exemplo = ["00000000191", "0001", "FULANO DE TAL", "1990-05-20", "M", "2020-02-01", "101", "Auxiliar administrativo"];
  // datas em yyyy-mm-dd ou dd/mm/aaaa; categoria_esocial = Tabela 01 (ex.: 101);
  // funcao = nome exatamente como cadastrado na empresa (senão entra sem função)
  return respostaCsv("modelo_empregados.csv", gerarCsv(cab, [exemplo]));
}
