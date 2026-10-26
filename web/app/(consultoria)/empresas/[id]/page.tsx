import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function EmpresaPortalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let nome = "Empresa";
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("empresa")
      .select("razao_social,nome_fantasia")
      .eq("id", id)
      .single();
    if (data) nome = data.nome_fantasia || data.razao_social;
  } catch {
    // banco ainda não conectado
  }

  const abas = [
    "Ambientes e Estabelecimentos",
    "GHE / Grupos de Trabalho",
    "Funções",
    "Empregados",
  ];

  return (
    <div>
      <Link href="/empresas" className="text-sm text-brand-ink">
        ← Voltar ao painel da consultoria
      </Link>
      <h1 className="text-xl font-bold mt-2 mb-4">{nome} — portal da empresa</h1>

      <div className="bg-[var(--surface)] rounded-xl shadow p-5">
        <div className="flex gap-2 flex-wrap border-b pb-3 mb-3">
          {abas.map((a, i) => (
            <span
              key={a}
              className={[
                "text-sm px-3 py-1.5 rounded-lg",
                i === 0 ? "bg-brand text-white" : "opacity-60",
              ].join(" ")}
            >
              {a}
            </span>
          ))}
        </div>
        <p className="text-sm opacity-70">
          O contexto da empresa (Ambientes, GHE com o wizard de 5 etapas,
          Funções e Empregados) é o próximo bloco da Fase 1.
        </p>
      </div>
    </div>
  );
}
