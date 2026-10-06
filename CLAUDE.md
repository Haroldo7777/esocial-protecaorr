# CLAUDE.md

## Auditor eSocial — Proteção RR (esocial.protecaorr.net)

Plataforma própria de gestão e auditoria de SST da Proteção RR, cobrindo os eventos
S-2210, S-2220, S-2221 e S-2240.

Contexto do produto: ver @HANDOFF_AUDITOR_ESOCIAL.md

Plano de implementação da Fase 1: ver @PLANO_FASE_1_AUDITOR.md

Estado atual: só a página provisória "em construção" (`index.html`), publicada no
Render como site estático em `esocial.protecaorr.net`. O sistema real (Fase 1 em
diante) será construído neste repositório.

> O handoff cita "auditor.protecaorr.net"; o domínio definitivo, definido pelo
> Haroldo em 06/10/2026, é **esocial.protecaorr.net**.

## Regras do projeto

- eSocial Brasil (clinica.esocialbrasil.com.br) é só **referência funcional** — não
  copiar código, layout visual, textos ou marca do fornecedor.
- O modelo de dados segue os **leiautes oficiais do eSocial S-1.3** e o MOS, não o
  sistema analisado.
- LGPD: nunca usar dados pessoais reais de trabalhadores em seeds, fixtures ou logs.

## Projetos relacionados

- `Haroldo7777/agendamento-exames` → agendamento.protecaorr.net (página estática de
  agendamento de exames do DETRAN-RR). Projeto separado — não misturar.
