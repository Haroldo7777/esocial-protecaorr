// Geração de CSV (com BOM para abrir certinho no Excel em pt-BR).

type Celula = string | number | boolean | null | undefined;

function escapar(v: Celula): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (/[",;\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function gerarCsv(cabecalho: string[], linhas: Celula[][]): string {
  const sep = ";"; // Excel pt-BR usa ; como separador
  const corpo = [cabecalho, ...linhas]
    .map((l) => l.map(escapar).join(sep))
    .join("\r\n");
  return "﻿" + corpo; // BOM UTF-8
}

/** Resposta HTTP pronta para download de um CSV. */
export function respostaCsv(nomeArquivo: string, conteudo: string): Response {
  return new Response(conteudo, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${nomeArquivo}"`,
    },
  });
}
