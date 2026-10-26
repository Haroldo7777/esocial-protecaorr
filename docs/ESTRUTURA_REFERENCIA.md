# ESTRUTURA DE REFERÊNCIA — Sistema de Gestão de SST e eSocial

> **Documento de engenharia reversa (apenas estrutura/arquitetura).**
> Objetivo: servir de referência de arquitetura para a construção de um app próprio de gestão de SST e eSocial.
> **Não contém** código, textos, imagens, marca ou dados pessoais do sistema analisado. Nomes/CPF/endereços reais observados nas telas foram descritos como *estrutura de campo*, sem reprodução de valores (LGPD).
>
> Sistema analisado: plataforma SaaS de SST/eSocial para consultorias (conta: consultoria "PROTEÇÃO RR", id 558).
> Data do levantamento: 26/10/2026.
> Status: **cobertura ampla concluída** — portal do cliente e principais telas/forms da consultoria mapeados. Telas restantes (listas/relatórios secundários) seguem os padrões já documentados.

---

## COMO USAR ESTE DOCUMENTO (instruções ao Claude Code)

Você (agente de desenvolvimento) vai construir um **app próprio** de gestão de SST e eSocial usando este documento como **referência de conceitos e arquitetura** — nunca como fonte de cópia. Ordem de leitura sugerida:

1. **Seção 1** — arquitetura multi-tenant e os dois ambientes (consultoria × cliente).
2. **Seção 11** — recorte de fases (MVP), decisões técnicas e lacunas: é o seu plano de trabalho.
3. **Seção 6** — modelo de dados (entidades/relacionamentos) → base do schema.
4. **Seção 4** — RBAC (tipos de usuário, perfis, matriz módulo×ação) → base de autorização.
5. **Seções 5 e 10** — telas, formulários, campos e funções por menu → base das features.
6. **Seções 7 e 8** — integrações (eSocial, certificado, assinatura) e fluxos de negócio.

**Regras inegociáveis:** (a) não copiar código, layout, textos ou marca do sistema analisado — UI e implementação próprias; (b) nenhum dado pessoal deste documento (não há) nem de testes reais deve ir para o código/seed; (c) construir por fases (11.1), validando cada fase com o dono do produto (Haroldo, eng. de segurança do trabalho — ele é a autoridade de domínio em NRs/eSocial).

---

## 1. Visão geral da arquitetura

### 1.1 Modelo multi-tenant
Hierarquia central inferida:

```
Consultoria (tenant raiz)
  └── Empresa (cliente)                 [N empresas por consultoria]
        ├── Estabelecimento             [matriz + filiais, cada um com CNPJ]
        │     └── Ambiente              [locais/unidades físicas de trabalho]
        ├── GHE / Grupo de Trabalho     [grupo homogêneo de exposição]
        │     ├── Função (cargo)        [associada a GHE]
        │     ├── Risco / Fator de risco
        │     └── Medida de controle
        └── Empregado                   [vinculado a GHE, Função e Ambiente]
              ├── ASO / Exames
              ├── EPIs
              ├── Treinamentos
              ├── Eventos eSocial (S-2210/2220/2221/2240)
              └── Ocorrências
```

### 1.2 Dois frontends (apps) separados
- **App da Consultoria** — `clinica.esocialbrasil.com.br`
  Operação completa da consultoria sobre todas as empresas-cliente.
- **App da Empresa/Cliente** — `app.esocialbrasil.com.br`
  Portal do assinante (empresa-cliente), com menu e permissões reduzidos.

### 1.3 Impersonação (context-switch consultoria → empresa)
- Na lista de Empresas (consultoria), o botão **"Acessar"** entra no portal da empresa por impersonação.
- Dentro do cliente aparece o botão **"Voltar ao login da Consultoria"** → rota `/back-previous-login`.
- O cabeçalho passa a exibir `EMPRESA / CONSULTORIA` e o domínio muda para `app.`.
- O cliente assinante também loga direto no `app.`, limitado pelo seu perfil.

---

## 2. Mapa de navegação — APP DA CONSULTORIA (`clinica.esocialbrasil.com.br`)

| Grupo / Tela | Rota | Função |
|---|---|---|
| Dashboard | `/` | KPIs (empresas, empregados, turmas, ASOs), gráfico EPIs/Exames/Treinamentos, resumo de vencimentos |
| Empresas | `/empresas` | Lista/gestão das empresas-cliente |
| Movimentações de vidas | `/movimentacoes-vidas` | Entrada/saída de empregados (vidas) |
| Central de Ajuda | `/central-ajuda` | Suporte, novidades |
| **DOCUMENTOS** | | |
| AEP | `/aeps` | Análise Ergonômica Preliminar |
| AET | `/aets` | Análise Ergonômica do Trabalho |
| DIR | `/dirs` | Declaração/Documento de Inventário de Riscos |
| LIP | `/lip` | Laudo de Insalubridade e Periculosidade |
| LTCAT | `/ltcats` | Laudo Técnico das Condições Ambientais do Trabalho |
| PCA | `/pcas/cadastrados` | Programa de Conservação Auditiva |
| PCMSO | `/pcmsos` | Programa de Controle Médico de Saúde Ocupacional |
| PGR | `/pgrs` | Programa de Gerenciamento de Riscos |
| PPR | `/pprs` | Programa de Proteção Respiratória |
| Modelos | `/modelos` | Templates dos documentos |
| Fichas MEI | `/fichas-mei` | Fichas simplificadas MEI |
| Inventário de riscos | `/inventarios-avulsos` | Inventários avulsos |
| Equipamentos | `/equipamentos` | Cadastro de equipamentos/EPIs |
| Produção por pessoa | `/relatorios/producao-documentos` | Produtividade por técnico |
| **TREINAMENTOS** | | |
| Turmas | `/treinamentos/turmas` | Turmas |
| Treinamentos | `/treinamentos` | Catálogo/registro |
| Avaliações de Reação | `/treinamentos/avaliacoes-reacao` | Eficácia pós-treinamento |
| **MEDICINA** | | |
| Ocupacional (ASO) | `/exames` | Exames ocupacionais → ASO |
| Tipos de exames | `/exames/tipo-exames` | Catálogo de tipos de exame |
| ASO Avulso | `/central-de-exames/grupos` | ASO fora do fluxo padrão |
| Top Exames | `/relatorios/top-exames` | Relatório |
| Drive | `/drive` | Arquivos/documentos |
| Relatórios | `/relatorio/gerar-relatorios` | Geração de relatórios |
| Gestão de Vencimentos | `/gestao-vencimentos` | Painel de prazos (`?natureza=colaborador\|acoes&bucket=vencidos\|hoje\|semana\|horizonte`) |
| API de Integração | `/api-integracao` | Chaves/tokens de API |
| Financeiro | `/pagamentos` | Pagamentos/cobrança |
| Catálogo de Riscos | `/riscos` | Base de riscos/agentes (Tabela 24) |
| Gerenciar Cadastro | `/editar-consultoria/{id}` | Dados da consultoria |
| Usuários | `/usuarios` | Usuários internos |
| **PERMISSÕES** | | |
| Perfis de Acesso | `/perfis-acesso` | Perfis/papéis |
| Matriz de Acesso | (ação JS) | Permissões por perfil × recurso |
| Configurações | `/configuracoes` | Config. gerais (certificado, e-mail, eSocial) |

---

## 3. Mapa de navegação — PORTAL DO CLIENTE (`app.esocialbrasil.com.br`)

