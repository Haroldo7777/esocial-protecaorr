"use server";

import { createClient } from "@/lib/supabase/server";
import { cpfValido } from "@/lib/validators";

export type LinhaPreview = {
  linha: number;
  nome: string;
  cpf: string;
  status: "ok" | "erro";
  msg: string;
};

export type Estado = {
  erro?: string;
  preview?: LinhaPreview[];
  resumo?: { processadas: number; rejeitadas: number };
};

function parseCsv(txt: string): string[][] {
  const linhas = txt.split(/\r?\n/).filter((l) => l.trim().length > 0);
  return linhas.map((linha) => {
    const out: string[] = [];
    let campo = "";
    let aspas = false;
    for (let i = 0; i < linha.length; i++) {
      const c = linha[i];
      if (aspas) {
        if (c === '"' && linha[i + 1] === '"') { campo += '"'; i++; }
        else if (c === '"') aspas = false;
        else campo += c;
      } else if (c === '"') aspas = true;
      else if (c === "," || c === ";") { out.push(campo); campo = ""; }
      else campo += c;
    }
    out.push(campo);
    return out.map((s) => s.trim());
  });
}

// aceita yyyy-mm-dd ou dd/mm/yyyy → yyyy-mm-dd (ou null)
function normalizaData(s: string): string | null {
  const t = (s ?? "").trim();
  if (!t) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
  const m = t.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  return null;
}

export async function importarEmpregados(
  empresaId: string,
  _prev: Estado,
  formData: FormData,
): Promise<Estado> {
  const csv = String(formData.get("csv") ?? "").trim();
  const confirmar = String(formData.get("confirmar") ?? "") === "sim";
  if (!csv) return { erro: "Cole o conteúdo da planilha (CSV) ou carregue um arquivo." };

  const linhas = parseCsv(csv);
  if (linhas.length < 2) return { erro: "A planilha precisa de cabeçalho + ao menos uma linha." };

  const cab = linhas[0].map((h) => h.toLowerCase());
  const col = (n: string) => cab.indexOf(n);
  const iCpf = col("cpf");
  const iNome = col("nome");
  if (iCpf < 0 || iNome < 0) return { erro: "Cabeçalho precisa conter ao menos: cpf, nome." };
  const iMat = col("matricula");
  const iNasc = col("nascimento");
  const iSexo = col("sexo");
  const iAdm = col("admissao");
  const iCat = col("categoria_esocial");
  const iFun = col("funcao");

  const supabase = await createClient();
  // mapa de funções da empresa (nome → id) para resolver a coluna 'funcao'
  const { data: funcoesData } = await supabase.from("funcao").select("id,nome").eq("empresa_id", empresaId);
  const funcMap = new Map<string, string>();
  for (const f of (funcoesData ?? []) as { id: string; nome: string }[]) {
    funcMap.set(f.nome.trim().toLowerCase(), f.id);
  }

  const preview: LinhaPreview[] = [];
  const validas: Record<string, unknown>[] = [];

  linhas.slice(1).forEach((r, idx) => {
    const nLinha = idx + 2;
    const nome = (r[iNome] ?? "").trim();
    const cpf = (r[iCpf] ?? "").replace(/\D/g, "");
    const add = (status: "ok" | "erro", msg: string) =>
      preview.push({ linha: nLinha, nome: nome || "—", cpf: cpf || "—", status, msg });

    if (!nome) return add("erro", "nome vazio");
    if (!cpf || !cpfValido(cpf)) return add("erro", "CPF inválido");

    const nascimento = iNasc >= 0 ? normalizaData(r[iNasc]) : null;
    const admissao = iAdm >= 0 ? normalizaData(r[iAdm]) : null;
    if (nascimento && admissao && admissao < nascimento) return add("erro", "admissão antes do nascimento");

    let funcao_id: string | null = null;
    let aviso = "pronta para importar";
    if (iFun >= 0 && (r[iFun] ?? "").trim()) {
      const achada = funcMap.get(r[iFun].trim().toLowerCase());
      if (achada) funcao_id = achada;
      else aviso = `função "${r[iFun].trim()}" não encontrada — importada sem função`;
    }

    validas.push({
      empresa_id: empresaId,
      cpf,
      nome,
      matricula: iMat >= 0 ? r[iMat]?.trim() || null : null,
      nascimento,
      sexo: iSexo >= 0 ? r[iSexo]?.trim() || null : null,
      admissao,
      categoria_esocial: iCat >= 0 ? r[iCat]?.trim() || null : null,
      funcao_id,
      situacao: "ativo",
    });
    add("ok", aviso);
  });

  const rejeitadas = preview.filter((p) => p.status === "erro").length;
  if (!confirmar) return { preview };
  if (validas.length === 0) return { erro: "Nenhuma linha válida para importar.", preview };

  const { error } = await supabase
    .from("empregado")
    .upsert(validas, { onConflict: "empresa_id,cpf" });
  if (error) return { erro: `Falha ao importar: ${error.message}`, preview };

  return { preview, resumo: { processadas: validas.length, rejeitadas } };
}
