"use server";

import { createClient } from "@/lib/supabase/server";
import { getUsuarioAtual } from "@/lib/rbac";
import { cnpjValido, cpfValido } from "@/lib/validators";

export type LinhaPreview = {
  linha: number;
  razao_social: string;
  inscricao: string;
  status: "ok" | "erro";
  msg: string;
};

export type Estado = {
  erro?: string;
  preview?: LinhaPreview[];
  resumo?: { processadas: number; rejeitadas: number };
};

const TIPOS = ["cnpj", "cpf", "caepf", "cno"];
const SITUACOES = ["liberado", "bloqueado"];
const MODALIDADES = ["gestao", "treinamentos", "link"];

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

export async function importarEmpresas(_prev: Estado, formData: FormData): Promise<Estado> {
  const csv = String(formData.get("csv") ?? "").trim();
  const confirmar = String(formData.get("confirmar") ?? "") === "sim";
  if (!csv) return { erro: "Cole o conteúdo da planilha (CSV) ou carregue um arquivo." };

  const linhas = parseCsv(csv);
  if (linhas.length < 2) return { erro: "A planilha precisa de cabeçalho + ao menos uma linha." };

  const cab = linhas[0].map((h) => h.toLowerCase());
  const col = (nome: string) => cab.indexOf(nome);
  const iRazao = col("razao_social");
  const iFant = col("nome_fantasia");
  const iTipo = col("tipo_inscricao");
  const iInsc = col("inscricao");
  const iGrau = col("grau_risco");
  const iSit = col("situacao");
  const iMod = col("modalidade");
  if (iRazao < 0 || iInsc < 0) {
    return { erro: "Cabeçalho precisa conter ao menos: razao_social, inscricao." };
  }

  const usuario = await getUsuarioAtual();
  if (!usuario) return { erro: "Sessão expirada." };

  const preview: LinhaPreview[] = [];
  const validas: Record<string, unknown>[] = [];

  linhas.slice(1).forEach((r, idx) => {
    const nLinha = idx + 2; // +cabeçalho +base 1
    const razao = (r[iRazao] ?? "").trim();
    const tipo = ((iTipo >= 0 ? r[iTipo] : "cnpj") || "cnpj").toLowerCase();
    const insc = (r[iInsc] ?? "").replace(/\D/g, "");
    const add = (status: "ok" | "erro", msg: string) =>
      preview.push({ linha: nLinha, razao_social: razao || "—", inscricao: insc || "—", status, msg });

    if (!razao) return add("erro", "razao_social vazio");
    if (!TIPOS.includes(tipo)) return add("erro", `tipo_inscricao inválido (${tipo})`);
    if (!insc) return add("erro", "inscrição vazia");
    if (tipo === "cnpj" && !cnpjValido(insc)) return add("erro", "CNPJ inválido");
    if (tipo === "cpf" && !cpfValido(insc)) return add("erro", "CPF inválido");

    const grauRaw = iGrau >= 0 ? Number(r[iGrau]) : NaN;
    const grau = Number.isFinite(grauRaw) && grauRaw >= 1 && grauRaw <= 4 ? grauRaw : null;
    const sit = iSit >= 0 && SITUACOES.includes((r[iSit] ?? "").toLowerCase()) ? r[iSit].toLowerCase() : "bloqueado";
    const mod = iMod >= 0 && MODALIDADES.includes((r[iMod] ?? "").toLowerCase()) ? r[iMod].toLowerCase() : "gestao";

    validas.push({
      consultoria_id: usuario.consultoria_id,
      razao_social: razao,
      nome_fantasia: iFant >= 0 ? r[iFant]?.trim() || null : null,
      tipo_inscricao: tipo,
      inscricao: insc,
      grau_risco: grau,
      situacao: sit,
      modalidade: mod,
    });
    add("ok", "pronta para importar");
  });

  const rejeitadas = preview.filter((p) => p.status === "erro").length;

  if (!confirmar) {
    return { preview };
  }

  if (validas.length === 0) return { erro: "Nenhuma linha válida para importar.", preview };

  const supabase = await createClient();
  const { error } = await supabase
    .from("empresa")
    .upsert(validas, { onConflict: "consultoria_id,tipo_inscricao,inscricao" });
  if (error) return { erro: `Falha ao importar: ${error.message}`, preview };

  return { preview, resumo: { processadas: validas.length, rejeitadas } };
}
