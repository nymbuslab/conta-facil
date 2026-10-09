---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: navegacao-inferior
sprint_id: sprint-01
atualizado_em: 2026-10-08
fases:
  - id: F-01.1
    titulo: Configurar harness de teste
    status: concluido
    criterio_saida: npm run test -- --run termina com 0 failed e ao menos 1 passed
    paralelizavel: false
    paralela_com: []
    tasks: [T-01.01, T-01.02, T-01.03]
---

# Fases — Sprint 01

```mermaid
%% Grafo de tasks — sprint-01 — gerado pela sprintx a partir de tasks.md
flowchart LR
  subgraph fase_01_1["F-01.1 — Configurar harness de teste"]
    T_01_01["T-01.01<br/>Instalar e configurar…"]
    T_01_02["T-01.02<br/>Setup do Testing…"]
    T_01_03["T-01.03<br/>Smoke test do Header"]
  end

  T_01_01 --> T_01_02
  T_01_02 --> T_01_03

  classDef concluida fill:#d4f4dd,stroke:#2e7d32,color:#1b3d20
  classDef andamento fill:#fff3cd,stroke:#b8860b,color:#4a3800
  classDef bloqueada fill:#f8d7da,stroke:#c62828,color:#4a1d1f
  classDef pendente  fill:#eceff1,stroke:#78909c,color:#263238
  classDef critico   stroke-width:3px

  class T_01_01 concluida
  class T_01_02 concluida
  class T_01_03 concluida
  class T_01_01,T_01_02,T_01_03 critico
```

---

## F-01.1 — Configurar harness de teste

**Objetivo:** Instalar Vitest + Testing Library, configurar o ambiente jsdom e provar com um smoke test real que a suíte roda.

**Tasks que a compõem:** T-01.01, T-01.02, T-01.03

**Critério de saída:** `npm run test -- --run` termina com 0 failed e ao menos 1 passed.

**Roda em paralelo com:** nenhuma
