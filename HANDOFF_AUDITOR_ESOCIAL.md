# Handoff para o Claude Code: Auditor Proteção RR

> Coloque este arquivo na raiz do repositório do **auditor.protecaorr.net** (ou em `docs/`) e, no Claude Code, peça:
> *"Leia HANDOFF_AUDITOR_ESOCIAL.md e me proponha o plano de implementação da Fase 1."*
> Para o Claude Code ler isto sempre, adicione ao `CLAUDE.md` do projeto a linha: `Contexto do produto: ver @HANDOFF_AUDITOR_ESOCIAL.md`

Levantamento feito em 05/10/2026 por navegação **somente leitura** no `clinica.esocialbrasil.com.br` (perfil consultoria, conta 558 – PROTEÇÃO RR, usuário Haroldo). Nada foi criado, alterado ou enviado no sistema.

Documento vivo de origem: https://claude.ai/code/artifact/073a0af4-05e4-4f40-8e70-b20958d472ed

---

## 1. Objetivo

Construir uma ferramenta própria (auditor.protecaorr.net) que cubra as funções de SST que a Proteção RR usa hoje no eSocial Brasil, e que vá além delas na **auditoria** dos eventos S-2210, S-2220, S-2221 e S-2240.

### Regras do projeto
- Usar o eSocial Brasil só como **referência funcional**: o que ele faz, quais campos e fluxos existem.
- **Não** copiar código, layout visual, textos ou marca do fornecedor.
- O modelo de dados deve seguir os **leiautes oficiais do eSocial (versão S-1.3)** e o Manual de Orientação (MOS), e não o sistema analisado.
- Dados pessoais de trabalhadores seguem a LGPD: nada de dados reais em seeds, fixtures ou logs.

---

## 2. Visão geral do sistema de referência

O sistema é **multiempresa**: a consultoria administra 60 empresas ativas e 1.084 empregados, e quase toda tela filtra por empresa.

A barra do topo traz: troca de empresa, SMS, notificações, meu perfil, mudar de perfil, registro de atividades (log) e termos de uso.

### Menu lateral e rotas

| Menu | Telas (rota) |
|---|---|
| Central de Ajuda | `/central-ajuda` (vídeos, suporte, "Pergunte à IA") |
| Dashboard | `/` |
| Empresas | `/empresas`; "Acessar" entra no contexto da empresa (`/clinica/logar-como/{id}`) |
| Documentos | `/pgrs`, `/pcmsos`, `/ltcats`, `/lip`, `/aeps`, `/aets`, `/dirs`, `/pcas/cadastrados`, `/pprs`, `/modelos`, `/fichas-mei`, `/inventarios-avulsos`, `/equipamentos` |
| Treinamentos | `/treinamentos`, `/treinamentos/turmas`, `/treinamentos/avaliacoes-reacao` |
| Medicina | `/exames` (ASO), `/exames/tipo-exames`, `/central-de-exames/grupos` (ASO avulso), `/relatorios/top-exames`, `/ole/valores` |
| Drive | `/drive` |
| Relatórios | `/relatorio/gerar-relatorios` |
| Gestão de vencimentos | `/gestao-vencimentos` |
| API de integração | `/api-integracao` |
| Financeiro | `/pagamentos` |
| Catálogo de riscos | `/riscos` |
| Gerenciar cadastro | `/editar-consultoria/{id}` |
| Usuários | `/usuarios` |
| Permissões | `/perfis-acesso` |
| Configurações | `/configuracoes` |
| Outros | `/movimentacoes-vidas`, `/esocial/relatorio/s2210`, `s2220`, `s2221`, `s2240`, `/sms/registros`, `/log-sistema` |

### Dashboard
- **4 indicadores:** empresas ativas (60), empregados (1.084, com histórico de movimentação de vidas), turmas criadas (81), total de ASOs (2.993).
- **Gráfico de 12 meses:** EPIs, exames e treinamentos por mês.
- **Gestão de vencimentos:** 950 itens vencidos, separados em "Por colaborador" (EPIs, exames, treinamentos) e "Ações e programas" (PGR, AEP, AET, PCA, PCMSO, checklist, psicossocial). Atalhos Hoje / Semana / N dias e 52 empresas impactadas.
- **Eventos SST do eSocial:** um card por evento, com contagem por status.

| Evento | Sucesso | Erro no XML | Pronto p/ envio | Aguardando governo | Erro no envio |
|---|---|---|---|---|---|
| S-2220 Monitoramento da saúde | 2.614 | 137 | 51 | 0 | 6 |
| S-2240 Condições ambientais | 1.916 | 47 | 143 | 0 | 6 |
| S-2210 CAT | 71 | 0 | 3 | 0 | 1 |
| S-2221 Toxicológico | 1 | 0 | 0 | 0 | 0 |

