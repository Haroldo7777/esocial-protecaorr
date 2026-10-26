"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { aplicarGhe, type AplicarPayload } from "./actions";
import { Campo, inputCls } from "@/components/ui";
import type { GheCompleto, Ambiente, Funcao, RiscoCat } from "@/lib/data/empresa-ctx";

type Disp = {
  ambientes: Ambiente[];
  funcoes: Funcao[];
  empregados: { id: string; nome: string }[];
  riscos: RiscoCat[];
};

const ETAPAS = ["Dados e Ambientes", "Empregados e Funções", "Atividades", "Riscos", "Medidas de Controle"];
const TIPOS_MEDIDA: { tipo: "epi" | "exame" | "treinamento"; titulo: string }[] = [
  { tipo: "epi", titulo: "EPIs" },
  { tipo: "exame", titulo: "Exames" },
  { tipo: "treinamento", titulo: "Treinamentos" },
];

export function GheWizard({
  empresaId,
  gheId,
  referencia,
  initial,
  disp,
}: {
  empresaId: string;
  gheId: string;
  referencia: string;
  initial: GheCompleto;
  disp: Disp;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState("");
  const [step, setStep] = useState(0);

  const g = initial.ghe;
  const atv = (g?.atividades ?? {}) as {
    insalubridade_grau?: string;
    periculosas?: string[];
    insalubres?: string[];
  };

  // ---- estado ----
  const [dados, setDados] = useState({
    numero: g?.numero ?? 1,
    processo: g?.processo ?? "",
    jornada: g?.jornada ?? "",
    obs_geral: g?.obs_geral ?? "",
    obs_pgr: g?.obs_pgr ?? "",
    obs_ltcat: g?.obs_ltcat ?? "",
    obs_pcmso: g?.obs_pcmso ?? "",
  });
  const [ambientes, setAmbientes] = useState<string[]>(initial.ambienteIds);
  const [funcoes, setFuncoes] = useState<string[]>(initial.funcaoIds);
  const [emps, setEmps] = useState<Record<string, { inicio: string; fim: string }>>(
    Object.fromEntries(
      initial.empregados.map((e) => [e.empregado_id, { inicio: e.inicio ?? "", fim: e.fim ?? "" }]),
    ),
  );
  const [grau, setGrau] = useState(atv.insalubridade_grau ?? "");
  const [periculosas, setPericulosas] = useState((atv.periculosas ?? []).join("\n"));
  const [insalubres, setInsalubres] = useState((atv.insalubres ?? []).join("\n"));
  const [riscos, setRiscos] = useState<string[]>(initial.riscoIds);
  const [medidas, setMedidas] = useState(
    initial.medidas.map((m) => ({ tipo: m.tipo, descricao: m.descricao, periodicidade_meses: m.periodicidade_meses })),
  );

  const toggle = (arr: string[], set: (v: string[]) => void, id: string) =>
    set(arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);

  function aplicar() {
    setErro("");
    const payload: AplicarPayload = {
      dados,
      atividades: {
        insalubridade_grau: grau,
        periculosas: periculosas.split("\n").map((s) => s.trim()).filter(Boolean),
        insalubres: insalubres.split("\n").map((s) => s.trim()).filter(Boolean),
      },
      ambienteIds: ambientes,
      funcaoIds: funcoes,
      empregados: Object.entries(emps).map(([empregado_id, v]) => ({
        empregado_id,
        inicio: v.inicio || null,
        fim: v.fim || null,
      })),
      riscoIds: riscos,
      medidas: medidas.filter((m) => m.descricao.trim()),
    };
    startTransition(async () => {
      const r = await aplicarGhe(gheId, empresaId, payload);
      if (r?.erro) setErro(r.erro);
      else router.push(`/empresas/${empresaId}/ghe`);
    });
  }

  return (
    <div>
      <Link href={`/empresas/${empresaId}/ghe`} className="text-sm text-brand-ink">
        ← Voltar para GHE
      </Link>
      <h2 className="text-lg font-bold mt-2 mb-1">GHE — {referencia}</h2>
      <p className="text-sm opacity-70 mb-4">
        Riscos e medidas são definidos aqui, no GHE. O empregado herda deste
        grupo seus fatores de risco e exigências. Clique em <b>Aplicar GHE</b> ao final.
      </p>

      {/* stepper */}
      <div className="flex gap-2 flex-wrap mb-5">
        {ETAPAS.map((e, i) => (
          <button
            key={e}
            onClick={() => setStep(i)}
            className={[
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border",
              i === step ? "border-brand bg-brand-light text-brand-ink" : "border-gray-200 opacity-70",
            ].join(" ")}
          >
            <span className={["w-5 h-5 rounded-full grid place-items-center font-bold", i === step ? "bg-brand text-white" : "bg-gray-200"].join(" ")}>
              {i + 1}
            </span>
            {e}
          </button>
        ))}
      </div>

      <div className="bg-[var(--surface)] rounded-xl shadow p-5">
        {/* ETAPA 1 */}
        {step === 0 && (
          <div className="grid sm:grid-cols-2 gap-4">
            <Campo label="Número"><input type="number" className={inputCls} value={dados.numero} onChange={(e) => setDados({ ...dados, numero: Number(e.target.value) })} /></Campo>
            <Campo label="Jornada de trabalho"><input className={inputCls} value={dados.jornada} onChange={(e) => setDados({ ...dados, jornada: e.target.value })} /></Campo>
            <div className="sm:col-span-2"><Campo label="Processo"><textarea rows={2} className={inputCls} value={dados.processo} onChange={(e) => setDados({ ...dados, processo: e.target.value })} /></Campo></div>
            <Campo label="Obs. PGR"><input className={inputCls} value={dados.obs_pgr} onChange={(e) => setDados({ ...dados, obs_pgr: e.target.value })} /></Campo>
            <Campo label="Obs. LTCAT"><input className={inputCls} value={dados.obs_ltcat} onChange={(e) => setDados({ ...dados, obs_ltcat: e.target.value })} /></Campo>
            <Campo label="Obs. PCMSO"><input className={inputCls} value={dados.obs_pcmso} onChange={(e) => setDados({ ...dados, obs_pcmso: e.target.value })} /></Campo>
            <div className="sm:col-span-2">
              <div className="text-xs font-bold uppercase tracking-wide text-brand-ink border-b pb-1 mb-2">Ambientes vinculados</div>
              <ListaCheck itens={disp.ambientes.map((a) => ({ id: a.id, label: a.nome }))} sel={ambientes} onToggle={(id) => toggle(ambientes, setAmbientes, id)} vazio="Nenhum ambiente cadastrado. Cadastre em Ambientes e Estabelecimentos." />
            </div>
          </div>
        )}

        {/* ETAPA 2 */}
        {step === 1 && (
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-brand-ink border-b pb-1 mb-2">Funções vinculadas</div>
              <ListaCheck itens={disp.funcoes.map((f) => ({ id: f.id, label: f.nome + (f.cbo ? ` · CBO ${f.cbo}` : "") }))} sel={funcoes} onToggle={(id) => toggle(funcoes, setFuncoes, id)} vazio="Nenhuma função cadastrada." />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-brand-ink border-b pb-1 mb-2">Empregados vinculados (com período)</div>
              {disp.empregados.length === 0 ? (
                <p className="text-sm opacity-60">Nenhum empregado cadastrado.</p>
              ) : (
                <div className="space-y-2">
                  {disp.empregados.map((em) => {
                    const on = em.id in emps;
                    return (
                      <div key={em.id} className="border border-gray-200 rounded-lg p-2">
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={on} onChange={() => setEmps((prev) => { const n = { ...prev }; if (on) delete n[em.id]; else n[em.id] = { inicio: "", fim: "" }; return n; })} />
                          {em.nome}
                        </label>
                        {on && (
                          <div className="flex gap-2 mt-2">
                            <input type="date" className={inputCls} value={emps[em.id].inicio} onChange={(e) => setEmps((p) => ({ ...p, [em.id]: { ...p[em.id], inicio: e.target.value } }))} />
                            <input type="date" className={inputCls} value={emps[em.id].fim} onChange={(e) => setEmps((p) => ({ ...p, [em.id]: { ...p[em.id], fim: e.target.value } }))} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ETAPA 3 */}
        {step === 2 && (
          <div className="grid gap-4">
            <Campo label="Percentual de insalubridade equivalente (grau NR-15)">
              <select className={inputCls} value={grau} onChange={(e) => setGrau(e.target.value)}>
                <option value="">Não insalubre</option>
                <option value="10">Mínimo (10%)</option>
                <option value="20">Médio (20%)</option>
                <option value="40">Máximo (40%)</option>
              </select>
            </Campo>
            <Campo label="Atividades Periculosas (NR-16) — uma por linha">
              <textarea rows={3} className={inputCls} value={periculosas} onChange={(e) => setPericulosas(e.target.value)} />
            </Campo>
            <Campo label="Atividades Insalubres (NR-15) — uma por linha">
              <textarea rows={3} className={inputCls} value={insalubres} onChange={(e) => setInsalubres(e.target.value)} />
            </Campo>
          </div>
        )}

        {/* ETAPA 4 */}
        {step === 3 && (
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-brand-ink border-b pb-1 mb-2">Riscos do grupo (catálogo + Tabela 24)</div>
            <ListaCheck
              itens={disp.riscos.map((r) => ({ id: r.id, label: `${r.nome} · ${r.categoria}${r.codigo_tabela24 ? ` · T24 ${r.codigo_tabela24}` : ""}` }))}
              sel={riscos}
              onToggle={(id) => toggle(riscos, setRiscos, id)}
              vazio="Nenhum risco no catálogo ainda. O Catálogo de Riscos (3 camadas) é o próximo módulo — lá os riscos são cadastrados e aqui aparecem para seleção."
            />
          </div>
        )}

        {/* ETAPA 5 */}
        {step === 4 && (
          <div className="grid sm:grid-cols-3 gap-4">
            {TIPOS_MEDIDA.map(({ tipo, titulo }) => (
              <ColunaMedida key={tipo} titulo={titulo} tipo={tipo} medidas={medidas} setMedidas={setMedidas} />
            ))}
          </div>
        )}

        {erro ? <p className="text-sm text-red-600 mt-4">{erro}</p> : null}

        <div className="flex items-center gap-2 mt-6">
          <button disabled={step === 0} onClick={() => setStep((s) => s - 1)} className="px-4 py-2 rounded-lg border border-gray-300 text-sm disabled:opacity-40">
            ‹ Anterior
          </button>
          {step < 4 ? (
            <button onClick={() => setStep((s) => s + 1)} className="px-4 py-2 rounded-lg border border-gray-300 text-sm">
              Próxima ›
            </button>
          ) : null}
          <button onClick={aplicar} disabled={pending} className="ml-auto px-5 py-2 rounded-lg bg-brand text-white text-sm font-semibold disabled:opacity-60">
            {pending ? "Aplicando…" : "Aplicar GHE"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ListaCheck({
  itens,
  sel,
  onToggle,
  vazio,
}: {
  itens: { id: string; label: string }[];
  sel: string[];
  onToggle: (id: string) => void;
  vazio: string;
}) {
  if (itens.length === 0) return <p className="text-sm opacity-60">{vazio}</p>;
  return (
    <div className="grid sm:grid-cols-2 gap-1.5">
      {itens.map((i) => (
        <label key={i.id} className="flex items-center gap-2 text-sm border border-gray-200 rounded-lg px-3 py-2">
          <input type="checkbox" checked={sel.includes(i.id)} onChange={() => onToggle(i.id)} />
          {i.label}
        </label>
      ))}
    </div>
  );
}

function ColunaMedida({
  titulo,
  tipo,
  medidas,
  setMedidas,
}: {
  titulo: string;
  tipo: "epi" | "exame" | "treinamento";
  medidas: { tipo: string; descricao: string; periodicidade_meses: number | null }[];
  setMedidas: (v: { tipo: string; descricao: string; periodicidade_meses: number | null }[]) => void;
}) {
  const [novo, setNovo] = useState("");
  const [per, setPer] = useState("");
  const daqui = medidas.filter((m) => m.tipo === tipo);
  return (
    <div className="border border-gray-200 rounded-lg p-3">
      <h4 className="text-sm font-semibold mb-2">{titulo}</h4>
      <div className="space-y-1 mb-2">
        {daqui.length === 0 ? <p className="text-xs opacity-50">—</p> : null}
        {daqui.map((m, i) => (
          <div key={i} className="flex items-center gap-2 text-xs bg-gray-50 rounded px-2 py-1">
            <span className="flex-1">{m.descricao}{m.periodicidade_meses ? ` · ${m.periodicidade_meses}m` : ""}</span>
            <button onClick={() => setMedidas(medidas.filter((x) => x !== m))} className="text-red-600">×</button>
          </div>
        ))}
      </div>
      <input className={inputCls + " text-sm mb-1"} placeholder="descrição" value={novo} onChange={(e) => setNovo(e.target.value)} />
      <div className="flex gap-1">
        <input className={inputCls + " text-sm"} placeholder="meses" inputMode="numeric" value={per} onChange={(e) => setPer(e.target.value.replace(/\D/g, ""))} />
        <button
          onClick={() => {
            if (!novo.trim()) return;
            setMedidas([...medidas, { tipo, descricao: novo.trim(), periodicidade_meses: per ? Number(per) : null }]);
            setNovo(""); setPer("");
          }}
          className="px-3 rounded-lg bg-brand text-white text-sm"
        >
          +
        </button>
      </div>
    </div>
  );
}
