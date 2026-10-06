# Plano de Construção — Auditor eSocial (esocial.protecaorr.net)

Guia que seguimos **módulo por módulo**. A cada rodada: construímos um item,
publicamos (Render atualiza sozinho a cada push na `main`), o Haroldo testa no
`esocial.protecaorr.net` e pede ajustes. Marcamos com ✅ o que ficou pronto.

Regras permanentes: design próprio (verde Proteção RR), dados de demonstração
até o banco entrar, nunca dados pessoais reais em protótipo (LGPD), campos e
validações conforme os leiautes oficiais do eSocial S-1.3.

---

## Etapa A — Protótipo navegável (sem banco)

Objetivo: ver e ajustar todas as telas antes de investir no banco de dados.

- [x] **A1. Estrutura** — menu lateral com os 15 módulos, topo, celular, claro/escuro
- [x] **A2. Dashboard** — 4 indicadores, gráfico 12 meses, vencimentos, eventos S-22xx
- [x] **A3. Empresas** — lista com busca/filtros/paginação, nova empresa com
      validação de CNPJ (dígito verificador), exportar CSV, "Acessar" com abas
- [ ] **A4. Gestão de Vencimentos** — painel de prazos: filtros por tipo
      (EPI/exame/treinamento), status, responsável, horizonte de dias; visão lista e colunas
- [ ] **A5. Auditoria eSocial** — telas dos eventos S-2210/2220/2221/2240 com os 5
      status, fila de correção por empresa com responsável (nosso diferencial)
- [ ] **A6. Medicina** — ASO e agendamentos, tipos de exames
- [ ] **A7. Treinamentos** — treinamentos por NR, turmas e alunos
- [ ] **A8. Documentos** — PGR, PCMSO, LTCAT e demais, com vigência e responsável
- [ ] **A9. Usuários e Permissões** — equipe e perfis de acesso (RBAC)
- [ ] **A10. Catálogo de Riscos** — agentes com código da Tabela 24
- [ ] **A11. Relatórios, Drive, Financeiro, Configurações** — telas simples por último

## Etapa B — Ligar o banco (Supabase)

- [ ] **B1.** Criar projeto Supabase dedicado (separado do agendamento)
- [ ] **B2.** Baixar leiautes oficiais S-1.3 + Tabelas 01 e 24 → `docs/leiautes/`
- [ ] **B3.** Criar as tabelas da Fase 1 (empresa, estabelecimento, setor, cargo,
      GHE, empregado, usuário, perfil, log) com as validações no banco
- [ ] **B4.** Login de verdade (Supabase Auth) — sem senha embutida na página
- [ ] **B5.** Trocar os dados de demonstração pelos dados do banco, módulo a módulo
- [ ] **B6.** Log de atividades automático (toda alteração registrada)

## Etapa C — Dados reais

- [ ] **C1.** Planilha modelo (Excel) de empresas e empregados para download
- [ ] **C2.** Importação com conferência linha a linha (CPF, CNPJ, CBO, datas)
- [ ] **C3.** Carga das 60 empresas e 1.084 empregados + conferência
- [ ] **C4.** Convidar os usuários da equipe com seus perfis

## Etapa D — Auditoria de verdade (Fase 3 do handoff)

- [ ] **D1.** Leitura dos XMLs dos eventos e conferência contra os leiautes S-1.3
- [ ] **D2.** Apontar a causa de cada "erro de XML" e cada evento parado
- [ ] **D3.** Cruzamento PGR × S-2240 e PCMSO × S-2220 com causa da divergência
- [ ] **D4.** Relatório mensal de auditoria por cliente

---

**Como pedir o próximo passo:** basta dizer "próximo" (sigo a ordem) ou o nome
do módulo. Um print da tela equivalente ajuda a conferir as funções — e o
restante a gente tira do levantamento do `HANDOFF_AUDITOR_ESOCIAL.md`.
