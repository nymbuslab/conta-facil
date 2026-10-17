---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: dashboard-extrato
sprint_id: sprint-03
atualizado_em: 2026-10-17
fases:
  - id: F-03.1
    titulo: Sheet e MenuMais
    status: concluido
    criterio_saida: sheet.test.tsx e menu-mais.test.tsx passam cobrindo abrir, fechar, navegar e sair
    paralelizavel: false
    paralela_com: []
    tasks: [T-03.01, T-03.02]
  - id: F-03.2
    titulo: BottomNav com 5 itens
    status: concluido
    criterio_saida: bottom-nav.test.tsx e perfil.test.tsx passam com a navegacao nova
    paralelizavel: false
    paralela_com: []
    tasks: [T-03.03, T-03.04]
---

# Fases — Sprint 03

```mermaid
%% Grafo de tasks — sprint-03 — gerado pela sprintx a partir de tasks.md
flowchart LR
  subgraph fase_03_1["F-03.1 — Sheet e MenuMais"]
    T_03_01["T-03.01<br/>Sheet novo"]
    T_03_02["T-03.02<br/>MenuMais"]
  end
  subgraph fase_03_2["F-03.2 — BottomNav com 5 itens"]
    T_03_03["T-03.03<br/>BottomNav 5 itens"]
    T_03_04["T-03.04<br/>perfil.test atualizado"]
  end
  T_03_01 --> T_03_02
  T_03_01 --> T_03_03
  T_03_02 --> T_03_03
  T_03_03 --> T_03_04

  classDef concluida fill:#d4f4dd,stroke:#2e7d32,color:#1b3d20
  classDef andamento fill:#fff3cd,stroke:#b8860b,color:#4a3800
  classDef bloqueada fill:#f8d7da,stroke:#c62828,color:#4a1d1f
  classDef pendente  fill:#eceff1,stroke:#78909c,color:#263238
  classDef critico   stroke-width:3px

  class T_03_01 concluida
  class T_03_02 concluida
  class T_03_03 concluida
  class T_03_04 concluida
  class T_03_01,T_03_02,T_03_03,T_03_04 critico
```

> Um bloco por fase. O paralelismo declarado aqui é definitivo.

---

## F-03.1 — Sheet e MenuMais

**Objetivo:** Construir o primitivo de gaveta lateral (`Sheet`) e o componente `MenuMais` com os
links de navegação e a ação de sair.

**Tasks que a compõem:** T-03.01, T-03.02

**Critério de saída:** `sheet.test.tsx` cobre abrir/fechar; `menu-mais.test.tsx` cobre navegação
e logout direto.

**Roda em paralelo com:** nenhuma

---

## F-03.2 — BottomNav com 5 itens

**Objetivo:** Plugar o `MenuMais` no `BottomNav`, atualizando a barra para 5 itens e corrigindo
o teste de `/perfil` que hoje espera `Perfil` na barra inferior.

**Tasks que a compõem:** T-03.03, T-03.04

**Critério de saída:** `bottom-nav.test.tsx` e `perfil.test.tsx` passam com a navegação nova.

**Roda em paralelo com:** nenhuma
