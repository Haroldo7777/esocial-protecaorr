"use client";

import { useActionState } from "react";
import Link from "next/link";
import { criarEpi, type Estado } from "./actions";
import { Campo, inputCls } from "@/components/ui";

export default function NovoEpi() {
  const [state, action, pending] = useActionState<Estado, FormData>(criarEpi, {});

  return (
    <div className="max-w-xl">
      <Link href="/epi" className="text-sm text-brand-ink">
        ← Voltar
      </Link>
      <h1 className="text-xl font-bold mt-2 mb-4">Novo EPI</h1>
      <form action={action} className="bg-[var(--surface)] rounded-xl shadow p-5 grid gap-4">
        <Campo label="Nome do EPI *">
          <input name="nome" className={inputCls} placeholder="Protetor auricular tipo concha" />
        </Campo>
        <div className="grid sm:grid-cols-2 gap-4">
          <Campo label="CA (Certificado de Aprovação)">
            <input name="ca" className={inputCls} placeholder="Ex.: 12345" />
          </Campo>
          <Campo label="Fabricante">
            <input name="fabricante" className={inputCls} />
          </Campo>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Campo label="Validade do CA">
            <input type="date" name="validade_ca" className={inputCls} />
          </Campo>
          <Campo label="Periodicidade de troca (meses)">
            <input type="number" name="periodicidade_troca_meses" className={inputCls} min={1} placeholder="Ex.: 6" />
          </Campo>
        </div>
        <p className="text-xs opacity-60 -mt-1">
          Deixe a troca em branco se o EPI não tem troca periódica. Ela pode ser ajustada
          por empresa na entrega.
        </p>
        <Campo label="Descrição">
          <textarea name="descricao" rows={2} className={inputCls} />
        </Campo>
        {state?.erro ? <p className="text-sm text-red-600">{state.erro}</p> : null}
        <div className="flex justify-end gap-2">
          <Link href="/epi" className="px-4 py-2 rounded-lg border border-gray-300 text-sm">
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
