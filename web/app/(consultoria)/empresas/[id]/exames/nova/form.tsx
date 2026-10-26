"use client";

import { useActionState } from "react";
import Link from "next/link";
import { incluirExameNoPlano, type Estado } from "./actions";
import { Campo, inputCls } from "@/components/ui";

type Opt = { id: string; nome: string };
type GheOpt = { id: string; referencia: string };

export default function FormPlanoExame({
  empresaId,
  exames,
  ghes,
}: {
  empresaId: string;
  exames: Opt[];
  ghes: GheOpt[];
}) {
  const incluir = incluirExameNoPlano.bind(null, empresaId);
  const [state, action, pending] = useActionState<Estado, FormData>(incluir, {});
  const voltar = `/empresas/${empresaId}/exames`;

  return (
    <div className="max-w-xl">
      <Link href={voltar} className="text-sm text-brand-ink">
        ← Voltar
      </Link>
      <h1 className="text-xl font-bold mt-2 mb-4">Incluir exame no plano</h1>

      {exames.length === 0 ? (
        <p className="text-sm text-red-600">
          Nenhum tipo de exame no catálogo. Cadastre em Medicina → Tipos de exame
          primeiro.
        </p>
      ) : (
        <form action={action} className="bg-[var(--surface)] rounded-xl shadow p-5 grid gap-4">
          <Campo label="Exame *">
            <select name="exame_tipo_id" className={inputCls} defaultValue="">
              <option value="" disabled>
                Selecione…
              </option>
              {exames.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nome}
                </option>
              ))}
            </select>
          </Campo>

          <div className="grid sm:grid-cols-2 gap-4">
            <Campo label="Periodicidade (meses) *">
              <input
                type="number"
                name="periodicidade_meses"
                className={inputCls}
                min={1}
                defaultValue={12}
              />
            </Campo>
            <Campo label="Abrangência">
              <select name="ghe_id" className={inputCls} defaultValue="">
                <option value="">Empresa toda</option>
                {ghes.map((g) => (
                  <option key={g.id} value={g.id}>
                    GHE {g.referencia}
                  </option>
                ))}
              </select>
            </Campo>
          </div>

          <Campo label="Observação">
            <input name="observacao" className={inputCls} placeholder="Opcional" />
          </Campo>

          {state?.erro ? <p className="text-sm text-red-600">{state.erro}</p> : null}
          <div className="flex justify-end gap-2">
            <Link href={voltar} className="px-4 py-2 rounded-lg border border-gray-300 text-sm">
              Cancelar
            </Link>
            <button
              disabled={pending}
              className="px-4 py-2 rounded-lg bg-brand text-white text-sm font-semibold disabled:opacity-60"
            >
              {pending ? "Salvando…" : "Incluir"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
