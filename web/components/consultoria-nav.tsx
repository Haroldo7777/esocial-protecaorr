"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITENS: { href: string; label: string; pronto?: boolean }[] = [
  { href: "/dashboard", label: "Dashboard", pronto: true },
  { href: "/empresas", label: "Empresas", pronto: true },
  { href: "/documentos", label: "Documentos", pronto: true },
  { href: "/treinamentos", label: "Treinamentos" },
  { href: "/medicina", label: "Medicina", pronto: true },
  { href: "/vencimentos", label: "Gestão de Vencimentos" },
  { href: "/riscos", label: "Catálogo de Riscos", pronto: true },
  { href: "/usuarios", label: "Usuários" },
  { href: "/permissoes", label: "Permissões" },
  { href: "/configuracoes", label: "Configurações" },
];

export function ConsultoriaNav() {
  const path = usePathname();
  return (
    <nav className="flex flex-col gap-0.5 p-2">
      {ITENS.map((i) => {
        const ativo = path === i.href || path.startsWith(i.href + "/");
        return (
          <Link
            key={i.href}
            href={i.pronto ? i.href : "#"}
            aria-disabled={!i.pronto}
            className={[
              "px-3 py-2 rounded-lg text-sm flex items-center justify-between",
              ativo
                ? "bg-white/15 text-white font-semibold"
                : "text-emerald-100/80 hover:bg-white/10",
              !i.pronto ? "opacity-45 cursor-default" : "",
            ].join(" ")}
          >
            {i.label}
            {!i.pronto ? (
              <span className="text-[10px] uppercase tracking-wide opacity-70">
                em breve
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
