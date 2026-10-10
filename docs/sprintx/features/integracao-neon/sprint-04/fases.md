---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: integracao-neon
sprint_id: sprint-04
atualizado_em: 2026-10-10
fases:
  - id: F-04.1
    titulo: Migrar contextos e UI
    status: concluida
    criterio_saida: Inicio, Parcelas e Caixinhas leem e escrevem na Function real com os 4 estados de tela
    paralelizavel: false
    paralela_com: []
    tasks: [T-04.01, T-04.02, T-04.03, T-04.04]
---

# Fases — Sprint 04

```mermaid
%% Grafo de tasks — sprint-04 — gerado pela sprintx a partir de tasks.md
flowchart LR
  subgraph fase_04_1["F-04.1 — Migrar contextos e UI"]
    T_04_01["T-04.01<br/>Client HTTP autenticado"]
    T_04_02["T-04.02<br/>Migrar Lancamentos"]
    T_04_03["T-04.03<br/>Migrar Caixinhas"]
    T_04_04["T-04.04<br/>Estados de carregando/erro"]
  end

  T_04_01 --> T_04_02
  T_04_01 --> T_04_03
  T_04_02 --> T_04_04
  T_04_03 --> T_04_04

  classDef concluida fill:#d4f4dd,stroke:#2e7d32,color:#1b3d20
  classDef andamento fill:#fff3cd,stroke:#b8860b,color:#4a3800
  classDef bloqueada fill:#f8d7da,stroke:#c62828,color:#4a1d1f
  classDef pendente  fill:#eceff1,stroke:#78909c,color:#263238
  classDef critico   stroke-width:3px

  class T_04_01 concluida
  class T_04_02 concluida
  class T_04_03 concluida
  class T_04_04 concluida
  class T_04_01,T_04_02,T_04_04 critico
```

---

## F-04.1 — Migrar contextos e UI

**Objetivo:** Trocar `LancamentosProvider`/`CaixinhasProvider` pela Function real e acrescentar
os estados de carregando/erro/vazio/populado nas três telas de dados.

**Tasks que a compõem:** T-04.01, T-04.02, T-04.03, T-04.04

**Critério de saída:** Início, Parcelas e Caixinhas leem e escrevem na Function real,
sobrevivendo a reload, com os 4 estados de tela.

**Roda em paralelo com:** nenhuma
