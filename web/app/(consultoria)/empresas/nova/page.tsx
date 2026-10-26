"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { criarEmpresa, type EstadoNova } from "./actions";
import { mascaraCnpj, mascaraCpf } from "@/lib/validators";

const ETAPAS = ["Empresa", "Ambientes", "Riscos", "Empregados", "Faturamento"];

export default function NovaEmpresaPage() {
  const [state, action, pending] = useActionState<EstadoNova, FormData>(
    criarEmpresa,
    {},
  );
  const [tipo, setTipo] = useState("cnpj");
  const [insc, setInsc] = useState("");

  const onInsc = (v: string) => {
    if (tipo === "cnpj" || tipo === "caepf") setInsc(mascaraCnpj(v));
    else if (tipo === "cpf") setInsc(mascaraCpf(v));
    else setInsc(v.replace(/\D/g, "").slice(0, 12));
  };

  return (
    <div className="max-w-3xl">
      <Link href="/empresas" className="text-sm text-brand-ink">
        ← Voltar para Empresas
      </Link>
      <h1 className="text-xl font-bold mt-2 mb-1">Instalação Inicial — Nova Empresa</h1>
      <p className="text-sm opacity-70 mb-4">
        A empresa nasce <b>Bloqueada</b> e fica Liberada ao concluir as 5 etapas.
      </p>

      <div className="flex gap-2 flex-wrap mb-6">
        {ETAPAS.map((e, i) => (
          <div
            key={e}
            className={[
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border",
              i === 0
                ? "border-brand bg-brand-light text-brand-ink"
                : "border-gray-200 opacity-60",
            ].join(" ")}
          >
            <span
              className={[
                "w-5 h-5 rounded-full grid place-items-center font-bold",
                i === 0 ? "bg-brand text-white" : "bg-gray-200",
              ].join(" ")}
            >
              {i + 1}
            </span>
            {e}
          </div>
        ))}
      </div>

      <form action={action} className="bg-[var(--surface)] rounded-xl shadow p-5 grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2 text-xs font-bold uppercase tracking-wide text-brand-ink border-b pb-1">
          Modalidade
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" name="modalidade" value="gestao" defaultChecked /> 🛡️ Gestão Completa
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" name="modalidade" value="treinamentos" /> 🎓 Somente Treinamentos
        </label>

        <div className="sm:col-span-2 text-xs font-bold uppercase tracking-wide text-brand-ink border-b pb-1 mt-2">
          Dados da empresa
        </div>
        <Campo label="Tipo de inscrição *">
          <select
            name="tipo_inscricao"
            value={tipo}
            onChange={(e) => {
              setTipo(e.target.value);
              setInsc("");
            }}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-transparent"
          >
            <option value="cnpj">CNPJ</option>
            <option value="cpf">CPF</option>
            <option value="caepf">CAEPF (produtor rural)</option>
            <option value="cno">CNO (obra)</option>
          </select>
        </Campo>
        <Campo label={`Número do ${tipo.toUpperCase()} *`}>
          <input
            name="inscricao"
            value={insc}
            onChange={(e) => onInsc(e.target.value)}
            inputMode="numeric"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-transparent"
          />
        </Campo>
        <div className="sm:col-span-2">
          <Campo label="Razão social *">
            <input name="razao_social" className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-transparent" />
          </Campo>
        </div>
        <Campo label="Nome fantasia">
          <input name="nome_fantasia" className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-transparent" />
        </Campo>
        <Campo label="CNAE principal">
          <input name="cnae" placeholder="0151-2/01" className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-transparent" />
        </Campo>
        <Campo label="E-mail da empresa">
          <input name="email" type="email" className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-transparent" />
        </Campo>
        <Campo label="E-mail de cobrança">
          <input name="email_cobranca" type="email" className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-transparent" />
        </Campo>
        <Campo label="Telefone">
          <input name="telefone" className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-transparent" />
        </Campo>
        <Campo label="Grau de risco (NR-4) *">
          <select name="grau_risco" className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-transparent">
            <option value="">—</option>
            <option value="1">Grau 1</option>
            <option value="2">Grau 2</option>
            <option value="3">Grau 3</option>
            <option value="4">Grau 4</option>
          </select>
        </Campo>

        <label className="sm:col-span-2 flex items-start gap-2 text-sm mt-2">
          <input type="checkbox" name="termos" className="mt-1" /> Declaro que li e
          concordo com os termos de uso.
        </label>

        {state?.erro ? (
          <p className="sm:col-span-2 text-sm text-red-600">{state.erro}</p>
        ) : null}

        <div className="sm:col-span-2 flex justify-end gap-2 mt-2">
          <Link href="/empresas" className="px-4 py-2 rounded-lg border border-gray-300 text-sm">
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={pending}
            className="px-4 py-2 rounded-lg bg-brand text-white text-sm font-semibold disabled:opacity-60"
          >
            {pending ? "Salvando…" : "Cadastrar"}
          </button>
        </div>
        <p className="sm:col-span-2 text-xs opacity-50">
          As etapas Ambientes → Riscos → Empregados → Faturamento são concluídas
          dentro da empresa (botão Acessar).
        </p>
      </form>
    </div>
  );
}

function Campo({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wide opacity-60 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}
