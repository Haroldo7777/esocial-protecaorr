"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ACOES, modulosPorGrupo } from "@/lib/rbac-defs";
import { Campo, inputCls } from "@/components/ui";

export type Estado = { erro?: string };
type Acao = (prev: Estado, fd: FormData) => Promise<Estado>;

export type PerfilInicial = {
  nome: string;
  descricao: string | null;
  permissoes: Set<string>; // "modulo:acao"
};

export default function FormPerfil({
  action,
  initial,
  submitLabel = "Criar perfil",
  bloqueado = false,
}: {
  action: Acao;
  initial?: PerfilInicial;
  submitLabel?: string;
  bloqueado?: boolean;
}) {
  const [state, formAction, pending] = useActionState<Estado, FormData>(action, {});
  const sel = initial?.permissoes ?? new Set<string>();
  const grupos = modulosPorGrupo();

  return (
    <form action={formAction} className="max-w-3xl">
      {bloqueado ? (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
          Perfil padrão do sistema — somente leitura. Duplique em um novo perfil para
          ajustar.
        </p>
      ) : null}

      <div className="bg-[var(--surface)] rounded-xl shadow p-5 grid gap-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <Campo label="Nome do perfil *">
            <input name="nome" className={inputCls} defaultValue={initial?.nome ?? ""} disabled={bloqueado} />
          </Campo>
          <Campo label="Descrição">
            <input name="descricao" className={inputCls} defaultValue={initial?.descricao ?? ""} disabled={bloqueado} />
          </Campo>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-wide opacity-60 mb-2">
            Permissões (módulo × ação)
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide opacity-50 border-b">
                  <th className="p-2">Módulo</th>
                  {ACOES.map((a) => (
                    <th key={a.id} className="p-2 text-center w-16">
                      {a.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {grupos.map(([grupo, mods]) => (
                  <GrupoLinhas key={grupo} grupo={grupo} mods={mods} sel={sel} bloqueado={bloqueado} />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {state?.erro ? <p className="text-sm text-red-600">{state.erro}</p> : null}
        <div className="flex justify-end gap-2">
          <Link href="/permissoes" className="px-4 py-2 rounded-lg border border-gray-300 text-sm">
            Voltar
          </Link>
          {!bloqueado ? (
            <button
              disabled={pending}
              className="px-5 py-2 rounded-lg bg-brand text-white text-sm font-semibold disabled:opacity-60"
            >
              {pending ? "Salvando…" : submitLabel}
            </button>
          ) : null}
        </div>
      </div>
    </form>
  );
}

function GrupoLinhas({
  grupo,
  mods,
  sel,
  bloqueado,
}: {
  grupo: string;
  mods: { id: string; label: string }[];
  sel: Set<string>;
  bloqueado: boolean;
}) {
  return (
    <>
      <tr className="bg-gray-50">
        <td colSpan={5} className="px-2 py-1 text-[11px] font-bold uppercase tracking-wide opacity-60">
          {grupo}
        </td>
      </tr>
      {mods.map((m) => (
        <tr key={m.id} className="border-b last:border-0">
          <td className="p-2">{m.label}</td>
          {ACOES.map((a) => {
            const chave = `${m.id}:${a.id}`;
            return (
              <td key={a.id} className="p-2 text-center">
                <input
                  type="checkbox"
                  name="perm"
                  value={chave}
                  defaultChecked={sel.has(chave)}
                  disabled={bloqueado}
                />
              </td>
            );
          })}
        </tr>
      ))}
    </>
  );
}