| Grupo | Abas / Rotas |
|---|---|
| Dashboard | `/` — Gestão de Saúde e Segurança (cobertura geral, próximas atividades, vencimentos, segmentações) |
| **EMPRESA** | Ambientes e Estabelecimentos `/empresas` · GHE – Grupo de Trabalho `/segmentacao` · Funções `/empresa/funcoes` |
| **EMPREGADOS** | Ativos `/empregados` · Afastados `/empregados/afastados` · Demitidos `/empregados/demitidos` · Transferidos `/empregados/transferidos` · Excluídos `/empregados/deletados` |
| **DOCUMENTOS** | Documentos legais `/documentos` · Plano de ação `/plano-da-empresa` · Ordem de Serviço `/empresa/ordem-servico` · Formulário Psicossocial `/formulario-psicosocial/telaPsicosocial` · APR `/apr` · CAT `/cat` · PPP `/ppp` · PT `/pt` · PET `/pet` |
| **TREINAMENTOS** | Visão geral `/treinamentos/visao-geral` · Cursos `/treinamentos` · Turmas `/treinamentos/turmas` |
| **MEDICINA** | Visão geral `/exames` · Assistencial (em breve) · Ocupacional/ASO `/exames/guias` · Toxicológicos `/exames/emissao-exames-toxicologicos` · Tipos de exames `/exames/tipo-exames` · Clínicas `/exames/clinicas` |
| **EPI** | Visão geral `/epis` · Ficha de EPI `/epis/fichas` · Estoque `/epis/estoque` · Custos `/epis/custos` · Solicitações de troca `/epis/solicitacoes` · Empréstimos `/epis/emprestimos` |
| **CIPA** | Processos `/cipa/processos` · Ata de Eleição `/cipa/ata-eleicoes` · Ata de Posse `/cipa/atas-posse` · Atas de Reunião `/cipa/atas-reunioes` · Calendário `/cipa/calendarios` |
| Auditoria / Checklist | `/auditorias` (abas Auditorias · Checklists) |
| Catálogo de Riscos | `/riscos` (camadas eSocial · Consultoria · Empresa) |
| Drive | `/drive` |
| Relatórios | `/relatorio/gerar-relatorios` |
| Gestão de Vencimentos | `/gestao-vencimentos` |
| Financeiro | `/faturamento-da-empresa/{empresaId}` |
| (Usuários) | `/usuarios` — gestão dos próprios usuários da empresa (conforme perfil) |

**Ocultos no cliente vs. consultoria:** Permissões, API de Integração, Configurações administrativas, Gerenciar Cadastro da consultoria.

---

## 4. Controle de acesso (RBAC)

### 4.1 Tipos de usuário (7)
`CONSULTORIA` · `EMPRESA` · `EMPREGADO` · `ALUNO` · `CONTADOR` · `INSTRUTOR` · `PARCEIRO SAÚDE`

### 4.2 Perfis de acesso (pacotes de permissão; padrões do sistema são somente-leitura, variações via "Novo Perfil")
| Perfil | Tipo | Permissões |
|---|---|---|
| Consultoria Completo | CONSULTORIA | 70 |
| Consultoria Operacional | CONSULTORIA | 65 (sem financeiro/config.) |
| Contador | CONTADOR | 5 (fiscal + eSocial) |
| Empregado/Aluno | EMPREGADO, ALUNO | 2 (EAD + dashboard) |
| Empresa Básico | EMPRESA | 10 |
| **Empresa Completo** | EMPRESA | 68 (login operacional do cliente) |
| Empresa Operacional | EMPRESA | 67 |
| Instrutor | INSTRUTOR | 2 |
| Parceiro Saúde | PARCEIRO SAÚDE | 4 |
| Parceiro Saúde - Clínica | PARCEIRO SAÚDE | 20 |
| Parceiro Saúde - Médico | PARCEIRO SAÚDE | 7 |

### 4.3 Matriz de Acesso = módulo × ação
Colunas (CRUD): **VER · CRIAR · EDITAR · EXCLUIR**. Marcações especiais: *permissão obrigatória* (fica sempre ativa, ex.: VER Dashboard) e *ação não existe no módulo* (—).

**21 módulos** (≈ entidades/áreas do sistema):
Ambientes · Catálogo (riscos/agentes/EPC-EPI) · Configurações · Dashboard · Documentos (PGR, PCMSO, LTCAT, PPP, AET, AEP, OS) · Drive · Empregados · Empresas · EPIs · eSocial (S-2210/2220/2240) · Exames (ASO/guias) · Financeiro · Funções (cargos↔GHE) · Gerenciar cadastros (clínicas/médicos/RTs) · Gestão de Vencimentos · GHE · Gerenciar tokens de API · Permissões · Relatórios · Treinamentos · Usuários.

### 4.4 Criação de usuário / login do cliente (modal "Cadastrar Usuário")
Campos: Nome · E-mail · Celular · **Perfil de acesso** (geral) · **Perfil de acesso dentro das empresas** · **Empresas vinculadas** (multisseleção). Override por empresa possível depois via "Permissões".
Escopo na listagem: "Usuários da consultoria" vs "Usuários da empresa". Um usuário pode ter vínculo N:N com empresas, com perfil distinto por vínculo.

---

## 5. Módulos — sondagem profunda

### 5.1 Empregado (`/empregados` e `/empregados/detalhes/{id}`)

**Lista (`/empregados`)** — título "Gestão", contador de empregados. Dois modos (toggle):
- **GESTÃO** — controle de atividades SST. Colunas: Nome/CPF/Matrícula/Função/Data de entrada · Grupo de Trabalho (GHE) · Ambientes · EPI (% + semáforo) · Exames (%) · Treinamentos.
- **MENSAGERIA** — status dos eventos eSocial por empregado. Colunas: **S-2210 · S-2220 · S-2221 · S-2240** (enviado/Pendente), com ação de envio por linha.
- Ações de topo: Demissão em lote · Importar · Adicionar empregado · Exportar.
- Filtros: Ordenar por · Campo · Buscar.

**Ficha do empregado (`/empregados/detalhes/{id}`)** — cabeçalho (avatar, nome, função, CPF, matrícula, status ATIVO/Afastado/Demitido). Ações: Editar · Transferir · Próximo. **5 abas:**

1. **Visão geral** — donut de conformidade geral (%) + barras EPIs/Exames/Treinamentos; bloco *Grupo de Trabalho* (GHE + data de início); *Ambientes*; cards: EPIs (Gerar Ficha, Vincular), Exames (ASO, Vincular; sub-abas Vencimentos/Guias), Treinamentos (Editar data, Vincular).
2. **Fatores de risco** — herdados do GHE (não editáveis aqui; aviso remete ao Grupo de Trabalho). Blocos: *Atividades Perigosas* (NR-16), *Atividades Insalubres* (NR-15), *Fatores de Risco* (cada um: descrição + código interno + categoria + mapeamento **T24** + flags de documento LIP/LTCAT/PCMSO/AEP).
3. **Histórico** — log de auditoria por empregado. Filtros por tipo: Empregado, Treinamento, Grupo de Trabalho, ASO, Exame, EPI. Colunas: Data · Categoria · Descrição.
4. **Dados pessoais** —
   - *Identificação:* Nome · Nome social · CPF · RG · Data de nascimento · NIS · CTPS · Telefone · Email · Gênero · Nacionalidade · Tipo sanguíneo · PCD.
   - *Dados profissionais:* Função · Cargo (CBO) · Categoria (eSocial, ex. 101) · Descrição das atividades · Horário de trabalho · Regime de revezamento · Ambientes · Grupo de trabalho · Entrada na empresa · Matrícula · Ficha do empregado.
   - Ação: Exportar PDF.
5. **Gestão** — registro de **Ocorrências** (Nova Ocorrência, Exportar PDF).

---

### 5.2 GHE / Grupo de Trabalho (`/segmentacao` e `/segmentacao/editar/{id}`)

É a entidade-núcleo do mapeamento (Grupo Homogêneo de Exposição). Agrupa empregados com exposição semelhante e amarra ambientes, funções, riscos e medidas de controle.

**Lista (`/segmentacao`)** — colunas: ☑ (exclusão em lote) · Referência · Número · Processo · **Situação** (✓ completo / ⚠ incompleto) · **Aplicação por empregados** (barra "X de Y") · Funções (qtd). Botões: **Encontrar com IA** (sugestão automatizada), Gerar Relatório, + Novo Grupo de Trabalho. Filtro por Referência + busca.

**Formulário "Criar Grupo de Trabalho"** (modal): Referência* · Número (default 1) · Processo (textarea) · Observação (textarea) · toggle "Inserir jornada de trabalho?" → campo **Jornada de Trabalho**.

**Editor — wizard de 5 etapas** (botão fixo "Aplicar GHE" salva tudo; aviso para não sair sem aplicar):

