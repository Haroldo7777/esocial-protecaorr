import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Auditor eSocial — Proteção RR",
  description: "Plataforma de gestão e auditoria de SST e eSocial",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
