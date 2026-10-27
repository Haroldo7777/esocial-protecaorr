"use client";

import { useActionState } from "react";
import Link from "next/link";
import { criarTreinamento, type Estado } from "./actions";
import { TIPOS_TREINAMENTO } from "@/lib/treinamentos-defs";
import { Campo, inputCls } from "@/components/ui";

export default function NovoTreinamento() {
  const [state, action, pending] = useActionState<Estado, FormData>(criarTreinamento, {});

  return (
    <div className="max-w-xl">
      <Link href="/treinamentos" className="text-sm text-brand-ink">
        ← Voltar
      </Link>
      <h1 className="text-xl font-bold mt-2 mb-4">Novo treinamento</h1>
      <form action={action} className="bg-[var(--surface)] rounded-xl shadow p-5 grid gap-4">
        <Campo label="Nome do treinamento *">
          <input name="nome" className={inputCls} placeholder="Trabalho em altura" />
        </Campo>
        <div className="grid sm:grid-cols-2 gap-4">
          <Campo label="Documento base (NR)">
            <input name="nr" className={inputCls} placeholder="NR-35" />
          </Campo>
          <Campo label="Tipo">
            <select name="tipo" className={inputCls} defaultValue="inicial">
              {TIPOS_TREINAMENTO.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </Campo>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Campo label="Carga horária (h)">
            <input type="number" name="carga_horaria_h" className={inputCls} min={0} step="0.5" />
          </Campo>
          <Campo label="Periodicidade (meses)">
            <input type="number" name="periodicidade_meses" className={inputCls} min={1} placeholder="Ex.: 24" />
          </Campo>
        </div>
        <p className="text-xs opacity-60 -mt-1">
          Deixe a periodicidade em branco se o treinamento não tem reciclagem. Ela pode
          ser ajustada por empresa na turma.
        </p>
        {state?.erro ? <p className="text-sm text-red-600">{state.erro}</p> : null}
        <div className="flex justify-end gap-2">
          <Link href="/treinamentos" className="px-4 py-2 rounded-lg border border-gray-300 text-sm">
            Cancelar
          </Link>
          <button disabled={pending} className="px-4 py-2 rounded-lg bg-brand text-white text-sm font-semibold disabled:opacity-60">
            {pending ? "Salvando…" : "Cadastrar"}
          </button>
        </div>
      </form>
    </div>
  );
}
