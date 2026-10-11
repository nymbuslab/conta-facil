---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: rollout-neon-production
sprint_id: sprint-01
atualizado_em: 2026-10-11
fases:
  - id: F-01.1
    titulo: Harness de verificacao de production
    status: concluida
    criterio_saida: VERIFICACAO.md e CHECKLIST-GOLDEN-PATH.md existem com passos verificaveis
    paralelizavel: false
    paralela_com: []
    tasks: [T-01.01, T-01.02]
---

# Fases — Sprint 01

```mermaid
%% Grafo de tasks — sprint-01 — gerado pela sprintx a partir de tasks.md
flowchart LR
  subgraph fase_01_1["F-01.1 — Harness de verificacao de production"]
    T_01_01["T-01.01<br/>Harness de verificacao HTTP"]
    T_01_02["T-01.02<br/>Checklist golden path"]
  end

  classDef concluida fill:#d4f4dd,stroke:#2e7d32,color:#1b3d20
  classDef andamento fill:#fff3cd,stroke:#b8860b,color:#4a3800
  classDef bloqueada fill:#f8d7da,stroke:#c62828,color:#4a1d1f
  classDef pendente  fill:#eceff1,stroke:#78909c,color:#263238
  classDef critico   stroke-width:3px

  class T_01_01 concluida
  class T_01_02 concluida
  class T_01_01 critico
```

> Um bloco por fase. O paralelismo declarado aqui é definitivo: a execução nunca decide paralelismo sozinha.

---

## F-01.1 — Harness de verificação de production

**Objetivo:** Preparar o roteiro de verificação HTTP e o checklist manual do golden path, sem tocar em `production`.

**Tasks que a compõem:** T-01.01, T-01.02

**Critério de saída:** `VERIFICACAO.md` e `CHECKLIST-GOLDEN-PATH.md` existem com passos verificáveis.

**Roda em paralelo com:** nenhuma
