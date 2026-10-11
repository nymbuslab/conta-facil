---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: rollout-neon-production
sprint_id: sprint-04
atualizado_em: 2026-10-11
fases:
  - id: F-04.1
    titulo: Golden path e encerramento
    status: concluida
    criterio_saida: Checklist passa inteiro e a documentacao viva reflete o rollout concluido
    paralelizavel: false
    paralela_com: []
    tasks: [T-04.01, T-04.02]
---

# Fases — Sprint 04

```mermaid
%% Grafo de tasks — sprint-04 — gerado pela sprintx a partir de tasks.md
flowchart LR
  subgraph fase_04_1["F-04.1 — Golden path e encerramento"]
    T_04_01["T-04.01<br/>Executar golden path"]
    T_04_02["T-04.02<br/>Atualizar documentacao…"]
  end
  T_04_01 --> T_04_02

  classDef concluida fill:#d4f4dd,stroke:#2e7d32,color:#1b3d20
  classDef andamento fill:#fff3cd,stroke:#b8860b,color:#4a3800
  classDef bloqueada fill:#f8d7da,stroke:#c62828,color:#4a1d1f
  classDef pendente  fill:#eceff1,stroke:#78909c,color:#263238
  classDef critico   stroke-width:3px

  class T_04_01 concluida
  class T_04_02 concluida
  class T_04_01,T_04_02 critico
```

> Um bloco por fase. O paralelismo declarado aqui é definitivo: a execução nunca decide paralelismo sozinha.

---

## F-04.1 — Golden path e encerramento

**Objetivo:** Validar o fluxo completo em produção real e fechar a documentação viva.

**Tasks que a compõem:** T-04.01, T-04.02

**Critério de saída:** Checklist passa inteiro e a documentação viva reflete o rollout concluído.

**Roda em paralelo com:** nenhuma