1. **Dados e Ambientes** — Número · Processo · Jornada de Trabalho · Observação · Observação PGR · Observação LTCAT · Observação PCMSO; bloco **Ambientes** vinculados (Adicionar ou remover).
2. **Empregados e Funções** — *Funções vinculadas ao GHE* (Adicionar/remover) e *Empregados* vinculados (Nome/função · Data de início · Data fim; "Alterar Datas"). Relações N:N GHE↔Função e GHE↔Empregado com período.
3. **Atividades** — caracterização de insalubridade/periculosidade: dropdown *percentual de insalubridade equivalente* (grau NR-15); listas **Atividades Periculosas** (NR-16) e **Atividades Insalubres** (NR-15).
4. **Riscos** — cards de risco; cada um com: nome, categoria + código interno, **Ambientes** aplicáveis, flags ● Insalubridade ● Aposentadoria (especial), e **toggles por documento** (LIP · LTCAT · PGR · PCMSO · AEP) que definem em quais documentos o risco aparece. Toggle "Medidas Administrativas do GHE"; botão "Instruções matriz". Remoção por card.
5. **Medidas de Controle** — 3 colunas: **EPIs** (itens com nº/CA, "aplicável a X empregados"), **Exames** (nº + nome, ex. audiometria, avaliação clínica, glicemia), **Treinamentos**. É o elo que define o que é exigido por GHE.

> **Regra central:** Riscos e medidas são definidos no **GHE** (não no empregado). O empregado **herda** do GHE seus fatores de risco e suas exigências de EPI/Exame/Treinamento, que viram indicadores de conformidade e itens de vencimento. Daí o cliente poder visualizar, mas não editar o mapeamento.

---

### 5.3 Catálogo de Riscos (`/riscos`) e cadastro de Risco (`/risco/novo`)

**Catálogo (`/riscos`)** — 3 camadas (abas): **eSocial** (tabela oficial, somente leitura) → **Consultoria** (riscos padronizados da consultoria) → **Empresa** (riscos específicos da empresa). Colunas: Risco · Ambientes · eSocial Nome · Código Tabela. Ações: + Cadastrar Risco · Editar nome das categorias. Filtros por Risco e por Código.

**Formulário "Cadastro de Risco" (`/risco/novo`) — wizard de 4 passos:**
1. **Informações Iniciais** — *Nome do Risco** (obrigatório) · *Risco relacionado ao eSocial* (dropdown = **Tabela 24** oficial, agente nocivo com código `interno / eSocial`) · *Categoria** (obrigatório; ver taxonomia abaixo) · *Risco Qualitativo?* (Sim/Não) · *Observações*.
2. **Medidas de Controle** — medidas de proteção (EPC/EPI/administrativas) vinculadas ao risco.
3. **Treinamentos e Exames** — treinamentos e exames exigidos pelo risco.
4. **Interpretação e Detalhes** — campos técnicos de medição/exposição (intensidade, limite de tolerância, métodos/equipamento de medição, trajetória, interpretação de resultados/LIP, utiliza EPC + eficácia, tipo de exposição, aposentadoria especial, código GFIP, gradação de probabilidade, classificação).

> Observação: ao editar um risco é preciso **reaplicá-lo ao GHE** para persistir as alterações.

**Taxonomia de categorias de risco** (dropdown do form):
Físico · Químico · Biológico · Ergonômico - Biomecânico · Mecânico - Acidentes · Outros agentes nocivos · Ergonômicos - Mobiliário e Equipamentos · Ergonômicos - Organizacionais · Ergonômicos - Ambientais · Ergonômicos - Psicossociais/Cognitivos · Associação de agentes nocivos (físicos/químicos/biológicos) · Ausência de agentes nocivos ou atividades especiais.

**Prefixos de código (Tabela 24 / eSocial)** observados: `01` Físico · `02` Químico · `03` Biológico · `04` Ergonômico (`.01` biomecânico, `.02` mobiliário/equip., `.03` organizacional, `.04` ambiental, `.05` psicossocial/cognitivo) · `05` Mecânico/Acidentes · `07` Associação (aposentadoria especial) · `08` Umidade · `09` Ausência de agente nocivo / fatores psicossociais (legislação previdenciária). *(Tabela oficial não reproduzida integralmente.)*

---

### 5.4 Empresa / Estabelecimentos / Ambientes (`/empresas`)

**Tela (`/empresas`)** — abas **Estabelecimentos** | **Ambientes**.
- *Estabelecimentos*: cards (Razão Social · CNPJ · endereço) com flag **MATRIZ**; ações Editar, **Tornar matriz**, + Adicionar estabelecimento. Modelo: Empresa → N Estabelecimentos (1 matriz + filiais).
- *Ambientes*: locais físicos de trabalho. Detalhe em `/ambientes/detalhes/{id}` → abas **Visão geral · Empregados · EPC**; campos: Nome · Tipo (Ambiente Próprio / de Terceiros) · Início/Fim · Inscrição (CNPJ) · Estabelecimento · Descrição (texto) · **Riscos vinculados** (Nome/Categoria). Ação **Replicar para Filiais**. Um ambiente liga-se a GHE, empregados, riscos e EPC.

**Onboarding — wizard "INSTALAÇÃO INICIAL"** (aberto por "+ Adicionar estabelecimento"): 5 passos → **1 Empresa · 2 Ambientes · 3 Riscos · 4 Empregados · 5 Faturamento**. É o fluxo completo de cadastro de uma empresa-cliente.

**Passo 1 — Empresa (campos):**
- *Permissões para acessar a empresa* — usuários da consultoria que poderão acessar (multisseleção).
- *Dados da empresa* — tipo de inscrição **CNPJ / CPF / CAEPF / CNO** (CNPJ auto-preenche dados) · Email da empresa · E-mail para cobrança/boletos · **CNAEs** (busca, 1.346 opções, múltiplos) · Razão Social · Nome Fantasia · Inscrição Estadual · Inscrição Municipal · Telefone · Site · **Grau de risco** (Grau 1–4).
- *Endereço* — CEP · Rua · Número · Complemento · Bairro · Cidade · Estado.

---

### 5.5 Medicina / Exames / ASO (`/exames`, `/exames/guias`, `/exames/tipo-exames`)

- **Visão geral (`/exames`)** — cards: Eficiência dos Exames mapeados · Total de Exames mapeados · Total de ASO gerados · Total de guias geradas; gráfico de exames realizados; "Definir prazo".
- **Ocupacional / ASO (`/exames/guias`)** — abas **Próximos agendamentos · Agendamentos · ASO · Recibo de exames**. Fluxo: agendar → emitir **guia** → realizar → emitir **ASO** → evento **S-2220**. Filtros, "Definir prazo", exportar.
- **Toxicológicos (`/exames/emissao-exames-toxicologicos`)** — exame toxicológico (motoristas) → evento **S-2221**.
- **Tipos de Exames (`/exames/tipo-exames`)** — catálogo; cada exame configurado por **tipo de ASO** (toggles): **A** Admissional · **P** Periódico · **D** Demissional · **RT** Retorno ao Trabalho · **MR** Mudança de Risco/Função. Tabela por GHE; vinculado ao **PCMSO** (por função/CPF). Export PDF.
- **Clínicas (`/exames/clinicas`)** — clínicas/credenciados para realização dos exames.

### 5.6 EPI (`/epis` e sub-rotas)
Sub-rotas: Visão geral · Ficha de EPI · Estoque · Custos · Solicitações de troca · Empréstimos.

- **Ficha de EPI (`/epis/fichas`)** — abas **Próximas trocas · Fichas emitidas · Ficha de Devolução · Pendentes de devolução**; **assinatura digital**, "Gerar ficha em grupo", definir prazo.
- **Estoque (`/epis/estoque`)** — abas Estoque · Acessórios · Devolvidos; Importar/Exportar/+ Cadastrar EPI.
- **Formulário Cadastrar/Editar EPI** (campos; * obrigatório):
  - *Identificação e Ciclo:* Nome EPI* · Vincular GHE (checkboxes) · **Periodicidade de troca*** (Meses/Dias + nº) · Composição de estoque (Quantidade* · Tamanho* · Custo unit.*, múltiplos itens / saldo inicial).
  - *Operação e Conformidade:* **Tipo de EPI Correspondente*** (eSocial) · Estabelecimentos · Fabricante (autocomplete + cadastrar) · Tipo de Atenuação · Alerta de estoque mínimo · Situação (Ativo) · **Número CA*** (+ "Buscar CA") · **Validade CA*** · Atenuação · Observações.

