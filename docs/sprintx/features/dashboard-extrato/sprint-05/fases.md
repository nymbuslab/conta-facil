---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: dashboard-extrato
sprint_id: sprint-05
atualizado_em: 2026-10-17
fases:
  - id: F-05.1
    titulo: Lista com abas e composicao
    status: concluido
    criterio_saida: extrato-lista.test.tsx e extrato.test.tsx passam cobrindo abas, busca, mes e FAB
    paralelizavel: false
    paralela_com: []
    tasks: [T-05.01, T-05.02]
  - id: F-05.2
    titulo: Skeleton
    status: concluido
    criterio_saida: Skeleton proprio do Extrato aparece so na primeira carga sem dados
    paralelizavel: false
    paralela_com: []
    tasks: [T-05.03]
---

# Fases — Sprint 05

```mermaid
%% Grafo de tasks — sprint-05 — gerado pela sprintx a partir de tasks.md
flowchart LR
  subgraph fase_05_1["F-05.1 — Lista com abas e composicao"]
    T_05_01["T-05.01<br/>ExtratoLista com abas"]
    T_05_02["T-05.02<br/>extrato.tsx completo"]
  end
  subgraph fase_05_2["F-05.2 — Skeleton"]
    T_05_03["T-05.03<br/>Skeleton do Extrato"]
  end
  T_05_01 --> T_05_02
  T_05_02 --> T_05_03

  classDef concluida fill:#d4f4dd,stroke:#2e7d32,color:#1b3d20
  classDef andamento fill:#fff3cd,stroke:#b8860b,color:#4a3800
  classDef bloqueada fill:#f8d7da,stroke:#c62828,color:#4a1d1f
  classDef pendente  fill:#eceff1,stroke:#78909c,color:#263238
  classDef critico   stroke-width:3px

  class T_05_01 concluida
  class T_05_02 concluida
  class T_05_03 concluida
  class T_05_01,T_05_02,T_05_03 critico
```

> Um bloco por fase. O paralelismo declarado aqui é definitivo.

---

## F-05.1 — Lista com abas e composição

**Objetivo:** Criar o componente de lista com abas e compor `extrato.tsx` com busca, mês,
abas e FAB.

**Tasks que a compõem:** T-05.01, T-05.02

**Critério de saída:** `extrato.test.tsx` cobre busca, navegação de mês, alternância de abas e
abertura do modal de registrar.

**Roda em paralelo com:** nenhuma

---

## F-05.2 — Skeleton

**Objetivo:** Dar ao Extrato um skeleton fiel ao layout novo (busca + mês + abas + lista),
seguindo o mesmo padrão já usado para Caixinhas e para o dashboard.

**Tasks que a compõem:** T-05.03

**Critério de saída:** O skeleton aparece só na primeira carga sem dados, igual ao padrão
já estabelecido no projeto.

**Roda em paralelo com:** nenhuma
