"use client";

import { useActionState } from "react";
import Link from "next/link";
import { criarTipoExame, type Estado } from "./actions";
import { Campo, inputCls } from "@/components/ui";

const TIPOS: [string, string][] = [
  ["a", "Admissional (A)"],
  ["p", "Periódico (P)"],
  ["d", "Demissional (D)"],
  ["rt", "Retorno ao Trabalho (RT)"],
  ["mr", "Mudança de Risco/Função (MR)"],
];

export default function NovoTipoExame() {
  const [state, action, pending] = useActionState<Estado, FormData>(criarTipoExame, {});

  return (
    <div className="max-w-xl">
      <Link href="/medicina" className="text-sm text-brand-ink">
        ← Voltar
      </Link>
      <h1 className="text-xl font-bold mt-2 mb-4">Novo tipo de exame</h1>
      <form action={action} className="bg-[var(--surface)] rounded-xl shadow p-5 grid gap-4">
        <Campo label="Nome do exame *">
          <input name="nome" className={inputCls} placeholder="Audiometria" />
        </Campo>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide opacity-60 mb-2">
            Exigível em quais tipos de ASO
          </div>
          <div className="grid sm:grid-cols-2 gap-2">
            {TIPOS.map(([n, l]) => (
              <label key={n} className="flex items-center gap-2 text-sm border border-gray-200 rounded-lg px-3 py-2">
                <input type="checkbox" name={n} /> {l}
              </label>
            ))}
          </div>
        </div>
        {state?.erro ? <p className="text-sm text-red-600">{state.erro}</p> : null}
        <div className="flex justify-end gap-2">
          <Link href="/medicina" className="px-4 py-2 rounded-lg border border-gray-300 text-sm">
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