> **Entidade EPI** guarda CA (nº + validade), fabricante, tipo eSocial, periodicidade de troca, atenuação (protetor auditivo), grades de tamanho/custo e estoque.

### 5.7 Documentos do cliente & eventos legais

Sub-rotas do grupo DOCUMENTOS (cliente): Documentos legais · Plano de ação · Ordem de Serviço · Formulário Psicossocial · APR · CAT · PPP · PT · PET.

- **Documentos legais (`/documentos`)** — visão/leitura dos programas (PCMSO, Relatório Analítico, LTCAT, LIP, PGR, Inventário) com Vigência e Revisões; exportável.
- **CAT (`/cat`)** — Comunicação de Acidente de Trabalho → evento **S-2210**. Lista: Empregado · Abertura · Data do Acidente · Aberturas. Formulário em 4 passos: **Dados iniciais · Local · Especificidades · Atestado** (empregado, tipo/data/hora, local, parte do corpo/agente/CID, atestado médico).
- **PPP (`/ppp`)** — Perfil Profissiográfico Previdenciário (histórico de exposição por empregado).
- **Ordem de Serviço (`/empresa/ordem-servico`)** — OS de SST por função/GHE.
- **Plano de ação (`/plano-da-empresa`)** — plano de ação (medidas) da empresa.
- **Formulário Psicossocial (`/formulario-psicosocial/telaPsicosocial`)** — avaliação de fatores psicossociais (NR-1 2026).
- **APR (`/apr`) · PT (`/pt`) · PET (`/pet`)** — Análise Preliminar de Risco, Permissão de Trabalho, Permissão de Entrada e Trabalho (espaço confinado).

### 5.8 CIPA (`/cipa/*`)
"Comissão Interna de Prevenção de Acidentes **e de Assédio**" (NR-5 + Lei 14.457). Sub-rotas: Processos · Ata de Eleição · Ata de Posse · Atas de Reunião · Calendário.
Novo processo: Descrição · Data de início; depois conduz eleição/posse/reuniões/calendário.

### 5.9 Treinamentos (`/treinamentos/*`)
Sub-rotas: Visão geral · Cursos · Turmas.
- **Visão geral** — gráfico + **Próximas Turmas** com **sugestões automáticas** de treinamento derivadas dos riscos/EPIs mapeados (ex.: Conservação Auditiva, Uso de EPI), tipo sugerido (Presencial/Online), alunos indicados e botão "Criar turma".
- **Cursos (`/treinamentos`)** — abas Online | Presencial; cada curso é um card com **Período/periodicidade** (ex. 24/36 meses), **Carga horária**, **Documento Base** (NR-1, NR-20, etc.) e **preço** (catálogo EAD/marketplace para os online).
- **Turmas (`/treinamentos/turmas`)** — sessões com ID, curso, datas, instrutor, matrícula de empregados, presença e certificados; export Excel/PDF. Nova turma: escolhe **Online (EAD)** ou **Presencial**.
- Entidade Curso: nome · tipo (online/presencial) · periodicidade · carga horária · documento base (NR) · preço. O tipo de usuário EMPREGADO/ALUNO acessa o EAD.

### 5.10 Auditoria / Checklist (`/auditorias`)
Abas Auditorias · Checklists. Nova auditoria: Nome · Data início · **Tipo de formulário** (template de checklist) · Responsável. Checklists definem os templates/itens de inspeção.

### 5.11 Gestão de Vencimentos & Financeiro (cliente)
- **Gestão de Vencimentos (`/gestao-vencimentos`)** — painel central de prazos; visões Colunas/Lista/Consolidado; naturezas *Por colaborador* (exames/EPIs/treinamentos) e *Ações e programas* (PGR/PCMSO…); buckets Vencidos/Hoje/Semana/120 dias; filtros por tipo/status/responsável.
- **Financeiro (`/faturamento-da-empresa/{id}`)** — faturamento da empresa; cards Arrecadado/Pendente/Não gerado/Gerado/Aguardando; status Pendente/Aguardando/Gerado/Não gerado/Pago; export Excel.

> **Troca de empresa/filial:** header com seletor (`/selecionar-empresa/{id}`), "Copiar CNPJ/CPF", "Mudar de perfil" (`/selecao-perfil`), "Registro de atividades" (`/log-sistema`).

---

### 5.12 Documentos / Programas SST (lado da CONSULTORIA)

Programas acessíveis em `clinica.esocialbrasil.com.br`: AEP `/aeps` · AET `/aets` · DIR `/dirs` · LIP `/lip` · LTCAT `/ltcats` · PCA `/pcas/cadastrados` · PCMSO `/pcmsos` · PGR `/pgrs` · PPR `/pprs` (+ Modelos, Fichas MEI, Inventário de riscos, Equipamentos, Produção por pessoa).

**Padrão comum de lista:** tabela Empresa · Responsável · Data · Data Final · Tipo · Acesso + ação; botões Exportar e **+ Novo \<programa\>**; filtro por empresa.

**Padrão comum de criação (`/\<programa\>/escolher-empresa`):**
- Selecionar **Estabelecimento** (cada um etiquetado com o tipo do documento).
- **Identificação** do documento.
- **Anexo – Quadro Risco × Empregado**: Por CPF / Por Grupo de Trabalho / Por Função.
- **Informações Adicionais da Capa**.
- **Cadastro de elaboração:** Número · Data de início · Data final · **Empresa responsável** (clínica/consultoria RT) · **Profissional/Responsável** (validado contra a empresa responsável) · Descrição.

**Especificidades por programa:**
- **PGR** — seletor de **Modelo**: `PGR (NR-01)`, `PGR (NR-18)` (construção), `PGR (NR-22)` (mineração), `PGRTR (NR-31)` (rural).
- **PCMSO** — **Tipo de SESMT** (próprio/terceiros) · **Médico responsável** (médico do trabalho) · **Médicos examinadores** (empresa + lista). Sem seletor de modelo.
- LTCAT/LIP/PPR/PCA/AEP/AET — mesma base; conteúdo técnico conforme a norma (ex.: LIP = insalubridade/periculosidade, PCA = conservação auditiva, PPR = proteção respiratória).

> O **conteúdo** de cada programa (riscos, GES/GHE, medidas, cronograma) é alimentado pelo mapeamento de **GHE/Riscos** da empresa; a tela de criação monta a **capa + metadados de elaboração**.

### 5.13 Administração da consultoria
- **Gerenciar Cadastro** (`/editar-consultoria/{id}`) — abas: **Dados da consultoria** (CNPJ, razão social, nome fantasia, inscrições, contato, site, endereço) · **Parceiros** (sub-abas **Clínicas** [nome/cidade/telefone + Médicos da clínica] · **Contadores** · **Médicos**) · **Documentos (Responsáveis)** (responsáveis técnicos) · **Treinamentos (Instrutores e locais)**.
- **Responsáveis técnicos / Médicos** — entidade com nome, tipo (Médico do Trabalho / Engenheiro de Segurança) e registro profissional (CRM/CREA); usados como responsável/examinador nos documentos.
- **Usuários** / **Perfis de Acesso** / **Matriz de Acesso** — RBAC (ver seção 4).
- **Movimentações de vidas** (`/movimentacoes-vidas`) — entradas/saídas de empregados (faturamento por vidas).
- **Financeiro** (`/pagamentos`) · **Relatórios** (`/relatorio/gerar-relatorios`) · **Drive** · **Gestão de Vencimentos** (consolidado de todas as empresas).

### 5.14 Revisão — detalhes dos sub-itens do cliente (2ª passagem)

