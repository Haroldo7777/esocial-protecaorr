"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function EpiTabs() {
  const path = usePathname();
  const abas = [
    { href: "/epi", label: "Catálogo" },
    { href: "/epi/entregas", label: "Entregas" },
  ];
  return (
    <div className="flex gap-1 bg-[var(--surface)] border border-gray-200 rounded-xl p-1.5 mb-4 w-fit">
      {abas.map((a) => {
        const ativo = a.href === "/epi" ? path === "/epi" : path.startsWith(a.href);
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
