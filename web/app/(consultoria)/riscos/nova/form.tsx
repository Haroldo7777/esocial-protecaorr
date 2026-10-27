"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Campo, inputCls } from "@/components/ui";
import { CATEGORIAS_RISCO } from "@/lib/sst";

export type Estado = { erro?: string };
type AcaoRisco = (prev: Estado, fd: FormData) => Promise<Estado>;
type Opt = { id: string; nome: string };

export type RiscoInicial = {
  nome: string;
  codigo_tabela24: string | null;
  categoria: string;
  qualitativo: boolean;
  observacoes: string | null;
  medidas_recomendadas: string[];
  exames: string[];
  treinamentos: string[];
  epis: string[];
  intensidade: string | null;
  limite_tolerancia: string | null;
  metodo_medicao: string | null;
  tipo_exposicao: string | null;
  aposentadoria_especial: boolean;
  doc_lip: boolean;
  doc_ltcat: boolean;
  doc_pgr: boolean;
  doc_pcmso: boolean;
  doc_aep: boolean;
};

const PASSOS = ["Informações Iniciais", "Medidas de Controle", "Treinamentos e Exames", "Interpretação e Detalhes"];
const DOCS: [keyof RiscoInicial, string][] = [
  ["doc_lip", "LIP"],
  ["doc_ltcat", "LTCAT"],
  ["doc_pgr", "PGR"],
  ["doc_pcmso", "PCMSO"],
  ["doc_aep", "AEP"],
];

function Checklist({
  campo,
  itens,
  vazio,
  selecionados,
}: {
  campo: string;
  itens: Opt[];
  vazio: string;
  selecionados: Set<string>;
}) {
  if (itens.length === 0) return <p className="text-sm opacity-60">{vazio}</p>;
  return (
    <div className="grid gap-1.5 max-h-56 overflow-y-auto">
      {itens.map((i) => (
        <label
          key={i.id}
          className="flex items-center gap-2 text-sm border border-gray-200 rounded-lg px-3 py-2"
        >
          <input type="checkbox" name={campo} value={i.id} defaultChecked={selecionados.has(i.id)} />{" "}
          {i.nome}
        </label>
      ))}
    </div>
  );
}

export function FormRisco({
  agentes,
  exames,
  treinamentos,
  epis,
  action,
  initial,
  submitLabel = "Cadastrar risco",
}: {
  agentes: { id: string; nome: string; codigo_tabela24: string | null }[];
  exames: Opt[];
  treinamentos: Opt[];
  epis: Opt[];
  action: AcaoRisco;
  initial?: RiscoInicial;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState<Estado, FormData>(action, {});
  const [passo, setPasso] = useState(0);

  const selExames = new Set(initial?.exames ?? []);
  const selTreinos = new Set(initial?.treinamentos ?? []);
  const selEpis = new Set(initial?.epis ?? []);

  return (
    <form action={formAction} className="max-w-3xl">
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
            <input name="nome" className={inputCls} defaultValue={initial?.nome ?? ""} />
          </Campo>
          <Campo label="Risco relacionado ao eSocial (Tabela 24 — código)">
            <input
              name="codigo_tabela24"
              list="agentes24"
              className={inputCls}
              placeholder="ex.: 01.18.001"
              defaultValue={initial?.codigo_tabela24 ?? ""}
            />
            <datalist id="agentes24">
              {agentes.map((a) => (
                <option key={a.id} value={a.codigo_tabela24 ?? ""}>
                  {a.nome}
                </option>
              ))}
            </datalist>
          </Campo>
          <Campo label="Categoria *">
            <select name="categoria" className={inputCls} defaultValue={initial?.categoria ?? ""}>
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
                <input type="radio" name="qualitativo" value="sim" defaultChecked={initial?.qualitativo ?? true} /> Sim
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="qualitativo" value="nao" defaultChecked={initial ? !initial.qualitativo : false} /> Não
              </label>
            </div>
          </Campo>
          <Campo label="Observações">
            <textarea name="observacoes" rows={2} className={inputCls} defaultValue={initial?.observacoes ?? ""} />
          </Campo>
        </div>

        <div className={passo === 1 ? "grid gap-4" : "hidden"}>
          <Campo label="Medidas de controle recomendadas (EPC/EPI/administrativas) — uma por linha">
            <textarea
              name="medidas_recomendadas"
              rows={5}
              className={inputCls}
              defaultValue={(initial?.medidas_recomendadas ?? []).join("\n")}
            />
          </Campo>
        </div>

        <div className={passo === 2 ? "grid gap-4" : "hidden"}>
          <p className="text-xs opacity-60">
            Selecione no catálogo os itens exigidos por este risco. A auditoria cruza
            exatamente esses itens com o que foi prescrito/entregue a cada empregado
            exposto.
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            <Campo label="Exames exigidos">
              <Checklist campo="exames" itens={exames} selecionados={selExames} vazio="Sem tipos de exame no catálogo (Medicina)." />
            </Campo>
            <Campo label="Treinamentos exigidos">
              <Checklist campo="treinamentos" itens={treinamentos} selecionados={selTreinos} vazio="Sem treinamentos no catálogo." />
            </Campo>
            <Campo label="EPIs exigidos">
              <Checklist campo="epis" itens={epis} selecionados={selEpis} vazio="Sem EPIs no catálogo." />
            </Campo>
          </div>
        </div>

        <div className={passo === 3 ? "grid sm:grid-cols-2 gap-4" : "hidden"}>
          <Campo label="Intensidade / concentração">
            <input name="intensidade" className={inputCls} defaultValue={initial?.intensidade ?? ""} />
          </Campo>
          <Campo label="Limite de tolerância">
            <input name="limite_tolerancia" className={inputCls} defaultValue={initial?.limite_tolerancia ?? ""} />
          </Campo>
          <Campo label="Método / equipamento de medição">
            <input name="metodo_medicao" className={inputCls} defaultValue={initial?.metodo_medicao ?? ""} />
          </Campo>
          <Campo label="Tipo de exposição">
            <input name="tipo_exposicao" className={inputCls} defaultValue={initial?.tipo_exposicao ?? ""} />
          </Campo>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="aposentadoria_especial" defaultChecked={initial?.aposentadoria_especial ?? false} /> Enseja aposentadoria especial
          </label>
          <div className="sm:col-span-2">
            <div className="text-xs font-semibold uppercase tracking-wide opacity-60 mb-2">
              Aparece nos documentos
            </div>
            <div className="flex gap-4 flex-wrap text-sm">
              {DOCS.map(([n, l]) => (
                <label key={n} className="flex items-center gap-2">
                  <input type="checkbox" name={n} defaultChecked={initial ? Boolean(initial[n]) : false} /> {l}
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
            {pending ? "Salvando…" : submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