**Documentos (tipos abertos individualmente):**
- **APR (`/apr`)** — Análise Preliminar de Riscos por **tarefa**: Tarefa · Início · Término · Setor · Responsável; +APR, +Responsável, Exportar.
- **PT (`/pt`)** — Permissão de Trabalho: Identificação · Responsável · Data de Criação; +Nova PT.
- **PET (`/pet`)** — Permissão de Entrada e Trabalho (espaço confinado): ID · Nome · Data de Emissão; +Nova PET.
- **Ordem de Serviço (`/empresa/ordem-servico`)** — por **setor** · Data · Responsável; +Nova OS, Exportar OS.
- **Plano de ação (`/plano-da-empresa`)** — "Controle de ações" com 3 modelos (toggle): **Cronograma eSocial · 5W2H · modelo PGR**; linhas de ação (Adiciona linha).
- **Formulário Psicossocial (`/formulario-psicosocial`)** — avaliações por empregado (NR-1 2026): modelos (ex. *Questionário SIM/NÃO — Riscos Psicossociais NR-01*) ou **escala 0–10 personalizável**; Nova avaliação, folha presencial, imprimir em branco, relatório; colunas Nome · Situação · Data · Modelo · Origem · Respostas.
- **PPP (`/ppp`)** — emissão por empregado, abas Ativos · Demitidos · Transferidos; +Emitir PPP.

**Empregado — Cadastro (`+ Adicionar empregado`)**: wizard de 3 passos → **1 Dados Pessoais** (Nome*, e-mail, celular+DDI, nome social, nascimento*, gênero, tipo sanguíneo, nacionalidade*, foto) · **2 Informações Profissionais** · **3 Horários e Grupos** (GHE/ambiente/jornada). Lista de empregados tem variações por status: Ativos/Afastados/Demitidos/Transferidos/Excluídos.

**EPI (sub-itens):**
- **Visão geral (`/epis`)** — KPIs: EPIs Entregues · Eficiência · Cobertura de Risco · Trocas Antecipadas · Estoque Baixo · Prazo Monitorado · Emprestados; gráfico mensal.
- **Solicitações de troca (`/epis/solicitacoes`)** — fluxo de aprovação: abas **Pendentes · Aprovados · Negados**.
- Custos (relatório de custos) · Empréstimos (controle de empréstimo de EPI).

**Medicina:**
- **Toxicológicos (`/exames/emissao-exames-toxicologicos`)** — abas Próximos agendamentos · Agendamentos · Recibo de exames · **Certificados** (→ S-2221).
- Clínicas (`/exames/clinicas`) — credenciados para exames.

**Auditoria → Checklists** — sub-abas Checklist · Documentos; colunas Nome · Categoria · Responsável · Status · **Ações Pendentes** · Última Atualização; +Novo Checklist, Categorias, Relatório. (Template de inspeção usado pelas Auditorias.)

**Relatórios (`/relatorio/gerar-relatorios`)** — gerador: **Tipo de Relatório** (multi, com busca e Selecionar/Desmarcar todos: APR, ASOS, Agendamentos, Auditorias, Empregados Ativos/Cadastrados/Demitidos, Estoque de EPIs, Fichas Anamnese, Fichas EPIs, …) · Formato **PDF/Excel** · Período.

**Ambientes (aba em `/empresas`)** — lista: Nome · Nº de Inscrição (CNPJ) · Status (ativo) · Validade; filtros (nome/CNPJ/status/validade) + **Cadastrar Ambiente**. Os ambientes espelham os setores/GHE.

**Drive (`/drive`)** — upload de arquivos (JPG/PNG/PDF) vinculados ao empregado **pelo ID no nome do arquivo**; nesta tela do cliente, restrito a **ASO e exame toxicológico**; tabela ID · Data · Nome · Tipo · Ações.

> **CIPA (atas), detalhe de turma e Usuários do cliente** não têm registros nesta empresa (estado vazio), mas seguem os padrões já descritos (ata = formulário + participantes; turma = presença/certificado/avaliação; Usuários = mesma tela de gestão de usuários, escopo empresa).

**Conclusão da revisão:** o portal do cliente foi percorrido tela a tela; não ficou módulo relevante sem mapear. O que resta são apenas estados vazios e variações de filtro de telas já documentadas.

---

## 6. Modelo de dados inferido

### 6.1 Diagrama de relacionamentos (alto nível)

```
Consultoria ─┬─ Usuario ──N:N── Empresa          (perfil por vínculo)
             ├─ Perfil ──1:N── Permissao(modulo × acao CRUD)
             ├─ CertificadoDigital (A1 .pfx)
             ├─ Parceiro (Clinica | Contador | Medico)
             ├─ ResponsavelTecnico (CRM/CREA)
             └─ Empresa ─┬─ Estabelecimento ──1:N── Ambiente
                         ├─ GHE ─┬─N:N─ Ambiente
                         │       ├─N:N─ Funcao
                         │       ├─N:N─ Empregado (com datas)
                         │       ├─1:N─ Risco
                         │       ├─ Atividade (perigosa/insalubre + % insalubridade)
                         │       └─ MedidaControle (EPI | Exame | Treinamento)
                         ├─ Funcao ──1:N── Empregado
                         ├─ Empregado ─┬─1:N─ ASO/Exame ─── EventoeSocial(S-2220)
                         │             ├─1:N─ FichaEPI (assinatura)
                         │             ├─1:N─ Matricula(Turma) → Certificado
                         │             ├─1:N─ Ocorrencia
                         │             ├─1:N─ CAT ─── EventoeSocial(S-2210)
                         │             └─ (S-2221 toxicológico, S-2240 agentes)
                         ├─ Documento/Programa (PGR,PCMSO,LTCAT,LIP,PCA,PPR,AEP,AET,DIR,PPP)
                         ├─ CIPA, OS, APR, PT, PET, Plano de ação, Psicossocial
                         ├─ Vencimento (derivado: item+tipo+data+status)
                         └─ Fatura / MovimentacaoDeVidas
```

### 6.2 Entidades principais (campos observados)

- **Consultoria** — CNPJ, razão social, nome fantasia, inscrições, contato, site, endereço, **identidade (cor + logo, white-label)**.
- **Usuario** — nome, email, celular, **tipo** (CONSULTORIA/EMPRESA/EMPREGADO/ALUNO/CONTADOR/INSTRUTOR/PARCEIRO_SAUDE), perfil global, perfil-dentro-da-empresa, **vínculos N:N com empresas**.
- **Perfil** — nome, descrição, tipo; **Permissao** = (módulo × ação VER/CRIAR/EDITAR/EXCLUIR).
- **CertificadoDigital** — arquivo A1 (.pfx), CNPJ, validade, flag padrão.
- **Empresa** — inscrição (CNPJ/CPF/CAEPF/CNO), razão social, nome fantasia, inscrições, **CNAEs (N)**, **grau de risco (1–4)**, endereço, emails.
- **Estabelecimento** — empresa, matriz/filial, CNPJ, endereço.
- **Ambiente** — estabelecimento, nome, tipo (próprio/terceiros), início/fim, descrição; N:N Risco, N:N EPC, N:N Empregado.
- **GHE** — empresa, referência, número, processo, jornada, observações (PGR/LTCAT/PCMSO); N:N Ambiente/Função/Empregado; 1:N Risco; situação (completo/incompleto).
- **Funcao** — empresa, nome, descrição, **CBO**, vagas; N:N GHE.
- **Empregado** — empresa; *pessoais:* nome, nome social, CPF, RG, nascimento, NIS, CTPS, telefone, email, gênero, nacionalidade, tipo sanguíneo, PCD; *profissionais:* função, CBO, **categoria eSocial**, descrição de atividades, horário, regime de revezamento, matrícula, entrada; vínculos (GHE, ambiente, função); **status** (ativo/afastado/demitido/transferido/excluído); log de auditoria.
- **Risco/FatorDeRisco** — nome, **categoria** (Físico/Químico/Biológico/Ergonômico[sub]/Mecânico-Acidentes/Psicossocial/Associação/Ausência), código interno, **código Tabela 24 (eSocial)**, qualitativo (bool), perigo, fonte geradora, agravos/danos à saúde, gradação de probabilidade, classificação, aposentadoria especial, tipo de exposição, código GFIP, interpretação de resultados/LIP, utiliza EPC + eficácia, métodos/equipamento de medição, trajetória, unidade, intensidade, limite de tolerância; **flags por documento** (LIP/LTCAT/PGR/PCMSO/AEP); **camada** (eSocial/consultoria/empresa); N:N Ambiente.
- **EPI** — nome, **tipo eSocial**, **CA (número + validade)**, fabricante, periodicidade de troca (meses/dias), atenuação, alerta de estoque mínimo, situação, grades (tamanho/quantidade/custo); N:N GHE/Estabelecimento; FichaEPI (entrega/devolução + assinatura).
- **Exame / ASO** — exame (nome, tipos de ASO A/P/D/RT/MR, vínculo PCMSO); ASO (empregado, data, tipo, médico, resultado); guia; agendamento; clínica.
- **Treinamento/Curso** — nome, tipo (online/presencial), periodicidade, carga horária, **documento base (NR)**, preço; **Turma** (curso, datas, instrutor, local); Matrícula (empregado, presença, certificado); avaliação de reação.
- **Documento/Programa** — tipo, empresa/estabelecimento, modelo (PGR), identificação, anexo (quadro risco×empregado), número, **vigência (início/fim)**, revisões, empresa responsável, **responsável técnico**, descrição; (PCMSO: tipo SESMT, médico responsável, médicos examinadores).
- **CAT** — empregado, tipo, data/hora, local, parte do corpo, agente, CID, atestado → S-2210.
- **EventoeSocial** — tipo (S-2210/2220/2221/2240), empregado, status (pendente/enviado/retificado), protocolo.
- **Vencimento** — item + tipo (exame/EPI/treinamento/documento) + data + status + natureza (colaborador/ações e programas).
- **TokenAPI** — nome, validade, módulos (ler/escrever), empresas.
- **Fatura / MovimentacaoDeVidas** — empresa, mês, valor, status (pendente/aguardando/gerado/não gerado/pago).
- **Parceiro** — Clínica (nome, cidade, telefone, médicos) / Contador / Médico. **ResponsavelTecnico** — nome, tipo (médico do trabalho/engenheiro), registro (CRM/CREA). **Fabricante** (EPI). **Instrutor/Local** (treinamento).

