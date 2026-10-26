"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { criarPrograma, type Estado } from "./actions";
import { TIPOS_PROGRAMA, MODELOS_PGR } from "@/lib/documentos-defs";
import { Campo, inputCls } from "@/components/ui";

type EmpresaOpt = { id: string; razao_social: string; nome_fantasia: string | null };

export default function FormPrograma({ empresas }: { empresas: EmpresaOpt[] }) {
  const [state, action, pending] = useActionState<Estado, FormData>(criarPrograma, {});
  const [tipo, setTipo] = useState("pcmso");
  const ehPgr = tipo === "pgr";

  return (
    <div className="max-w-xl">
      <Link href="/documentos" className="text-sm text-brand-ink">
        ← Voltar
      </Link>
      <h1 className="text-xl font-bold mt-2 mb-4">Novo documento / programa</h1>

      {empresas.length === 0 ? (
        <p className="text-sm text-red-600">
          Cadastre uma empresa antes de emitir um documento.
        </p>
      ) : (
        <form action={action} className="bg-[var(--surface)] rounded-xl shadow p-5 grid gap-4">
          <Campo label="Empresa *">
            <select name="empresa_id" className={inputCls} defaultValue="">
              <option value="" disabled>
                Selecione…
              </option>
              {empresas.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nome_fantasia || e.razao_social}
                </option>
              ))}
            </select>
          </Campo>

          <Campo label="Tipo de documento *">
            <select
              name="tipo"
              className={inputCls}
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
            >
              {TIPOS_PROGRAMA.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </Campo>

          {ehPgr ? (
            <div className="grid sm:grid-cols-2 gap-4">
              <Campo label="Modelo do PGR">
                <select name="modelo" className={inputCls} defaultValue="nr01">
                  {MODELOS_PGR.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </Campo>
              <Campo label="Vigência">
                <select name="vigencia_meses" className={inputCls} defaultValue="12">
                  <option value="12">1 ano</option>
                  <option value="24">2 anos</option>
                </select>
              </Campo>
            </div>
          ) : (
            <p className="text-xs opacity-60 -mt-1">
              Vigência padrão de 1 ano (definida na emissão). Só PGR/PGRTR variam entre 1
              e 2 anos.
            </p>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <Campo label="Número / identificação">
              <input name="numero" className={inputCls} placeholder="Opcional" />
            </Campo>
            <Campo label="Início da vigência *">
              <input type="date" name="vigencia_inicio" className={inputCls} />
            </Campo>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Campo label="Responsável técnico">
              <input name="responsavel_tecnico" className={inputCls} placeholder="Nome" />
            </Campo>
            <Campo label="Registro (CREA/CRM)">
              <input name="registro_rt" className={inputCls} placeholder="Opcional" />
            </Campo>
          </div>

          <Campo label="Descrição / observações">
            <textarea name="descricao" className={inputCls} rows={2} />
          </Campo>

          {state?.erro ? <p className="text-sm text-red-600">{state.erro}</p> : null}
          <div className="flex justify-end gap-2">
            <Link
              href="/documentos"
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm"
            >
              Cancelar
            </Link>
            <button
              disabled={pending}
              className="px-4 py-2 rounded-lg bg-brand text-white text-sm font-semibold disabled:opacity-60"
            >
              {pending ? "Salvando…" : "Emitir documento"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
