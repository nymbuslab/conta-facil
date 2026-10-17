---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: editar-excluir-lancamentos
sprint_id: sprint-05
atualizado_em: 2026-10-17
fases:
  - id: F-05.1
    titulo: Aviso de despesa paga
    status: concluido
    criterio_saida: AcoesLancamentoDialog avisa quando a despesa editada/excluida ja foi paga
    paralelizavel: false
    paralela_com: []
    tasks: [T-05.01]
---

# Fases — Sprint 05

```mermaid
%% Grafo de tasks — sprint-05 — gerado pela sprintx a partir de tasks.md
flowchart LR
  subgraph fase_05_1["F-05.1 — Aviso de despesa paga"]
    T_05_01["T-05.01<br/>Aviso de despesa ja…"]
  end

  classDef concluida fill:#d4f4dd,stroke:#2e7d32,color:#1b3d20
  classDef andamento fill:#fff3cd,stroke:#b8860b,color:#4a3800
  classDef bloqueada fill:#f8d7da,stroke:#c62828,color:#4a1d1f
  classDef pendente  fill:#eceff1,stroke:#78909c,color:#263238
  classDef critico   stroke-width:3px

  class T_05_01 pendente
  class T_05_01 critico
```

> Um bloco por fase. O paralelismo declarado aqui é definitivo: a execução nunca decide paralelismo sozinha.

---

## F-05.1 — Aviso de despesa paga

**Objetivo:** Avisar no diálogo que a despesa já foi paga e que a mudança afeta o Total Pago.

**Tasks que a compõem:** T-05.01

**Critério de saída:** `AcoesLancamentoDialog` avisa quando a despesa editada/excluída já foi paga.

**Roda em paralelo com:** nenhuma
