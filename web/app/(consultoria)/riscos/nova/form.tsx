"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { criarRisco, type Estado } from "./actions";
import { Campo, inputCls } from "@/components/ui";
import { CATEGORIAS_RISCO } from "@/lib/sst";

const PASSOS = ["Informações Iniciais", "Medidas de Controle", "Treinamentos e Exames", "Interpretação e Detalhes"];
const DOCS: [string, string][] = [
  ["doc_lip", "LIP"],
  ["doc_ltcat", "LTCAT"],
  ["doc_pgr", "PGR"],
  ["doc_pcmso", "PCMSO"],
  ["doc_aep", "AEP"],
];

export function FormRisco({
  agentes,
}: {
  agentes: { id: string; nome: string; codigo_tabela24: string | null }[];
}) {
  const [state, action, pending] = useActionState<Estado, FormData>(criarRisco, {});
  const [passo, setPasso] = useState(0);

  return (
    <form action={action} className="max-w-3xl">
      <div className="flex gap-2 flex-wrap mb-5">
        {PASSOS.map((p, i) => (
          <button
            type="button"
            key={p}
            onClick={() => setPasso(i)}
            className={[
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border",
              i === passo ? "border-brand bg-brand-light text-brand-ink" : "border-gray-200 opacity-70",
            ].join(" ")}
          >
            <span className={["w-5 h-5 rounded-full grid place-items-center font-bold", i === passo ? "bg-brand text-white" : "bg-gray-200"].join(" ")}>
              {i + 1}
            </span>
            {p}
          </button>
        ))}
      </div>

      <div className="bg-[var(--surface)] rounded-xl shadow p-5 grid gap-4">
        {/* mantém todos os campos no DOM (display:none) para irem no FormData */}
        <div className={passo === 0 ? "grid gap-4" : "hidden"}>
          <Campo label="Nome do risco *">
            <input name="nome" className={inputCls} />
          </Campo>
          <Campo label="Risco relacionado ao eSocial (Tabela 24 — código)">
            <input name="codigo_tabela24" list="agentes24" className={inputCls} placeholder="ex.: 01.18.001" />
            <datalist id="agentes24">
              {agentes.map((a) => (
                <option key={a.id} value={a.codigo_tabela24 ?? ""}>
                  {a.nome}
                </option>
              ))}
            </datalist>
          </Campo>
          <Campo label="Categoria *">
            <select name="categoria" className={inputCls} defaultValue="">
              <option value="" disabled>
                Selecione…
              </option>
              {CATEGORIAS_RISCO.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Campo>
          <Campo label="Risco qualitativo?">
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input type="radio" name="qualitativo" value="sim" defaultChecked /> Sim
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="qualitativo" value="nao" /> Não
              </label>
            </div>
          </Campo>
          <Campo label="Observações">
            <textarea name="observacoes" rows={2} className={inputCls} />
          </Campo>
        </div>

        <div className={passo === 1 ? "grid gap-4" : "hidden"}>
          <Campo label="Medidas de controle recomendadas (EPC/EPI/administrativas) — uma por linha">
            <textarea name="medidas_recomendadas" rows={5} className={inputCls} />
          </Campo>
        </div>

        <div className={passo === 2 ? "grid sm:grid-cols-2 gap-4" : "hidden"}>
          <Campo label="Treinamentos exigidos — um por linha">
            <textarea name="treinamentos" rows={5} className={inputCls} />
          </Campo>
          <Campo label="Exames exigidos — um por linha">
            <textarea name="exames" rows={5} className={inputCls} />
          </Campo>
          <div className="sm:col-span-2">
            <Campo label="EPIs exigidos — um por linha">
              <textarea name="epis" rows={4} className={inputCls} placeholder="Protetor auricular&#10;Luva de segurança" />
            </Campo>
            <p className="text-xs opacity-60 mt-1">
              Use o mesmo nome do catálogo de EPI para a auditoria cruzar a entrega.
            </p>
          </div>
        </div>

        <div className={passo === 3 ? "grid sm:grid-cols-2 gap-4" : "hidden"}>
          <Campo label="Intensidade / concentração">
            <input name="intensidade" className={inputCls} />
          </Campo>
          <Campo label="Limite de tolerância">
            <input name="limite_tolerancia" className={inputCls} />
          </Campo>
          <Campo label="Método / equipamento de medição">
            <input name="metodo_medicao" className={inputCls} />
          </Campo>
          <Campo label="Tipo de exposição">
            <input name="tipo_exposicao" className={inputCls} />
          </Campo>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="aposentadoria_especial" /> Enseja aposentadoria especial
          </label>
          <div className="sm:col-span-2">
            <div className="text-xs font-semibold uppercase tracking-wide opacity-60 mb-2">
              Aparece nos documentos
            </div>
            <div className="flex gap-4 flex-wrap text-sm">
              {DOCS.map(([n, l]) => (
                <label key={n} className="flex items-center gap-2">
                  <input type="checkbox" name={n} /> {l}
                </label>
              ))}
            </div>
          </div>
        </div>

        {state?.erro ? <p className="text-sm text-red-600">{state.erro}</p> : null}

        <div className="flex items-center gap-2 mt-2">
          <button type="button" disabled={passo === 0} onClick={() => setPasso((p) => p - 1)} className="px-4 py-2 rounded-lg border border-gray-300 text-sm disabled:opacity-40">
            ‹ Anterior
          </button>
          {passo < 3 ? (
            <button type="button" onClick={() => setPasso((p) => p + 1)} className="px-4 py-2 rounded-lg border border-gray-300 text-sm">
              Próximo ›
            </button>
          ) : null}
          <Link href="/riscos?camada=consultoria" className="ml-auto px-4 py-2 rounded-lg border border-gray-300 text-sm">
            Cancelar
          </Link>
          <button type="submit" disabled={pending} className="px-5 py-2 rounded-lg bg-brand text-white text-sm font-semibold disabled:opacity-60">
            {pending ? "Salvando…" : "Cadastrar risco"}
          </button>
        </div>
      </div>
    </form>
  );
}
