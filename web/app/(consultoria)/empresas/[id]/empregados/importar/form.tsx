"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { importarEmpregados, type Estado } from "./actions";

export default function FormImportarEmpregados({ empresaId }: { empresaId: string }) {
  const acao = importarEmpregados.bind(null, empresaId);
  const [state, action, pending] = useActionState<Estado, FormData>(acao, {});
  const [csv, setCsv] = useState("");

  async function carregarArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) setCsv(await f.text());
  }

  const temPreview = !!state.preview && state.preview.length > 0;
  const okCount = state.preview?.filter((p) => p.status === "ok").length ?? 0;
  const base = `/empresas/${empresaId}/empregados`;

  return (
    <div className="max-w-3xl">
      <Link href={base} className="text-sm text-brand-ink">
        ← Voltar
      </Link>
      <h1 className="text-xl font-bold mt-2 mb-1">Importar empregados</h1>
      <p className="text-sm opacity-70 mb-4">
        Cole o CSV ou carregue um arquivo. Baixe o{" "}
        <a href={`${base}/modelo`} className="text-brand-ink underline">
          modelo
        </a>
        . Chave de atualização: CPF (por empresa).
      </p>

      <form action={action} className="bg-[var(--surface)] rounded-xl shadow p-5 grid gap-4">
        <input type="file" accept=".csv,text/csv" onChange={carregarArquivo} className="text-sm" />
        <textarea
          name="csv"
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
          rows={8}
          placeholder="cpf,matricula,nome,nascimento,sexo,admissao,categoria_esocial,funcao"
          className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-transparent font-mono text-xs"
        />

        {state.erro ? <p className="text-sm text-red-600">{state.erro}</p> : null}
        {state.resumo ? (
          <p className="text-sm text-brand-ink bg-brand-light rounded-lg px-3 py-2">
            Importação concluída: {state.resumo.processadas} processado(s),{" "}
            {state.resumo.rejeitadas} rejeitado(s).
          </p>
        ) : null}

        <div className="flex gap-2">
          <button name="confirmar" value="" disabled={pending} className="px-4 py-2 rounded-lg border border-gray-300 text-sm disabled:opacity-60">
            {pending ? "Processando…" : "Pré-visualizar"}
          </button>
          {temPreview && !state.resumo ? (
            <button
              name="confirmar"
              value="sim"
              disabled={pending || okCount === 0}
              className="px-4 py-2 rounded-lg bg-brand text-white text-sm font-semibold disabled:opacity-60"
            >
              Confirmar importação ({okCount})
            </button>
          ) : null}
        </div>
      </form>

      {temPreview ? (
        <div className="bg-[var(--surface)] rounded-xl shadow overflow-x-auto mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide opacity-60 border-b">
                <th className="p-3">Linha</th>
                <th className="p-3">Nome</th>
                <th className="p-3">CPF</th>
                <th className="p-3">Situação</th>
              </tr>
            </thead>
            <tbody>
              {state.preview!.map((p) => (
                <tr key={p.linha} className="border-b last:border-0">
                  <td className="p-3">{p.linha}</td>
                  <td className="p-3">{p.nome}</td>
                  <td className="p-3">{p.cpf}</td>
                  <td className="p-3">
                    <span
                      className={[
                        "text-xs font-semibold rounded px-2 py-0.5",
                        p.status === "ok" ? "bg-brand-light text-brand-ink" : "bg-red-100 text-red-700",
                      ].join(" ")}
                    >
                      {p.msg}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
