import Link from "next/link";
import IdentidadeForm from "./identidade-form";
import { getConsultoria } from "@/lib/data/consultoria";
import { AvisoBanco, Vazio } from "@/components/ui";

export const dynamic = "force-dynamic";

const ABAS = [
  { id: "identidade", label: "Identidade" },
  { id: "esocial", label: "eSocial" },
  { id: "assinaturas", label: "Assinaturas" },
  { id: "integracoes", label: "Integrações" },
];

function EmBreve({ titulo, itens }: { titulo: string; itens: string[] }) {
  return (
    <div className="bg-[var(--surface)] rounded-xl shadow p-5 max-w-xl">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="font-semibold">{titulo}</h2>
        <span className="text-[10px] uppercase tracking-wide bg-amber-100 text-amber-700 rounded px-1.5 py-0.5">
          no lançamento
        </span>
      </div>
      <ul className="text-sm opacity-70 list-disc pl-5 space-y-1">
        {itens.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </div>
  );
}

export default async function ConfiguracoesPage({
  searchParams,
}: {
  searchParams: Promise<{ aba?: string; ok?: string }>;
}) {
  const { aba, ok } = await searchParams;
  const ativa = ABAS.some((a) => a.id === aba) ? aba! : "identidade";
  const res = ativa === "identidade" ? await getConsultoria() : null;

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">Configurações</h1>
      <p className="text-sm opacity-70 mb-4">Identidade da consultoria e integrações.</p>

      <div className="flex gap-1 bg-[var(--surface)] border border-gray-200 rounded-xl p-1.5 mb-4 w-fit">
        {ABAS.map((a) => (
          <Link
            key={a.id}
            href={`/configuracoes?aba=${a.id}`}
            className={[
              "px-3 py-2 rounded-lg text-sm whitespace-nowrap",
              a.id === ativa ? "bg-brand text-white font-semibold" : "opacity-70 hover:bg-gray-100",
            ].join(" ")}
          >
            {a.label}
          </Link>
        ))}
      </div>

      {ativa === "identidade" ? (
        !res ? null : !res.ok ? (
          <AvisoBanco erro={res.erro} />
        ) : !res.dados ? (
          <Vazio texto="Consultoria ainda não cadastrada (criada no onboarding, no lançamento)." />
        ) : (
          <IdentidadeForm initial={res.dados} salvo={ok === "1"} />
        )
      ) : null}

      {ativa === "esocial" ? (
        <EmBreve
          titulo="eSocial"
          itens={[
            "Certificado digital A1 (upload e validade)",
            "Procurações eletrônicas por certificado",
            "Ambiente (produção / homologação) e transmissão dos eventos S-22xx",
          ]}
        />
      ) : null}

      {ativa === "assinaturas" ? (
        <EmBreve
          titulo="Assinaturas"
          itens={[
            "Canais: SMS, WhatsApp, e-mail, presencial",
            "Ordem de assinatura e perfil de evidência",
            "Modelos de documento para coleta de assinatura",
          ]}
        />
      ) : null}

      {ativa === "integracoes" ? (
        <EmBreve
          titulo="Integrações"
          itens={[
            "Asaas: chave de API, wallet ID, empresas a faturar",
            "Faturas separadas por tipo de serviço",
            "API de integração (ativação sob pedido)",
          ]}
        />
      ) : null}
    </div>
  );
}