---

## 7. Integrações e regras

### 7.1 eSocial
- **Eventos de SST:** **S-2210** (CAT) · **S-2220** (Monitoramento da Saúde / ASO) · **S-2221** (Exame Toxicológico do motorista) · **S-2240** (Condições Ambientais / Agentes Nocivos). A tela **Mensageria** (por empregado) controla geração/envio/retificação, com status por evento.
- **Certificado digital:** Configurações → eSocial → certificado **A1 (.pfx)** por CNPJ, com **validade** e flag **PADRÃO**; usado na transmissão.
- **Tabela 24:** base oficial de agentes nocivos; cada risco referencia um código T24 (formato `interno / eSocial`).

### 7.2 Catálogo de riscos (3 camadas)
eSocial (oficial, read-only) → Consultoria (padrões) → Empresa (específicos). Riscos carregam categoria, código, flags Insalubridade/Aposentadoria e aplicabilidade por documento.

### 7.3 Vigência / periodicidade / vencimentos
Documentos (PGR, PCMSO, LTCAT…), exames (por tipo de ASO), EPIs (troca) e treinamentos (periodicidade do curso) têm prazos que alimentam o motor único de **Gestão de Vencimentos** (buckets Vencidos/Hoje/Semana/120 dias; naturezas *Por colaborador* / *Ações e programas*).

### 7.4 Assinatura digital — "EsocialSign"
- **Canais de envio ao signatário:** SMS · **WhatsApp** · **E-mail** · Presencial (na hora) · Offline assistido (em breve).
- **Níveis de evidência:** Apenas Aceite → Assinatura Simples (padrão) → + Código de Verificação (OTP) → + Selfie → Forte (OTP + selfie).
- Signatários, obrigatoriedade e evidência configuráveis **por tipo de documento** (ASO, EPI, OS, Certificado de Treinamento, PPP, Checklist). Fichas de EPI e ASO suportam assinatura digital.

### 7.5 White-label & multi-tenant
Configurações → Identidade: cor e logotipo que o cliente vê. Combinado com impersonação e RBAC, cada consultoria opera sua base de empresas com identidade própria. RBAC é **efetivamente aplicado** (acessar área sem permissão retorna "Sem Permissão").

### 7.6 Configurações da consultoria (6 abas)
Identidade (white-label) · eSocial (certificado) · Assinaturas (EsocialSign) · Documentos SST (padrões dos documentos) · EPI (padrões) · Treinamentos (padrões).

### 7.7 Outras integrações
- **API de Integração** (`/api-integracao`) — tokens/credenciais de API da consultoria (detalhe a seguir).
- **PDF** — geração de documentos/fichas/ASO/relatórios em PDF e exportações Excel.
- **CA (EPIs)** — busca de Certificado de Aprovação.

---

## 8. Fluxos de negócio (passo a passo)

### 8.1 Onboarding da empresa (consultoria → nova empresa)
`Cadastrar empresa (CNPJ/CNAE/grau de risco)` → `Estabelecimentos (matriz/filiais)` → `Ambientes` → `GHE (grupos de trabalho)` → `Funções` → `Empregados`. O wizard **INSTALAÇÃO INICIAL** encadeia: Empresa → Ambientes → Riscos → Empregados → Faturamento.

### 8.2 Mapeamento de riscos (coração do sistema)
`Criar GHE` → `vincular Ambientes + Funções + Empregados` → `adicionar Riscos (do catálogo/Tabela 24, por categoria)` → `preencher dados técnicos do risco (intensidade, limite, EPC/EPI, aposentadoria…)` → `definir Medidas de Controle (EPIs, Exames, Treinamentos exigidos)` → **Aplicar GHE**. O empregado passa a **herdar** riscos e exigências.

### 8.3 Empregado → ASO (saúde ocupacional)
`Empregado (com GHE)` → exames exigidos vêm do PCMSO/GHE por tipo de ASO (A/P/D/RT/MR) → `agendar exame` → `emitir guia` → `realizar na clínica` → `emitir ASO` → **evento S-2220** na Mensageria → transmissão com certificado → **protocolo**.

### 8.4 EPI
`Cadastrar EPI (CA + validade)` → `vincular ao GHE` → exigência aparece por empregado → `gerar Ficha de EPI` → `entrega + assinatura digital` (WhatsApp/e-mail) → controle de troca/devolução por periodicidade.

### 8.5 Treinamento
Sugestão automática (derivada dos riscos) → `criar Turma (online/presencial)` → `matricular empregados` → `realizar + presença` → `emitir certificado` → `avaliação de reação`; periodicidade do curso gera vencimento.

### 8.6 Acidente → CAT
`Comunicar Acidente (dados/local/especificidades/atestado + CID)` → **evento S-2210** → transmissão → protocolo.

### 8.7 Eventos eSocial (geral)
`Empregado > Mensageria` mostra status por evento (**S-2210/2220/2221/2240**): gerar → enviar (certificado) → acompanhar **protocolo** / **retorno** (aceito ou com erro) → **retificar** quando necessário.

### 8.8 Documentos / Programas (fluxo consultoria → cliente)
Os documentos/programas (PGR, PCMSO, LTCAT, LIP, etc.) são **gerados no lado da consultoria** (`clinica.`): o gestor **entra, cria** o documento e ele passa a **aparecer na lista da consultoria**. Em seguida ele **propaga para o cliente**, que o vê na sua área de **Documentos legais** (`app. /documentos`) — visão de leitura/exportação, sem edição.
Passo a passo: `Novo <programa>` (capa + metadados + responsável técnico) → conteúdo alimentado pelo mapeamento de GHE/Riscos → gerar PDF → **vigência** (início/fim) entra na Gestão de Vencimentos → aparece na consultoria e, na sequência, no portal do cliente → assinatura (EsocialSign) quando aplicável.

> Confirma a direção do dado: **produção na consultoria, consumo no cliente**. O cliente não cria/edita o documento — recebe a versão publicada.

### 8.9 Vencimentos (motor transversal)
Exames, EPIs, treinamentos e documentos geram itens de **vencimento** (por colaborador / por ações e programas), classificados em Vencidos / Hoje / Semana / Horizonte — base do dashboard e dos alertas.

