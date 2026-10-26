"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { criarEmpregado, type Estado } from "./actions";
import { Campo, inputCls } from "@/components/ui";
import { mascaraCpf } from "@/lib/validators";

// Tabela 01 do eSocial — subconjunto comum (validado contra o seed oficial depois)
const CATEGORIAS: [string, string][] = [
  ["101", "101 — Empregado geral"],
  ["103", "103 — Empregado aprendiz"],
  ["104", "104 — Empregado doméstico"],
  ["111", "111 — Empregado intermitente"],
];

export function FormEmpregado({
  empresaId,
  funcoes,
}: {
  empresaId: string;
  funcoes: { id: string; nome: string }[];
}) {
  const [state, action, pending] = useActionState<Estado, FormData>(
    criarEmpregado.bind(null, empresaId),
    {},
  );
  const [cpf, setCpf] = useState("");

  return (
    <form action={action} className="bg-[var(--surface)] rounded-xl shadow p-5 grid sm:grid-cols-2 gap-4">
      <div className="sm:col-span-2 text-xs font-bold uppercase tracking-wide text-brand-ink border-b pb-1">
        Identificação
      </div>
      <div className="sm:col-span-2">
        <Campo label="Nome completo *">
          <input name="nome" className={inputCls} />
        </Campo>
      </div>
      <Campo label="CPF *">
        <input
          name="cpf"
          value={cpf}
          onChange={(e) => setCpf(mascaraCpf(e.target.value))}
          inputMode="numeric"
          className={inputCls}
        />
      </Campo>
      <Campo label="Matrícula">
        <input name="matricula" className={inputCls} />
      </Campo>
      <Campo label="Data de nascimento">
        <input name="nascimento" type="date" className={inputCls} />
      </Campo>
      <Campo label="Sexo">
        <select name="sexo" className={inputCls}>
          <option value="">—</option>
          <option>Feminino</option>
          <option>Masculino</option>
        </select>
      </Campo>

      <div className="sm:col-span-2 text-xs font-bold uppercase tracking-wide text-brand-ink border-b pb-1 mt-2">
        Vínculo
      </div>
      <Campo label="Categoria (Tabela 01)">
        <select name="categoria_esocial" className={inputCls}>
          <option value="">—</option>
          {CATEGORIAS.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      </Campo>
      <Campo label="Função">
        <select name="funcao_id" className={inputCls}>
          <option value="">—</option>
          {funcoes.map((f) => (
            <option key={f.id} value={f.id}>
              {f.nome}
            </option>
          ))}
        </select>
      </Campo>
      <Campo label="Data de admissão">
        <input name="admissao" type="date" className={inputCls} />
      </Campo>

      {state?.erro ? <p className="sm:col-span-2 text-sm text-red-600">{state.erro}</p> : null}
      <div className="sm:col-span-2 flex justify-end gap-2">
        <Link href={`/empresas/${empresaId}/empregados`} className="px-4 py-2 rounded-lg border border-gray-300 text-sm">
          Cancelar
        </Link>
        <button disabled={pending} className="px-4 py-2 rounded-lg bg-brand text-white text-sm font-semibold disabled:opacity-60">
          {pending ? "Salvando…" : "Cadastrar empregado"}
        </button>
      </div>
    </form>
  );
}
