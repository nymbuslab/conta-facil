---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: integracao-neon
sprint_id: sprint-01
atualizado_em: 2026-10-10
fases:
  - id: F-01.1
    titulo: Capacidade de testar
    status: concluido
    criterio_saida: npm run test:integration conecta na branch de teste e GET /health responde 200 via neon dev
    paralelizavel: false
    paralela_com: []
    tasks: [T-01.01, T-01.02, T-01.03, T-01.04]
---

# Fases — Sprint 01

```mermaid
%% Grafo de tasks — sprint-01 — gerado pela sprintx a partir de tasks.md
flowchart LR
  subgraph fase_01_1["F-01.1 — Capacidade de testar"]
    T_01_01["T-01.01<br/>Branch de teste e reset"]
    T_01_02["T-01.02<br/>Instalar dependencias"]
    T_01_03["T-01.03<br/>Harness de integracao"]
    T_01_04["T-01.04<br/>Scaffold da Function"]
  end

  T_01_01 --> T_01_02
  T_01_01 --> T_01_03
  T_01_02 --> T_01_03
  T_01_02 --> T_01_04

  classDef concluida fill:#d4f4dd,stroke:#2e7d32,color:#1b3d20
  classDef andamento fill:#fff3cd,stroke:#b8860b,color:#4a3800
  classDef bloqueada fill:#f8d7da,stroke:#c62828,color:#4a1d1f
  classDef pendente  fill:#eceff1,stroke:#78909c,color:#263238
  classDef critico   stroke-width:3px

  class T_01_01 concluida
  class T_01_02 concluida
  class T_01_03 concluida
  class T_01_04 concluida
  class T_01_01,T_01_02,T_01_03 critico
```

---

## F-01.1 — Capacidade de testar

**Objetivo:** Deixar a branch de teste, as dependências, o harness de integração e o scaffold
da Function prontos antes de qualquer sprint de negócio.

**Tasks que a compõem:** T-01.01, T-01.02, T-01.03, T-01.04

**Critério de saída:** `npm run test:integration` conecta na branch de teste e `GET /health`
responde 200 via `neon dev`.

**Roda em paralelo com:** nenhuma
