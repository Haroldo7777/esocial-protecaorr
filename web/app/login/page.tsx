"use client";

import { useActionState } from "react";
import { entrar } from "./actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(entrar, { erro: "" } as {
    erro?: string;
  });

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <form
        action={action}
        className="w-full max-w-sm bg-[var(--surface)] rounded-xl shadow p-7"
      >
        <div className="flex items-center gap-2 mb-1">
          <div className="w-9 h-9 rounded-lg bg-brand text-white grid place-items-center font-extrabold text-sm">
            RR
          </div>
          <div>
            <b className="block text-brand-ink">Proteção RR</b>
            <small className="text-xs opacity-70">Auditor eSocial</small>
          </div>
        </div>
        <h1 className="text-lg font-bold mt-4 mb-4">Entrar</h1>

        <label className="block text-xs font-semibold uppercase tracking-wide opacity-70 mb-1">
          E-mail
        </label>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full mb-3 px-3 py-2.5 rounded-lg border border-gray-300 bg-transparent"
        />

        <label className="block text-xs font-semibold uppercase tracking-wide opacity-70 mb-1">
          Senha
        </label>
        <input
          name="senha"
          type="password"
          required
          autoComplete="current-password"
          className="w-full mb-4 px-3 py-2.5 rounded-lg border border-gray-300 bg-transparent"
        />

        {state?.erro ? (
          <p className="text-sm text-red-600 mb-3">{state.erro}</p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="w-full py-2.5 rounded-lg bg-brand text-white font-semibold disabled:opacity-60"
        >
          {pending ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </main>
  );
}
