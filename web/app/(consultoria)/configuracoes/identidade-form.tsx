"use client";

import { useActionState, useState } from "react";
import { salvarIdentidade, type Estado } from "./actions";
import { Campo, inputCls } from "@/components/ui";

type Init = {
  razao_social: string;
  nome_fantasia: string | null;
  cnpj: string | null;
  cor_primaria: string | null;
  logo_url: string | null;
};

export default function IdentidadeForm({ initial, salvo }: { initial: Init; salvo: boolean }) {
  const [state, action, pending] = useActionState<Estado, FormData>(salvarIdentidade, {});
  const [cor, setCor] = useState(initial.cor_primaria || "#0d6e3e");
  const [logo, setLogo] = useState(initial.logo_url || "");

  return (
    <form action={action} className="bg-[var(--surface)] rounded-xl shadow p-5 grid gap-4 max-w-xl">
      <div className="grid sm:grid-cols-2 gap-4">
        <Campo label="Razão social *">
          <input name="razao_social" className={inputCls} defaultValue={initial.razao_social} />
        </Campo>
        <Campo label="Nome fantasia">
          <input name="nome_fantasia" className={inputCls} defaultValue={initial.nome_fantasia ?? ""} />
        </Campo>
      </div>
      <Campo label="CNPJ">
        <input name="cnpj" className={inputCls} defaultValue={initial.cnpj ?? ""} placeholder="00.000.000/0000-00" />
      </Campo>

      <div className="grid sm:grid-cols-2 gap-4 items-end">
        <Campo label="Cor primária (white-label)">
          <div className="flex items-center gap-2">
            <input
              type="color"
              name="cor_primaria"
              value={cor}
              onChange={(e) => setCor(e.target.value)}
              className="h-10 w-14 rounded border border-gray-300"
            />
            <input
              value={cor}
              onChange={(e) => setCor(e.target.value)}
              className={inputCls}
            />
          </div>
        </Campo>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide opacity-60 mb-2">Prévia</div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-8 h-8 rounded-lg border border-gray-200" style={{ background: cor }} />
            <span className="px-3 py-1.5 rounded-lg text-white text-sm font-semibold" style={{ background: cor }}>
              Botão
            </span>
          </div>
        </div>
      </div>

      <Campo label="Logotipo (URL)">
        <input name="logo_url" value={logo} onChange={(e) => setLogo(e.target.value)} className={inputCls} placeholder="https://…" />
      </Campo>
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} alt="Logo" className="h-12 w-auto object-contain" />
      ) : null}

      {state?.erro ? <p className="text-sm text-red-600">{state.erro}</p> : null}
      {salvo && !state?.erro ? <p className="text-sm text-brand-ink">Identidade salva.</p> : null}
      <div className="flex justify-end">
        <button disabled={pending} className="px-5 py-2 rounded-lg bg-brand text-white text-sm font-semibold disabled:opacity-60">
          {pending ? "Salvando…" : "Salvar identidade"}
        </button>
      </div>
    </form>
  );
}
