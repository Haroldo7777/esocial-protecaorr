// Constantes de domínio SST (taxonomias e listas usadas em formulários).

export const CATEGORIAS_RISCO = [
  "Físico",
  "Químico",
  "Biológico",
  "Ergonômico - Biomecânico",
  "Mecânico - Acidentes",
  "Outros agentes nocivos",
  "Ergonômicos - Mobiliário e Equipamentos",
  "Ergonômicos - Organizacionais",
  "Ergonômicos - Ambientais",
  "Ergonômicos - Psicossociais/Cognitivos",
  "Associação de agentes nocivos",
  "Ausência de agentes nocivos ou atividades especiais",
] as const;

export const CAMADAS_RISCO: { id: "esocial" | "consultoria" | "empresa"; label: string; readonly?: boolean }[] = [
  { id: "esocial", label: "eSocial (oficial)", readonly: true },
  { id: "consultoria", label: "Consultoria" },
  { id: "empresa", label: "Empresa" },
];
