import Link from "next/link";

export function CabecalhoLista({
  titulo,
  hrefNovo,
  rotuloNovo,
  hrefExport,
}: {
  titulo: string;
  hrefNovo: string;
  rotuloNovo: string;
  hrefExport?: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <h2 className="text-lg font-bold">{titulo}</h2>
      {hrefExport ? (
        <a
          href={hrefExport}
          className="ml-auto px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50"
        >
          Exportar CSV
        </a>
      ) : null}
      <Link
        href={hrefNovo}
        className={[
          "px-4 py-2 rounded-lg bg-brand text-white text-sm font-semibold",
          hrefExport ? "" : "ml-auto",
        ].join(" ")}
      >
        {rotuloNovo}
      </Link>
    </div>
  );
}

export function AvisoBanco({ erro }: { erro: string }) {
  return (
    <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 text-sm">
      Banco de dados ainda não conectado (o projeto Supabase entra no lançamento).
      Esta tela funciona assim que o <code>.env.local</code> estiver preenchido.
      <div className="opacity-60 mt-1 text-xs">Detalhe: {erro}</div>
    </div>
  );
}

export function Vazio({ texto }: { texto: string }) {
  return (
    <div className="bg-[var(--surface)] rounded-xl shadow p-8 text-center text-sm opacity-70">
      {texto}
    </div>
  );
}

export function Campo({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wide opacity-60 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

export const inputCls =
  "w-full px-3 py-2 rounded-lg border border-gray-300 bg-transparent";
