# Seeds — catálogo inicial

Nomenclatura técnica de SST (agentes de risco da **Tabela 24 do eSocial** e tipos
de exame ocupacional). São dados técnicos/públicos — **não** código, layout, textos
de produto ou marca de terceiro.

## Fontes de verdade (CSV, versionadas)

| Arquivo | Conteúdo | Vira |
|---|---|---|
| `riscos_esocial.csv` | 919 agentes nocivos (Tabela 24), `nome,categoria,nome_esocial,codigo` | `risco_catalogo` camada **eSocial** |
| `riscos_consultoria.csv` | Riscos próprios da consultoria | `risco_catalogo` camada **consultoria** |
| `exames.csv` | 10 tipos de exame, `nome,A,P,D,RT,MR` | `exame_tipo` |

## Gerar os SQLs

```bash
node scripts/gerar-seed-tabela24.mjs
```
Gera (idempotentes):
- `riscos_esocial.sql` — `DELETE` da camada eSocial + `INSERT` dos 919.
- `riscos_consultoria.sql` — insere para cada consultoria (guarda `NOT EXISTS`).
- `exames.sql` — insere para cada consultoria (`ON CONFLICT (consultoria_id, nome)`).

## Aplicar (no lançamento, com o banco conectado)

1. Rode as migrations (`0001`…`0007`). A `0007` adiciona `risco_catalogo.nome_esocial`.
2. Rode `riscos_esocial.sql` (independe de haver consultoria).
3. Crie a consultoria (Auth/onboarding).
4. Rode `exames.sql` e `riscos_consultoria.sql` (populam por consultoria).

> Códigos da Tabela 24: 120 dos 919 agentes têm código oficial (`01.03.001` etc.);
> os demais são agentes sem código próprio na tabela (campo vazio).
