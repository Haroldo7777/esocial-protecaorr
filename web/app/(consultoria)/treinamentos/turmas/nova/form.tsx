"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { criarTurma, type Estado } from "./actions";
import { MODALIDADES } from "@/lib/treinamentos-defs";
import { Campo, inputCls } from "@/components/ui";

type TreinoOpt = { id: string; nome: string; nr: string | null; periodicidade_meses: number | null };
type EmpregadoOpt = { id: string; nome: string };

export default function FormTurma({
  empresaId,
  empresaNome,
  treinamentos,
  empregados,
}: {
  empresaId: string;
  empresaNome: string;
  treinamentos: TreinoOpt[];
  empregados: EmpregadoOpt[];
}) {
  const criar = criarTurma.bind(null, empresaId);
  const [state, action, pending] = useActionState<Estado, FormData>(criar, {});
  const [treinoId, setTreinoId] = useState(treinamentos[0]?.id ?? "");

  const treino = treinamentos.find((t) => t.id === treinoId);

  return (
    <div className="max-w-xl">
      <Link href="/treinamentos/turmas/nova" className="text-sm text-brand-ink">
        ← Trocar empresa
      </Link>
      <h1 className="text-xl font-bold mt-2 mb-1">Nova turma</h1>
      <p className="text-sm opacity-60 mb-4">{empresaNome}</p>

      {treinamentos.length === 0 ? (
        <p className="text-sm text-red-600">
          Nenhum treinamento no catálogo. Cadastre em Treinamentos → Catálogo primeiro.
        </p>
      ) : (
        <form action={action} className="bg-[var(--surface)] rounded-xl shadow p-5 grid gap-4">
          <Campo label="Treinamento *">
            <select
              name="treinamento_id"
              className={inputCls}
              value={treinoId}
              onChange={(e) => setTreinoId(e.target.value)}
            >
              {treinamentos.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome}
                  {t.nr ? ` (${t.nr})` : ""}
                </option>
              ))}
            </select>
          </Campo>

          <div className="grid sm:grid-cols-3 gap-4">
            <Campo label="Início *">
              <input type="date" name="data_inicio" className={inputCls} />
            </Campo>
            <Campo label="Conclusão">
              <input type="date" name="data_fim" className={inputCls} />
            </Campo>
            <Campo label="Periodicidade (meses)">
              {/* key força o defaultValue a atualizar quando troca o treinamento */}
              <input
                key={treinoId}
                type="number"
                name="periodicidade_meses"
                className={inputCls}
                min={1}
                defaultValue={treino?.periodicidade_meses ?? ""}
                placeholder="Sem reciclagem"
              />
            </Campo>
          </div>
          <p className="text-xs opacity-60 -mt-2">
            O vencimento do próximo é a conclusão + periodicidade. Em branco = sem
            reciclagem (não gera vencimento).
          </p>

          <div className="grid sm:grid-cols-3 gap-4">
            <Campo label="Modalidade">
              <select name="modalidade" className={inputCls} defaultValue="presencial">
                {MODALIDADES.map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo label="Carga horária (h)">
              <input type="number" name="carga_horaria_h" className={inputCls} min={0} step="0.5" />
            </Campo>
            <Campo label="Instrutor">
              <input name="instrutor" className={inputCls} placeholder="Nome" />
            </Campo>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wide opacity-60 mb-2">
              Alunos
            </div>
            {empregados.length === 0 ? (
              <p className="text-sm opacity-70">
                Essa empresa não tem empregados ativos cadastrados.
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto">
                {empregados.map((e) => (
                  <label
                    key={e.id}
                    className="flex items-center gap-2 text-sm border border-gray-200 rounded-lg px-3 py-2"
                  >
                    <input type="checkbox" name="alunos" value={e.id} /> {e.nome}
                  </label>
                ))}
              </div>
            )}
          </div>

          <Campo label="Observações">
            <input name="observacoes" className={inputCls} placeholder="Opcional" />
          </Campo>

          {state?.erro ? <p className="text-sm text-red-600">{state.erro}</p> : null}
          <div className="flex justify-end gap-2">
            <Link href="/treinamentos/turmas" className="px-4 py-2 rounded-lg border border-gray-300 text-sm">
              Cancelar
            </Link>
            <button
              disabled={pending}
              className="px-4 py-2 rounded-lg bg-brand text-white text-sm font-semibold disabled:opacity-60"
            >
              {pending ? "Salvando…" : "Registrar turma"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
