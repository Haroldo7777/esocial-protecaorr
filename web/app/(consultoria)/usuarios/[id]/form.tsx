"use client";

import { useActionState } from "react";
import Link from "next/link";
import { atualizarAcesso, type Estado } from "./actions";

type PerfilOpt = { id: string; nome: string };

export default function FormAcesso({
  usuarioId,
  nome,
  email,
  ativo,
  perfis,
  selecionados,
}: {
  usuarioId: string;
  nome: string;
  email: string;
  ativo: boolean;
  perfis: PerfilOpt[];
  selecionados: Set<string>;
}) {
  const acao = atualizarAcesso.bind(null, usuarioId);
  const [state, formAction, pending] = useActionState<Estado, FormData>(acao, {});

  return (
    <form action={formAction} className="max-w-lg bg-[var(--surface)] rounded-xl shadow p-5 grid gap-4">
      <div>
        <div className="font-semibold">{nome}</div>
        <div className="text-sm opacity-60">{email}</div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="ativo" defaultChecked={ativo} /> Usuário ativo
      </label>

      <div>
        <div className="text-xs font-semibold uppercase tracking-wide opacity-60 mb-2">
          Perfis de acesso
        </div>
        {perfis.length === 0 ? (
          <p className="text-sm opacity-60">
            Nenhum perfil cadastrado. Crie em Perfis de acesso primeiro.
          </p>
        ) : (
          <div className="grid gap-1.5">
            {perfis.map((p) => (
              <label key={p.id} className="flex items-center gap-2 text-sm border border-gray-200 rounded-lg px-3 py-2">
                <input type="checkbox" name="perfil" value={p.id} defaultChecked={selecionados.has(p.id)} />
                {p.nome}
              </label>
            ))}
          </div>
        )}
      </div>

      {state?.erro ? <p className="text-sm text-red-600">{state.erro}</p> : null}
      <div className="flex justify-end gap-2">
        <Link href="/usuarios" className="px-4 py-2 rounded-lg border border-gray-300 text-sm">
          Cancelar
        </Link>
        <button disabled={pending} className="px-5 py-2 rounded-lg bg-brand text-white text-sm font-semibold disabled:opacity-60">
          {pending ? "Salvando…" : "Salvar acesso"}
        </button>
      </div>
    </form>
  );
}
