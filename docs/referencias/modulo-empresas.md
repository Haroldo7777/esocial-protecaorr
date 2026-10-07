# Referência funcional — Módulo "Empresas"

Mapeamento feito pelo Haroldo por navegação real no sistema de referência
(portal clínica/consultoria), out/2026. Uso: referência **funcional** para o
módulo Empresas do Auditor (o que a tela faz, quais campos e fluxos existem).
Design, textos e código do Auditor são próprios.

## 1. Tela de lista ("empresas que administro")

- Cota do plano no topo: o limite é por **empregados** (ex.: 1.085 de 2.000), não por empresas.
- Filtros: busca por nome, tipo de empresa, situação + botões **Exportar** e **Demissão em lote**.
- Colunas: ID | Nome fantasia + Razão social + nº de inscrição | Nº de empregados |
  Data de inclusão | Situação (Liberado 🟢 / Bloqueado 🔴) | **Acessar** | menu **⋮**.
- Link "Filiais" quando a empresa tem estrutura matriz/filial.
- Indicadores ao lado do nome: modalidade **Gestão Completa** vs **criada por
  link / somente treinamentos**.

## 2. Três formas de cadastrar

1. **+ Nova Empresa** → modalidades: Gestão Completa (SST completo) ou Somente Treinamentos.
2. **Importar** (em massa, por planilha), 3 passos: Importar lista → Combinar campos →
   Progresso. Define tipo das empresas, tipo de inscrição (CNPJ/CPF) e usuários da
   consultoria com acesso. Tem "Baixar modelo" e "Instruções".
3. **Convidar por link**: gera link de auto-cadastro para o cliente preencher os
   próprios dados (exige aceitar termos de uso antes de copiar o link).

## 3. Assistente "Instalação Inicial" (Gestão Completa) — 5 etapas

Stepper: **1 Empresa → 2 Ambientes → 3 Riscos → 4 Empregados → 5 Faturamento**

### Etapa 1 — Empresa (única antes do "Cadastrar")
- Permissões: usuários da consultoria com acesso à empresa.
- Dados: tipo de inscrição **CNPJ / CPF / CAEPF / CNO** (cobre produtor rural e
  obra), e-mail da empresa, e-mail de cobrança, razão social, nome fantasia,
  inscrição estadual, inscrição municipal, telefone, site, CNAEs,
  **grau de risco (1 a 4)**.
- Endereço: CEP, rua, número, complemento, bairro, cidade, UF + observações.
- Dados de acesso do cliente (cria o login): responsável, e-mail (login; se já
  existe, só vincula), celular, senha, CPF, upload de assinatura.
- Checkbox de termos de uso → **Cadastrar**.

### Etapas 2–5
Continuam dentro do portal da empresa após o cadastro. O dashboard da empresa
mostra o medidor **"Progresso de Configuração" (%)** com o mesmo stepper.

## 4. Pós-cadastro

- **Acessar** = entrar no portal da empresa como aquele cliente; link de voltar
  à consultoria no topo.
- Menu do portal da empresa: Empresa (Ambientes e Estabelecimentos / GHE /
  Funções), Empregados, Documentos, Treinamentos, Medicina, EPI, CIPA,
  Auditoria/Checklist, Catálogo de Riscos, Drive, Relatórios, Gestão de
  Vencimentos, Financeiro, Gerenciar Cadastros.
- Dashboard da empresa: cobertura geral (EPIs, exames, treinamentos em %),
  gestão de vencimentos, GHE (segmentações) e eventos eSocial
  S-2210/2220/2221/2240 (meta: 100% enviados).
- Menu ⋮ na lista: Excluir | Bloquear | Copiar Ambientes/GHE (reaproveita
  estrutura de outra empresa) | Ocultar dados financeiros | Alterar p/ somente
  treinamentos.

## 5. Fluxo resumido

Cadastrar (manual, planilha ou link) → empresa nasce **Bloqueado** até concluir
a instalação → Ambientes/GHE → Riscos → Empregados → Faturamento → empresa
**Liberado**, alimentando ASOs, treinamentos e eventos eSocial.
