---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: idempotencia-escrita-financeira
sprint_id: sprint-01
atualizado_em: 2026-10-11
fases:
  - id: F-01.1
    titulo: Fixtures idempotentes
    status: concluido
    criterio_saida: O helper produz a mesma chave em repeticoes e payloads distintos para conflito
    paralelizavel: false
    paralela_com: []
    tasks: [T-01.01]
---

```mermaid
%% Grafo de tasks - sprint-01 - gerado pela sprintx a partir de tasks.md
flowchart LR
  subgraph fase_01_1["F-01.1 - Fixtures idempotentes"]
    T_01_01["T-01.01<br/>Criar fixtures idempotentes"]
  end

  classDef concluida fill:#d4f4dd,stroke:#2e7d32,color:#1b3d20
  classDef andamento fill:#fff3cd,stroke:#b8860b,color:#4a3800
  classDef bloqueada fill:#f8d7da,stroke:#c62828,color:#4a1d1f
  classDef pendente  fill:#eceff1,stroke:#78909c,color:#263238
  classDef critico   stroke-width:3px

  class T_01_01 concluida
  class T_01_01 critico
```

# Fases - Sprint 01

## F-01.1 - Fixtures idempotentes

**Objetivo:** Padronizar chaves e requisições repetidas para os testes unitários e de integração.

**Tasks que a compõem:** T-01.01

**Critério de saída:** O helper produz a mesma chave em repetições e payloads distintos para conflito.

**Roda em paralelo com:** nenhuma