### 8.10 Portal do cliente
Consultoria concede **login tipo EMPRESA** (perfil ex.: *Empresa Completo*) vinculado à(s) empresa(s) → cliente acessa `app.` e **visualiza** gestão, **cadastra empregados**, **emite guias de exame**, acompanha vencimentos e eventos — **sem editar o mapeamento de riscos** (feito pelo gestor). Consultoria entra no cliente por **impersonação** ("Acessar" → "Voltar ao login da Consultoria").

---

## 9. Pontos de atenção para o SEU app (resumo arquitetural)

1. **Multi-tenancy** com dois contextos (consultoria / empresa) e **impersonação** com retorno seguro.
2. **RBAC** por **módulo × ação (CRUD)**, com permissões obrigatórias e ações inexistentes; perfis padrão (read-only) + customizados; vínculo **N:N usuário↔empresa** com perfil por vínculo. Enforcement real (nega acesso → "Sem Permissão").
3. **GHE como agregado central**: ambientes + funções + empregados + riscos + medidas; herança para o empregado; "Aplicar" como commit transacional.
4. **Catálogo de riscos em 3 camadas** + **Tabela 24** (código interno/eSocial) + categorias (incl. ergonômicos e psicossociais).
5. **Motor único de vencimentos/periodicidades** alimentando dashboards e alertas.
6. **eSocial** (S-2210/2220/2221/2240) com **certificado A1**, fila de envio (Mensageria), protocolo e retificação.
7. **Assinatura digital** multicanal (WhatsApp/e-mail/SMS/presencial) com níveis de evidência (aceite → OTP → selfie → forte).
8. **Integrações:** API por tokens (módulos ler/escrever, por empresa), PDF, busca de CA, white-label.
9. **Auditoria/histórico** por entidade (log de alterações) — importante para rastreabilidade legal.

## 10. Catálogo de funções por menu e submenu (handoff para desenvolvimento)

> Formato por item: **Função** (o que faz) + **Como** (como é feito na tela / fluxo / campos-chave). Preparado para servir de especificação a quem for construir o app.

### 10.A PORTAL DA CONSULTORIA (`clinica.`)

**Central de Ajuda** — Função: suporte, tutoriais, novidades. Como: artigos/vídeos + contato com suporte.

**Dashboard** — Função: visão executiva da carteira. Como: cards (Empresas ativas, Empregados, Turmas criadas, Total ASOs), gráfico EPIs/Exames/Treinamentos (12 meses), resumo de vencimentos (vencidos + por colaborador/ações) e empresas impactadas.

**Empresas** — Função: gerir todas as empresas-cliente ("Empresas que administro"), com limite de vidas do plano (ex. "X de 2000"). Como: lista (ID · Empresa/CNPJ · Filiais · Empregados · Data inclusão · Situação Liberado/Bloqueado) com filtros (nome/tipo/situação); ações **Acessar** (impersona o cliente), **+ Nova Empresa**, **Importar**, **Demissão em Lote**.

**Documentos** (programas/laudos — produzidos aqui e propagados ao cliente):
- **AEP** (`/aeps`) — Análise Ergonômica Preliminar. Como: lista + "+ Novo" com capa/estabelecimento/responsável.
- **AET** (`/aets`) — Análise Ergonômica do Trabalho. Idem padrão.
- **DIR** (`/dirs`) — Declaração/Documento de Inventário de Riscos (eSocial/NR-1).
- **LIP** (`/lip`) — Laudo de Insalubridade e Periculosidade (NR-15/NR-16).
- **LTCAT** (`/ltcats`) — Laudo Técnico das Condições Ambientais (aposentadoria especial/INSS).
- **PCA** (`/pcas/cadastrados`) — Programa de Conservação Auditiva.
- **PCMSO** (`/pcmsos`) — Programa de Controle Médico. Como: padrão + Tipo de SESMT, médico responsável, médicos examinadores.
- **PGR** (`/pgrs`) — Programa de Gerenciamento de Riscos. Como: padrão + seletor de modelo (NR-01/18/22/PGRTR-31).
- **PPR** (`/pprs`) — Programa de Proteção Respiratória.
- *Padrão comum de criação:* `escolher-empresa` → Estabelecimento · Identificação · Anexo Quadro Risco×Empregado (CPF/GHE/Função) · Informações da capa · Cadastro de elaboração (Número, Datas, Empresa responsável, Responsável técnico, Descrição). Conteúdo técnico vem do mapeamento de GHE/Riscos. Gera PDF + vigência → Vencimentos.
- **Modelos** (`/modelos`) — Função: templates reutilizáveis. Como: abas **Modelos Documentos · Modelos Checklist · Modelos de Planos de Ação** (preenchem campos rapidamente).
- **Fichas MEI** (`/fichas-mei`) — Função: biblioteca de fichas de SST simplificadas por atividade de MEI. Como: lista por atividade (nº + descrição) com download PDF.
- **Inventário de riscos** (`/inventarios-avulsos`) — Função: gerar inventário de riscos avulso. Como: seleciona Empresa → Salvar.
- **Produção por pessoa** (`/relatorios/producao-documentos`) — Função: produtividade da equipe (quantos PGR/PCMSO cada técnico elaborou/revisou por dia). Como: filtro por período (≤31 dias).

**Treinamentos**:
- **Turmas** (`/treinamentos/turmas`) — Função: sessões de treinamento. Como: lista (ID/Treinamento/Datas), +Nova Turma (Online/Presencial), export Excel/PDF.
- **Treinamentos** (`/treinamentos`) — Função: catálogo de cursos (NRs). Como: cards com período/carga horária/documento base/preço (Online e Presencial).
- **Avaliações de Reação** (`/treinamentos/avaliacoes-reacao`) — Função: analytics de eficácia (satisfação). Como: KPIs (Satisfação geral, Instrutor, Conteúdo /3.0), gráficos por categoria e distribuição, detalhamento por aluno.

**Medicina**:
- **Ocupacional (ASO)** (`/exames`) — Função: gerir exames ocupacionais e ASOs da carteira. Como: dashboard + fluxo agendamento→guia→ASO.
- **Tipos de exames** (`/exames/tipo-exames`) — Função: catálogo e matriz de exame por tipo de ASO (A/P/D/RT/MR), vinculado ao PCMSO.
- **ASO Avulso** (`/central-de-exames/grupos`) — Função: gerar ASO/fichas para pacientes/grupos avulsos. Como: grupos (Data/Grupo/Empresa/Modelo ASO); **não gera eventos eSocial** (controle interno).
- **Top Exames** (`/relatorios/top-exames`) — Função: ranking dos exames mais realizados. Como: Top 10 + totais + variação; export Excel.

**Drive** (`/drive`) — Função: arquivos da consultoria. Como: upload/organização de documentos.

**Relatórios** (`/relatorio/gerar-relatorios`) — Função: gerador de relatórios gerenciais. Como: seleção de tipo(s) + formato (PDF/Excel) + período.

**Gestão de Vencimentos** (`/gestao-vencimentos`) — Função: painel consolidado de prazos de **todas** as empresas. Como: visões Colunas/Lista/Consolidado, naturezas (colaborador/ações e programas), buckets (vencidos/hoje/semana/horizonte), filtros `?natureza=&bucket=`.

**API de Integração** (`/api-integracao`) — Função: conectar sistemas externos (ERP/folha) ao eSocial Brasil. Como: tokens (nome, validade, módulos ler/escrever, empresas); habilitação via suporte.

**Financeiro** (`/pagamentos`) — Função: pagamentos/cobrança da consultoria. Como: faturas/boletos por status.

**Catálogo de Riscos** (`/riscos`) — Função: base de riscos/agentes. Como: camadas eSocial/Consultoria/Empresa; cadastrar risco (wizard 4 passos com Tabela 24 + categorias).

**Gerenciar Cadastro** (`/editar-consultoria/{id}`) — Função: dados e registros de apoio da consultoria. Como: abas Dados · Parceiros (Clínicas/Contadores/Médicos) · Responsáveis Técnicos · Instrutores/Locais.

