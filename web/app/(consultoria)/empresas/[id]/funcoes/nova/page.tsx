"use client";

import { use, useActionState } from "react";
import Link from "next/link";
import { criarFuncao, type Estado } from "./actions";
import { Campo, inputCls } from "@/components/ui";

export default function NovaFuncao({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [state, action, pending] = useActionState<Estado, FormData>(
    criarFuncao.bind(null, id),
    {},
  );

  return (
    <div className="max-w-xl">
      <Link href={`/empresas/${id}/funcoes`} className="text-sm text-brand-ink">
        ← Voltar
      </Link>
      <h2 className="text-lg font-bold mt-2 mb-4">Nova função</h2>
      <form action={action} className="bg-[var(--surface)] rounded-xl shadow p-5 grid gap-4">
        <Campo label="Nome da função *">
          <input name="nome" className={inputCls} placeholder="Operador de Máquinas" />
        </Campo>
        <Campo label="CBO (6 dígitos)">
          <input name="cbo" inputMode="numeric" maxLength={6} className={inputCls} placeholder="841105" />
        </Campo>
        <Campo label="Periodicidade do ASO (meses) — NR-7">
          <input name="aso_periodicidade_meses" type="number" defaultValue={12} className={inputCls} />
        </Campo>
        <Campo label="Descrição">
          <input name="descricao" className={inputCls} />
        </Campo>
        {state?.erro ? <p className="text-sm text-red-600">{state.erro}</p> : null}
        <div className="flex justify-end gap-2">
          <Link href={`/empresas/${id}/funcoes`} className="px-4 py-2 rounded-lg border border-gray-300 text-sm">
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
