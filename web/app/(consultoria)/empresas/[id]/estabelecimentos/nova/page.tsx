"use client";

import { use, useActionState } from "react";
import Link from "next/link";
import { criarEstabelecimento, type Estado } from "./actions";
import { Campo, inputCls } from "@/components/ui";

export default function NovoEstabelecimento({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [state, action, pending] = useActionState<Estado, FormData>(
    criarEstabelecimento.bind(null, id),
    {},
  );

  return (
    <div className="max-w-2xl">
      <Link href={`/empresas/${id}/estabelecimentos`} className="text-sm text-brand-ink">
        ← Voltar
      </Link>
      <h2 className="text-lg font-bold mt-2 mb-4">Novo estabelecimento</h2>
      <form action={action} className="bg-[var(--surface)] rounded-xl shadow p-5 grid sm:grid-cols-2 gap-4">
        <Campo label="Tipo de unidade">
          <select name="tipo_unidade" className={inputCls}>
            <option value="matriz">Matriz</option>
            <option value="filial">Filial</option>
          </select>
        </Campo>
        <Campo label="Tipo de inscrição">
          <select name="tipo_inscricao" className={inputCls}>
            <option value="cnpj">CNPJ</option>
            <option value="cpf">CPF</option>
            <option value="caepf">CAEPF</option>
            <option value="cno">CNO</option>
          </select>
        </Campo>
        <Campo label="Número da inscrição *">
          <input name="inscricao" inputMode="numeric" className={inputCls} />
        </Campo>
        <Campo label="Apelido">
          <input name="apelido" className={inputCls} />
        </Campo>
        <Campo label="CEP">
          <input name="cep" className={inputCls} />
        </Campo>
        <Campo label="Cidade">
          <input name="cidade" defaultValue="Boa Vista" className={inputCls} />
        </Campo>
        <Campo label="UF">
          <input name="uf" defaultValue="RR" maxLength={2} className={inputCls} />
        </Campo>
        <Campo label="Bairro">
          <input name="bairro" className={inputCls} />
        </Campo>
        <div className="sm:col-span-2">
          <Campo label="Logradouro">
            <input name="logradouro" className={inputCls} />
          </Campo>
        </div>
        {state?.erro ? <p className="sm:col-span-2 text-sm text-red-600">{state.erro}</p> : null}
        <div className="sm:col-span-2 flex justify-end gap-2">
          <Link href={`/empresas/${id}/estabelecimentos`} className="px-4 py-2 rounded-lg border border-gray-300 text-sm">
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
