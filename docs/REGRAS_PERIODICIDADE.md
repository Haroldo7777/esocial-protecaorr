# Regras de periodicidade e vigência (domínio SST)

> Definido pelo Haroldo (eng. de segurança do trabalho, autoridade de domínio).
> **Princípio:** nada é fixo no código. As periodicidades/vigências são
> **parametrizáveis por cliente** e definidas **na prescrição** (exames, EPI,
> treinamentos) e **na emissão** (documentos/programas). Os valores abaixo são os
> **padrões de referência**, pré-preenchidos e editáveis por cliente/caso.

## Vigência dos documentos / programas (padrão)

| Documento | Vigência padrão | Observação |
|---|---|---|
| PCMSO | 1 ano | fixo (padrão) |
| LTCAT | 1 ano | padrão |
| LIP   | 1 ano | padrão |
| PPR   | 1 ano | padrão |
| PCA (Conservação Auditiva) | 1 ano | *o Haroldo escreveu "PPA" — confirmar se é o PCA* |
| **PGR**   | **variável: 1 ou 2 anos** | definido por cliente na emissão |
| **PGRTR** | **variável: 1 ou 2 anos** | PGR rural (NR-31); idem variável |

> PGR tem modelos (NR-01, NR-18 construção, NR-22 mineração, PGRTR NR-31); a
> vigência (1 ou 2 anos) é escolhida na emissão de cada documento.

## Exames, EPI e treinamentos

- **Exames (ASO):** periodicidade por **função/risco** (base NR-7), definida na
  **prescrição do PCMSO** (por tipo de ASO A/P/D/RT/MR). Não hardcoded.
- **EPI:** periodicidade de **troca** definida no cadastro/prescrição do EPI
  (meses/dias) — por GHE/empregado.
- **Treinamentos:** periodicidade/reciclagem vem do **curso (NR)** — definida no
  catálogo de treinamentos e aplicada por GHE/empregado.

## Como isso entra no sistema (plano)

1. **Cada documento/prescrição guarda a própria vigência/periodicidade** (campo
   `vigencia_meses` / `periodicidade_meses`), escolhida na criação, com o padrão
   acima pré-preenchido (e PGR/PGRTR pedindo 1 ou 2).
2. Uma **config de padrões por consultoria/cliente** permite ajustar os valores
   pré-preenchidos sem mexer no código.
3. O **motor de vencimentos** calcula o prazo = data base (emissão/realização) +
   vigência/periodicidade do próprio item. Ele **lê desses parâmetros**, nunca de
   valores fixos.

> Conclusão: o motor de vencimentos e as periodicidades concretas entram junto
> com a **Fase 2 (prescrições: exames/PCMSO, documentos/programas)** e a **Fase 4
> (EPI/treinamentos)**, onde cada item define a sua vigência. Até lá, o schema já
> prevê os campos de periodicidade (`funcao.aso_periodicidade_meses`,
> `medida_controle.periodicidade_meses`, `vencimento.data_prazo`).
