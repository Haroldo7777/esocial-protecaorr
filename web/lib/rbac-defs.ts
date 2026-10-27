// Catálogo de módulos e ações do RBAC (sem dependência de servidor).
// `modulo` casa com a chave usada em app_tem_permissao(modulo, acao).

export type Acao = "ver" | "criar" | "editar" | "excluir";
export const ACOES: { id: Acao; label: string }[] = [
  { id: "ver", label: "Ver" },
  { id: "criar", label: "Criar" },
  { id: "editar", label: "Editar" },
  { id: "excluir", label: "Excluir" },
];

export const MODULOS: { id: string; label: string; grupo: string }[] = [
  { id: "empresas", label: "Empresas", grupo: "Cadastro" },
  { id: "estabelecimentos", label: "Estabelecimentos/Ambientes", grupo: "Cadastro" },
  { id: "funcoes", label: "Funções", grupo: "Cadastro" },
  { id: "ghe", label: "GHE", grupo: "Cadastro" },
  { id: "empregados", label: "Empregados", grupo: "Cadastro" },
  { id: "riscos", label: "Catálogo de Riscos", grupo: "SST" },
  { id: "medicina", label: "Medicina (exames/ASO)", grupo: "SST" },
  { id: "documentos", label: "Documentos/Programas", grupo: "SST" },
  { id: "treinamentos", label: "Treinamentos", grupo: "SST" },
  { id: "epi", label: "EPI", grupo: "SST" },
  { id: "vencimentos", label: "Vencimentos", grupo: "Gestão" },
  { id: "auditoria", label: "Auditoria", grupo: "Gestão" },
  { id: "usuarios", label: "Usuários", grupo: "Administração" },
  { id: "perfis", label: "Perfis de acesso", grupo: "Administração" },
  { id: "configuracoes", label: "Configurações", grupo: "Administração" },
  { id: "log", label: "Registro de atividades", grupo: "Administração" },
];

// módulos agrupados para a matriz do formulário
export function modulosPorGrupo() {
  const grupos = new Map<string, typeof MODULOS>();
  for (const m of MODULOS) {
    if (!grupos.has(m.grupo)) grupos.set(m.grupo, []);
    grupos.get(m.grupo)!.push(m);
  }
  return [...grupos.entries()];
}
