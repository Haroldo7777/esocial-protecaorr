"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { registrarEntrega, type Estado } from "./actions";
import { TIPOS_MOV_EPI } from "@/lib/epi-defs";
import { Campo, inputCls } from "@/components/ui";

type EpiOpt = { id: string; nome: string; ca: string | null; periodicidade_troca_meses: number | null };
type EmpregadoOpt = { id: string; nome: string };

export default function FormEntrega({
  empresaId,
  empresaNome,
  epis,
  empregados,
}: {
  empresaId: string;
  empresaNome: string;
  epis: EpiOpt[];
  empregados: EmpregadoOpt[];
}) {
  const registrar = registrarEntrega.bind(null, empresaId);
  const [state, action, pending] = useActionState<Estado, FormData>(registrar, {});
  const [epiId, setEpiId] = useState(epis[0]?.id ?? "");

  const epi = epis.find((e) => e.id === epiId);

  return (
    <div className="max-w-xl">
      <Link href="/epi/entregas/nova" className="text-sm text-brand-ink">
        ← Trocar empresa
      </Link>
      <h1 className="text-xl font-bold mt-2 mb-1">Registrar entrega de EPI</h1>
      <p className="text-sm opacity-60 mb-4">{empresaNome}</p>

      {epis.length === 0 ? (
        <p className="text-sm text-red-600">
          Nenhum EPI no catálogo. Cadastre em EPI → Catálogo primeiro.
        </p>
      ) : empregados.length === 0 ? (
        <p className="text-sm text-red-600">
          Essa empresa não tem empregados ativos cadastrados.
        </p>
      ) : (
        <form action={action} className="bg-[var(--surface)] rounded-xl shadow p-5 grid gap-4">
          <Campo label="Empregado *">
            <select name="empregado_id" className={inputCls} defaultValue="">
              <option value="" disabled>
                Selecione…
              </option>
              {empregados.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nome}
                </option>
              ))}
            </select>
          </Campo>

          <Campo label="EPI *">
            <select
              name="epi_id"
              className={inputCls}
              value={epiId}
              onChange={(e) => setEpiId(e.target.value)}
            >
              {epis.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nome}
                  {e.ca ? ` (CA ${e.ca})` : ""}
                </option>
              ))}
            </select>
          </Campo>

          <div className="grid sm:grid-cols-4 gap-4">
            <Campo label="Tipo">
              <select name="tipo" className={inputCls} defaultValue="entrega">
                {TIPOS_MOV_EPI.map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo label="Data *">
              <input type="date" name="data_entrega" className={inputCls} />
            </Campo>
            <Campo label="Qtd">
              <input type="number" name="quantidade" className={inputCls} min={1} defaultValue={1} />
            </Campo>
            <Campo label="Troca (meses)">
              <input
                key={epiId}
                type="number"
                name="periodicidade_meses"
                className={inputCls}
                min={1}
                defaultValue={epi?.periodicidade_troca_meses ?? ""}
                placeholder="Sem troca"
              />
            </Campo>
          </div>
          <p className="text-xs opacity-60 -mt-2">
            A próxima troca é data + periodicidade. Em branco = sem troca periódica.
          </p>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="assinado" /> Recibo assinado pelo empregado
          </label>

          <Campo label="Observações">
            <input name="observacoes" className={inputCls} placeholder="Opcional" />
          </Campo>

          {state?.erro ? <p className="text-sm text-red-600">{state.erro}</p> : null}
          <div className="flex justify-end gap-2">
            <Link href="/epi/entregas" className="px-4 py-2 rounded-lg border border-gray-300 text-sm">
              Cancelar
            </Link>
            <button
              disabled={pending}
              className="px-4 py-2 rounded-lg bg-brand text-white text-sm font-semibold disabled:opacity-60"
            >
              {pending ? "Salvando…" : "Registrar entrega"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
