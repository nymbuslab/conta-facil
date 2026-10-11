---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: rollout-neon-production
sprint_id: sprint-05
atualizado_em: 2026-10-11
fases:
  - id: F-05.1
    titulo: Convergencia, rodada 1
    status: concluida
    criterio_saida: Os 3 achados C-01, C-02, C-03 de 00-CONVERGENCIA.md deixam de ser verdade
    paralelizavel: false
    paralela_com: []
    tasks: [T-05.01, T-05.02, T-05.03]
---

# Fases — Sprint 05

```mermaid
%% Grafo de tasks — sprint-05 — gerado pela sprintx a partir de tasks.md
flowchart LR
  subgraph fase_05_1["F-05.1 — Convergencia, rodada 1"]
    T_05_01["T-05.01<br/>Destravar o .example do git"]
    T_05_02["T-05.02<br/>Corrigir VERIFICACAO.md"]
    T_05_03["T-05.03<br/>Corrigir fonte do ROLLBACK.md"]
  end

  classDef concluida fill:#d4f4dd,stroke:#2e7d32,color:#1b3d20
  classDef andamento fill:#fff3cd,stroke:#b8860b,color:#4a3800
  classDef bloqueada fill:#f8d7da,stroke:#c62828,color:#4a1d1f
  classDef pendente  fill:#eceff1,stroke:#78909c,color:#263238
  classDef critico   stroke-width:3px

  class T_05_01 concluida
  class T_05_02 concluida
  class T_05_03 concluida
```

> Um bloco por fase. O paralelismo declarado aqui é definitivo: a execução nunca decide paralelismo sozinha.

---

## F-05.1 — Convergência, rodada 1

**Objetivo:** Corrigir os 3 achados ALTA/MÉDIA da conferência de convergência rodada 1.

**Tasks que a compõem:** T-05.01, T-05.02, T-05.03

**Critério de saída:** Os achados C-01, C-02 e C-03 de `00-CONVERGENCIA.md` deixam de ser verdade.

**Roda em paralelo com:** nenhuma