Hoje há **184 eventos com erro de XML e 194 prontos e não enviados**. Esse é o principal valor imediato do Auditor.

Os status de evento a modelar são: `sucesso`, `erro_xml`, `pronto_envio`, `aguardando_governo`, `erro_envio`.

---

## 3. Detalhe por módulo

Padrão de quase todas as listas: **filtro por empresa, botão "+ Novo", Exportar e uma coluna de acesso/ações**. Vale criar um componente genérico de listagem (filtros, paginação, exportação PDF/Excel/CSV).

### Empresas e operação

| Tela | O que faz | Colunas, filtros e ações |
|---|---|---|
| Empresas | Carteira de clientes | ID, empresa, nº de empregados, data de inclusão, situação. Busca por nome, empregado, CPF, CNPJ ou ID. Tipo: gestão, só treinamentos, via link. Situação: liberado, bloqueado. Ações: nova empresa, importar, exportar, demissão em lote, acessar |
| Movimentações de vidas | Admissões e demissões | Filtros: data início, data fim, tipo |
| Gestão de vencimentos | Painel único de prazos | Visões: colunas (kanban), lista, consolidado, responsáveis, lixeira. Filtros: tipo (EPI, exame, treinamento), status (pendente, em andamento, vencido), responsável, empresa, horizonte (15/30/60/90/120 dias), "meus itens". Cada cartão: tipo, dias de atraso ou para vencer, data, empregado, empresa, cargo, itens (EPIs ou exames + periodicidade), quantidade, situação (atrasada / em dia), responsável, "Acessar" |
| Drive | Repositório de arquivos | Carregado dinamicamente; não mapeado |
| Relatórios | Gerador de relatórios | Tipo, empresa, empresa (cobranças), status do item, empresas (EPIs entregues), período; formato PDF, Excel ou CSV |

### Documentos técnicos

| Tela | Colunas da lista | Observação |
|---|---|---|
| PGR | Empresa, responsável, data, data final, tipo, acesso | O "tipo" provavelmente distingue PGR completo de simplificado |
| PCMSO, LTCAT, LIP, PPR | Empresa, responsável, data, data final, acesso | Mesmo padrão, com vigência |
| AEP, AET, PCA | Empresa, data, data final, acesso | Sem responsável na lista |
| DIR | Empresa, responsável, data, acesso | Filtros de data e status |
| Modelos | Nome, tipo de plano, total de linhas, origem, criado em, ações | Abas: modelos de documentos, de checklist e de planos de ação |
| Inventário de riscos | Geração avulsa | Anexo "quadro risco x empregado", por CPF ou por grupo de trabalho; PDF ou Excel |
| Fichas MEI | Documentos para MEI | Busca e PDF |
| Equipamentos | Equipamento, realizado, próxima, situação, nº de série, patrimônio, certificado | Calibração de instrumentos de medição |
| Catálogo de riscos | Risco, ambientes, nome eSocial, código Tabela 24, ações | Base de agentes nocivos ligada ao S-2240; categorias editáveis |

### Medicina

| Tela | O que faz |
|---|---|
| Ocupacional (ASO) | Abas: próximos agendamentos, agendamentos, ASO, recibo de exames. Filtros por vencimento (1, 7 ou 15 dias) e por exames |
| Tipos de exames | Cadastro dos procedimentos |
| ASO avulso (grupos) | Data de criação, grupo, empresa CNPJ/CPF, modelo de ASO |
| Top exames | Ranking de procedimentos por período (mês ou intervalo) e tipo de ASO, com variação e exportação Excel |
| Tabela de valores | Preços de exames (recurso comercial do fornecedor) |
| eSocial S-2210/2220/2221/2240 | Relatórios por evento, com status de envio |

### Treinamentos

| Tela | Colunas e filtros |
|---|---|
| Treinamentos | ID, tipo, treinamento, documento base (NR), periodicidade, carga horária, status. Abas: treinamentos, módulos, documentos base |
| Turmas | ID, treinamento, empresa, data início, data fim, tipo, alunos, ações. Filtros: treinamento, empregado, período, empresa; Excel e PDF |
| Avaliações de reação | Data, empresa, aluno, turma, treinamento, satisfação geral |

### Administração

| Tela | O que faz |
|---|---|
| Usuários | Avatar, nome, e-mail, perfil de permissão. Ações: tornar responsável, permitir acesso financeiro, excluir, reenviar convite |
| Perfis de acesso | Nome, descrição, tipos de usuário, permissões, nº de usuários (RBAC) |
| Configurações | Abas: Identidade (cor, logotipo); eSocial (certificado digital, procurações por certificado); Assinaturas (SMS, WhatsApp, e-mail, presencial, ordem de assinatura, perfil de evidência); EPI; Treinamentos; Avisos; Integrações (Asaas: chave de API, wallet ID, empresas a faturar, faturas separadas por tipo de serviço) |
| Financeiro | Cobrança do fornecedor sobre a consultoria. Abas: pagamento, faturamento, valores de exames, treinamentos, documentos, mensalidade |
| API de integração | Ativação sob pedido ao suporte |
| Registro de atividades | Log de ações dos usuários |

