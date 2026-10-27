# Seeds

## Tabela 24 do eSocial (Agentes Nocivos / Fatores de Risco)

Dados **oficiais** do eSocial, carregados como camada `esocial` do catálogo de
riscos (somente leitura no app). Fonte autoritativa:

> gov.br → eSocial → Documentação técnica → Leiautes do eSocial → **Tabelas** → **Tabela 24**
> (https://www.gov.br/esocial/pt-br/documentacao-tecnica/leiautes-esocial-html/tabelas.html)

### Como atualizar

1. Baixe a Tabela 24 oficial e preencha `tabela24_esocial.csv` com as colunas:
   `codigo,categoria,nome`
   - `codigo` — código oficial (ex.: `01.01.001`)
   - `categoria` — grupo (Físico, Químico, Biológico, …)
   - `nome` — descrição oficial do agente/fator
2. Gere o SQL:
   ```bash
   node scripts/gerar-seed-tabela24.mjs
   ```
   Isso recria `tabela24_esocial.sql` (um `DELETE` da camada eSocial + `INSERT`s,
   idempotente).
3. Aplique no banco quando ele estiver conectado (no lançamento), via
   `supabase db execute` / painel SQL do Supabase, ou rode o SQL direto.

> Nada aqui é copiado de sistema de terceiros — apenas a tabela pública oficial
> do eSocial.
