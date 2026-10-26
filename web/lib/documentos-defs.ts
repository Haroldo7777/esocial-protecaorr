// Definições de documentos/programas sem dependência de servidor
// (podem ser importadas por componentes cliente).

export const TIPOS_PROGRAMA: { id: string; label: string }[] = [
  { id: "pgr", label: "PGR" },
  { id: "pcmso", label: "PCMSO" },
  { id: "ltcat", label: "LTCAT" },
  { id: "lip", label: "LIP" },
  { id: "ppr", label: "PPR" },
  { id: "pca", label: "PCA" },
  { id: "aep", label: "AEP" },
  { id: "aet", label: "AET" },
  { id: "dir", label: "DIR" },
  { id: "ppp", label: "PPP" },
];

// vigência padrão em meses por tipo (ver docs/REGRAS_PERIODICIDADE.md)
export const VIGENCIA_PADRAO: Record<string, number> = {
  pcmso: 12, ltcat: 12, lip: 12, ppr: 12, pca: 12,
  pgr: 12, // PGR/PGRTR: variável 1 ou 2 anos (escolhido na emissão)
};

export const MODELOS_PGR: { id: string; label: string }[] = [
  { id: "nr01", label: "PGR (NR-01)" },
  { id: "nr18", label: "PGR (NR-18) — construção" },
  { id: "nr22", label: "PGR (NR-22) — mineração" },
  { id: "pgrtr31", label: "PGRTR (NR-31) — rural" },
];

export type Programa = {
  id: string;
  tipo: string;
  modelo: string | null;
  numero: string | null;
  vigencia_inicio: string | null;
  vigencia_fim: string | null;
  status: string;
  responsavel_tecnico: string | null;
  empresa: { razao_social: string; nome_fantasia: string | null } | null;
};