### Ainda não mapeado
As telas **dentro de uma empresa** (empregados, setores, cargos, GHE, ficha de EPI, formulários de ASO e PGR) exigem entrar no contexto do cliente e expõem dados pessoais. O próximo passo é mapeá-las usando a empresa de teste "teste HAROLDO ARAUJO".

---

## 4. Modelo de dados inferido

```
Consultoria ─┬─> Usuário (perfil de acesso / permissões)
             └─> Empresa (cliente, CNPJ)
                   ├─> Programa (PGR, PCMSO, LTCAT, LIP, AEP, AET, PCA, PPR, DIR)
                   │     └─> Risco (catálogo, Tabela 24) ──por empregado exposto──> Evento S-2240
                   └─> Empregado (setor, cargo, GHE)
                         ├─> ASO / Exames (agendas, guias) ──a cada ASO──> Evento S-2220
                         ├─> Entrega de EPI (ficha, estoque, CA)
                         └─> Matrícula em Turma ─> Treinamento (NR, periodicidade, carga horária)

Gestão de vencimentos = visão agregada sobre ASO/exames, EPI, turmas e programas (com responsável e status)
Evento eSocial = { tipo (S-2210/2220/2221/2240), empresa, empregado, xml, recibo, status, erros[] }
```

Entidades sugeridas: `consultoria`, `usuario`, `perfil_acesso`, `permissao`, `empresa`, `estabelecimento`, `setor`, `cargo`, `ghe`, `empregado`, `programa` (tipo + vigência + responsável), `risco_catalogo` (código Tabela 24), `risco_exposicao` (empregado/GHE × risco), `exame_tipo`, `aso`, `aso_exame`, `epi`, `epi_entrega`, `treinamento`, `turma`, `turma_aluno`, `vencimento` (view ou tabela), `evento_esocial`, `evento_erro`, `log_atividade`.

Os campos exatos de cada entidade devem vir dos leiautes oficiais S-1.3 e do mapeamento dos formulários internos.

---

## 5. Roadmap

Começar pelo que gera valor sem depender de transmissão ao governo: **cadastro, vencimentos e auditoria dos eventos**. Documentos e envio ao eSocial ficam para depois.

| Fase | Entrega | Por que nesta ordem |
|---|---|---|
| 1. Base | Empresas, estabelecimentos, setores, cargos, empregados; usuários e perfis de acesso; log de atividades; importação por planilha | Tudo depende desse cadastro |
| 2. Vencimentos | Painel único de prazos (ASO, exames, EPI, treinamentos, PGR/PCMSO) com responsável e alertas | É o painel mais usado hoje: 950 itens vencidos em 52 empresas |
| 3. Auditoria | Conferência S-2220/S-2240 contra os leiautes oficiais: erros de XML, eventos pendentes, divergência entre PGR e S-2240 | É o diferencial do "Auditor": 184 erros de XML e 194 eventos parados hoje |
| 4. Documentos | PGR, PCMSO, LTCAT, PPP a partir de modelos, com inventário de riscos e catálogo (Tabela 24) | Reaproveita as skills de PPP e contrato já usadas |
| 5. Medicina e treinamentos | ASO, agendamentos, guias; turmas, certificados, avaliação de reação; ficha de EPI | Volume alto, mas regras bem conhecidas |
| 6. Integrações | Assinatura digital, faturamento (Asaas), certificado A1 e transmissão ao eSocial | Transmitir exige certificado e homologação; fazer por último reduz risco |

### Diferenciais a perseguir
- Cruzamento automático PGR × S-2240 × PCMSO × S-2220. O fornecedor mostra contagens, mas não aponta a causa da divergência.
- Fila de correção por empresa, com responsável e prazo. No painel atual quase tudo aparece como "Sem responsável".
- Relatório mensal de auditoria por cliente.

---

## 6. Próximos passos
- [ ] Mapear os formulários internos de uma empresa (empregado, ASO, PGR) com a empresa de teste
- [ ] Baixar os leiautes S-1.3 do eSocial para S-2210, S-2220, S-2221 e S-2240 e salvá-los em `docs/leiautes/`
- [ ] Definir a stack do auditor.protecaorr.net (ex.: Supabase + Next.js) e registrá-la no `CLAUDE.md`
- [ ] Ler os termos de uso do eSocial Brasil quanto a engenharia reversa
- [ ] Iniciar a Fase 1: schema do banco + CRUD de empresas e empregados