**Usuários** (`/usuarios`) — Função: gestão de usuários e vínculos. Como: escopos Consultoria/Empresa; modal Cadastrar (nome/email/celular/perfil/perfil-nas-empresas/empresas vinculadas).

**Permissões**:
- **Perfis de Acesso** (`/perfis-acesso`) — Função: pacotes de permissão por tipo de usuário. Como: lista + editor (tipos de usuário + matriz módulo×ação).
- **Matriz de Acesso** — Função: visualizar/ajustar permissões módulo×ação. Como: grade VER/CRIAR/EDITAR/EXCLUIR por módulo.

**Configurações** (`/configuracoes`) — Função: parâmetros da conta. Como: abas Identidade (white-label) · eSocial (certificado A1) · Assinaturas (EsocialSign: canais + evidência + por documento) · Documentos SST · EPI · Treinamentos.

**Movimentações de vidas** (`/movimentacoes-vidas`) — Função: histórico da quantidade de vidas por empresa (base do faturamento). Como: filtros data/tipo.

**Equipamentos** (`/equipamentos`) — Função: instrumentos de medição da consultoria + calibração. Como: lista (equipamento/realizado/próxima/situação/nº série/patrimônio/certificado), KPIs Vencidos/A vencer, + Cadastrar.

### 10.B PORTAL DO CLIENTE (`app.`) — resumo função/como
(Detalhe completo nas seções 5.1–5.14; aqui a leitura por menu.)

- **Dashboard** — cobertura geral (EPIs/Exames/Treinamentos) + próximas atividades + vencimentos.
- **Empresa › Ambientes e Estabelecimentos** — gerir estabelecimentos (matriz/filiais) e ambientes (com riscos/EPC/empregados). **› GHE** — mapear grupos (wizard 5 etapas). **› Funções** — cargos↔GHE.
- **Empregados › Ativos/Afastados/Demitidos/Transferidos/Excluídos** — gerir colaboradores (ficha 5 abas); modo **Gestão** (conformidade) e **Mensageria** (eventos eSocial S-2210/2220/2221/2240).
- **Documentos › legais** (ver/exportar) **· Plano de ação** (cronograma eSocial/5W2H/PGR) **· OS** (por setor) **· Psicossocial** (NR-1) **· APR · CAT (S-2210) · PPP · PT · PET**.
- **Treinamentos › Visão geral** (sugestões automáticas) **· Cursos · Turmas** (presença/certificado).
- **Medicina › Visão geral · ASO** (agendamento→guia→ASO→S-2220) **· Toxicológicos** (S-2221) **· Tipos · Clínicas**.
- **EPI › Visão geral · Ficha** (assinatura digital) **· Estoque** (CA) **· Custos · Solicitações** (aprovação) **· Empréstimos**.
- **CIPA › Processos/Eleição/Posse/Reuniões/Calendário** (NR-5 + assédio).
- **Auditoria/Checklist** — auditorias + templates de checklist.
- **Catálogo de Riscos** (3 camadas) · **Drive** (upload ASO/toxicológico por ID) · **Relatórios** (multi-tipo, PDF/Excel) · **Gestão de Vencimentos** · **Financeiro** (faturamento da empresa).

---

## 11. Lacunas e decisões de desenvolvimento — instruções ao Claude Code

> Esta seção transforma o levantamento em plano de trabalho. O que o mapeamento do concorrente **não** fornece está marcado com a fonte correta de cada coisa.

### 11.1 Recorte do produto — construir em FASES (não clonar tudo de uma vez)

- **Fase 0 — Fundação:** multi-tenant (Consultoria → Empresa → Estabelecimento), autenticação, **RBAC módulo×ação (CRUD)** com perfis padrão + customizados e vínculo N:N usuário↔empresa, trilha de auditoria por entidade, white-label básico (cor/logo).
- **Fase 1 — Núcleo SST:** Empresas/Estabelecimentos/Ambientes → **GHE (wizard 5 etapas)** → Funções → Empregados (ficha 5 abas) → **Catálogo de riscos em 3 camadas + Tabela 24** → **motor único de Vencimentos**. *(É o coração; ver seções 5.1–5.4 e 8.2.)*
- **Fase 2 — Medicina + Documentos base:** Tipos de exame (matriz A/P/D/RT/MR), fluxo agendamento → guia → ASO; geração de **PGR e PCMSO** (capa/metadados/vigência → PDF).
- **Fase 3 — eSocial:** eventos **S-2210, S-2220, S-2221, S-2240**, certificado A1, tela Mensageria (status por empregado), protocolo/retorno/retificação.
- **Fase 4 — Complementos:** EPI (CA, estoque, fichas com assinatura digital), Treinamentos (cursos/turmas/certificados/avaliação de reação), CIPA, Auditoria/Checklist, demais laudos (LTCAT, LIP, PPR, PCA, AEP, AET, DIR), PPP, Formulário Psicossocial, CAT completo.
- **Fase 5 — Abertura:** portal do cliente (visão restrita + impersonação consultoria→cliente), API pública por tokens (módulos ler/escrever × empresas), relatórios gerenciais, financeiro/controle de vidas.

### 11.2 Documentos gerados (PDFs) — fonte: NRs + modelos do dono
Este documento mapeia os **formulários de entrada**, não o conteúdo dos PDFs gerados (seções do PGR, layout do ASO, ficha de EPI etc.). **Não copiar os layouts do concorrente.** Construir os templates a partir das **Normas Regulamentadoras** e dos **modelos próprios que o Haroldo fornecerá** (ele já possui modelos de PPP, contratos e laudos).

### 11.3 Camada técnica do eSocial — fonte: documentação oficial do governo
Este documento diz **quais** eventos e **onde** são disparados. Os **leiautes XML (versão S-1.3), webservices de envio/consulta de lotes, assinatura com certificado A1, protocolo/recibo, regras de retificação e códigos de erro** devem ser implementados a partir da documentação oficial do eSocial (gov.br), não daqui.

### 11.4 Periodicidades e prazos — PARAMETRIZÁVEIS, nunca hardcoded
Intervalos de exame por tipo de ASO (NR-7), validade/reciclagem de treinamentos por NR, periodicidade de troca de EPI, vigência de documentos (1 ano PCMSO, 2 anos PGR etc.): implementar como **tabelas de configuração por tenant**, com valores fornecidos/validados pelo dono do produto.

### 11.5 Stack sugerida (decisão final com o dono)
Sugestão: **Supabase** (Postgres com **RLS** para o escopo multi-tenant — policies por `consultoria_id`/`empresa_id` —, Auth, Storage para PDFs/arquivos) + frontend web (ex.: Next.js/React). **Impersonação** = sessão com claim de "empresa ativa" + registro em auditoria + botão de retorno (nunca troca real de credencial). O RBAC deve ser aplicado no backend (como no concorrente: rota sem permissão → bloqueio), nunca só escondendo menu.

### 11.6 LGPD — requisito de arquitetura, não feature
O app tratará **dados de saúde de trabalhadores = dado pessoal sensível (art. 11, LGPD)**: criptografia em trânsito e repouso, trilha de auditoria por entidade (como a aba Histórico do empregado, seção 5.1), minimização de acesso por perfil, política de retenção/exclusão, base legal documentada e termos com as empresas clientes (operador × controlador).

### 11.7 Itens não abertos tela a tela (não bloqueiam)
Os 7 laudos (AEP/AET/DIR/LIP/LTCAT/PCA/PPR) seguem o padrão de criação do PGR/PCMSO (seção 5.12); Matriz de Acesso, Central de Ajuda e Drive/Financeiro da consultoria estão descritos funcionalmente (seção 10.A). Nenhum deles bloqueia o início do desenvolvimento.

### 11.8 O que NÃO fazer
Não copiar código, layout visual, textos, imagens, marca ou identidade do sistema analisado; não reproduzir dados pessoais em seeds/testes (usar dados fictícios); não transmitir eventos ao eSocial real durante o desenvolvimento (usar ambiente de produção restrita/testes do governo).

---

*Fim do levantamento. Documento montado a partir de observação de estrutura, sem reprodução de código, marca ou dados pessoais (LGPD). Pronto para handoff ao Claude Code: começar pela seção "COMO USAR" no topo e pela Fase 0 da seção 11.1.*
