"use client";

import { use, useActionState } from "react";
import Link from "next/link";
import { criarGhe, type Estado } from "./actions";
import { Campo, inputCls } from "@/components/ui";

export default function NovoGhe({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [state, action, pending] = useActionState<Estado, FormData>(
    criarGhe.bind(null, id),
    {},
  );

  return (
    <div className="max-w-xl">
      <Link href={`/empresas/${id}/ghe`} className="text-sm text-brand-ink">
        ← Voltar
      </Link>
      <h2 className="text-lg font-bold mt-2 mb-1">Novo Grupo de Trabalho (GHE)</h2>
      <p className="text-sm opacity-70 mb-4">
        Cadastro base do grupo. As etapas de ambientes, funções, empregados,
        riscos e medidas (o wizard de 5 etapas) são o próximo passo.
      </p>
      <form action={action} className="bg-[var(--surface)] rounded-xl shadow p-5 grid gap-4">
        <Campo label="Referência *">
          <input name="referencia" className={inputCls} placeholder="Linha de Produção / Operação" />
        </Campo>
        <Campo label="Número">
          <input name="numero" type="number" defaultValue={1} className={inputCls} />
        </Campo>
        <Campo label="Processo">
          <textarea name="processo" rows={2} className={inputCls} />
        </Campo>
        <Campo label="Jornada de trabalho">
          <input name="jornada" className={inputCls} />
        </Campo>
        <Campo label="Observação">
          <textarea name="obs_geral" rows={2} className={inputCls} />
        </Campo>
        {state?.erro ? <p className="text-sm text-red-600">{state.erro}</p> : null}
        <div className="flex justify-end gap-2">
          <Link href={`/empresas/${id}/ghe`} className="px-4 py-2 rounded-lg border border-gray-300 text-sm">
            Cancelar
          </Link>
          <button disabled={pending} className="px-4 py-2 rounded-lg bg-brand text-white text-sm font-semibold disabled:opacity-60">
            {pending ? "Salvando…" : "Criar grupo"}
          </button>
        </div>
      </form>
    </div>
  );
}
