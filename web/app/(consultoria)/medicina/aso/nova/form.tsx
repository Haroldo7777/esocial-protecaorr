"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registrarAso, type Estado } from "./actions";
import { Campo, inputCls } from "@/components/ui";

type EmpregadoOpt = { id: string; nome: string };
type ExameOpt = { id: string; nome: string; periodicidade_meses: number };

const TIPOS: [string, string][] = [
  ["admissional", "Admissional"],
  ["periodico", "Periódico"],
  ["demissional", "Demissional"],
  ["retorno", "Retorno ao trabalho"],
  ["mudanca", "Mudança de risco/função"],
];

export default function FormAso({
  empresaId,
  empresaNome,
  empregados,
  exames,
}: {
  empresaId: string;
  empresaNome: string;
  empregados: EmpregadoOpt[];
  exames: ExameOpt[];
}) {
  const registrar = registrarAso.bind(null, empresaId);
  const [state, action, pending] = useActionState<Estado, FormData>(registrar, {});

  // periodicidade sugerida = menor do plano (o exame que vence antes rege o próximo ASO)
  const periodicidadeSugerida =
    exames.length > 0 ? Math.min(...exames.map((e) => e.periodicidade_meses)) : 12;

  return (
    <div className="max-w-xl">
      <Link href="/medicina/aso/nova" className="text-sm text-brand-ink">
        ← Trocar empresa
      </Link>
      <h1 className="text-xl font-bold mt-2 mb-1">Registrar ASO</h1>
      <p className="text-sm opacity-60 mb-4">{empresaNome}</p>

      {empregados.length === 0 ? (
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

          <div className="grid sm:grid-cols-3 gap-4">
            <Campo label="Tipo *">
              <select name="tipo" className={inputCls} defaultValue="periodico">
                {TIPOS.map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo label="Data do exame *">
              <input type="date" name="data_exame" className={inputCls} />
            </Campo>
            <Campo label="Periodicidade (meses)">
              <input
                type="number"
                name="periodicidade_meses"
                className={inputCls}
                min={1}
                defaultValue={periodicidadeSugerida}
              />
            </Campo>
          </div>
          <p className="text-xs opacity-60 -mt-2">
            O próximo ASO é calculado como data do exame + periodicidade (não se aplica
            ao demissional).
          </p>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wide opacity-60 mb-2">
              Exames realizados (do plano da empresa)
            </div>
            {exames.length === 0 ? (
              <p className="text-sm opacity-70">
                Nenhum exame no plano desta empresa. Inclua em Empresa → Exames (PCMSO).
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-2">
                {exames.map((e) => (
                  <label
                    key={e.id}
                    className="flex items-center gap-2 text-sm border border-gray-200 rounded-lg px-3 py-2"
                  >
                    <input type="checkbox" name="exames" value={e.id} defaultChecked />
                    <span>
                      {e.nome}
                      <span className="opacity-50"> · {e.periodicidade_meses}m</span>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Campo label="Resultado">
              <select name="resultado" className={inputCls} defaultValue="">
                <option value="">—</option>
                <option value="apto">Apto</option>
                <option value="apto_com_restricao">Apto com restrição</option>
                <option value="inapto">Inapto</option>
              </select>
            </Campo>
            <Campo label="Médico responsável">
              <input name="medico_responsavel" className={inputCls} placeholder="Nome" />
            </Campo>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Campo label="CRM">
              <input name="crm_medico" className={inputCls} placeholder="Opcional" />
            </Campo>
            <Campo label="Observações">
              <input name="observacoes" className={inputCls} placeholder="Opcional" />
            </Campo>
          </div>

          {state?.erro ? <p className="text-sm text-red-600">{state.erro}</p> : null}
          <div className="flex justify-end gap-2">
            <Link href="/medicina/aso" className="px-4 py-2 rounded-lg border border-gray-300 text-sm">
              Cancelar
            </Link>
            <button
              disabled={pending}
              className="px-4 py-2 rounded-lg bg-brand text-white text-sm font-semibold disabled:opacity-60"
            >
              {pending ? "Salvando…" : "Registrar ASO"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
