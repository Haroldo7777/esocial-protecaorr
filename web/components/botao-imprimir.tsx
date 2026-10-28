"use client";

export function BotaoImprimir() {
  return (
    <button
      onClick={() => window.print()}
      className="no-print px-4 py-2 rounded-lg bg-brand text-white text-sm font-semibold"
    >
      Imprimir / Salvar PDF
    </button>
  );
}
