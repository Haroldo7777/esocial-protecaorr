"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function EmpresaTabs({ empresaId }: { empresaId: string }) {
  const path = usePathname();
  const base = `/empresas/${empresaId}`;
  const abas = [
    { href: base, label: "Dashboard" },
    { href: `${base}/estabelecimentos`, label: "Ambientes e Estabelecimentos" },
    { href: `${base}/funcoes`, label: "Funções" },
    { href: `${base}/ghe`, label: "GHE" },
    { href: `${base}/empregados`, label: "Empregados" },
  ];
  return (
    <div className="flex gap-1 overflow-x-auto bg-[var(--surface)] border border-gray-200 rounded-xl p-1.5 mb-4">
      {abas.map((a) => {
        const ativo =
          a.href === base ? path === base : path.startsWith(a.href);
        return (
          <Link
            key={a.href}
            href={a.href}
            className={[
              "px-3 py-2 rounded-lg text-sm whitespace-nowrap",
              ativo ? "bg-brand text-white font-semibold" : "opacity-70 hover:bg-gray-100",
            ].join(" ")}
          >
            {a.label}
          </Link>
        );
      })}
    </div>
  );
}
