---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: integracao-neon
sprint_id: sprint-03
atualizado_em: 2026-10-10
fases:
  - id: F-03.1
    titulo: Schema Postgres
    status: concluido
    criterio_saida: Migration aplicada na branch de teste com as tabelas lancamentos e caixinhas
    paralelizavel: true
    paralela_com: [F-03.2]
    tasks: [T-03.01]
  - id: F-03.2
    titulo: Function de API autenticada
    status: concluido
    criterio_saida: Rotas de lancamentos e caixinhas isolam por user_id e exigem JWT valido
    paralelizavel: true
    paralela_com: [F-03.1]
    tasks: [T-03.02, T-03.03, T-03.04]
---

# Fases — Sprint 03

```mermaid
%% Grafo de tasks — sprint-03 — gerado pela sprintx a partir de tasks.md
flowchart LR
  subgraph fase_03_1["F-03.1 — Schema Postgres"]
    T_03_01["T-03.01<br/>Schema Drizzle"]
  end
  subgraph fase_03_2["F-03.2 — Function de API autenticada"]
    T_03_02["T-03.02<br/>Middleware de auth"]
    T_03_03["T-03.03<br/>Endpoints de lancamentos"]
    T_03_04["T-03.04<br/>Endpoints de caixinhas"]
  end

  T_03_01 --> T_03_03
  T_03_01 --> T_03_04
  T_03_02 --> T_03_03
  T_03_02 --> T_03_04

  classDef concluida fill:#d4f4dd,stroke:#2e7d32,color:#1b3d20
  classDef andamento fill:#fff3cd,stroke:#b8860b,color:#4a3800
  classDef bloqueada fill:#f8d7da,stroke:#c62828,color:#4a1d1f
  classDef pendente  fill:#eceff1,stroke:#78909c,color:#263238
  classDef critico   stroke-width:3px

  class T_03_01 concluida
  class T_03_02 concluida
  class T_03_03 concluida
  class T_03_04 concluida
  class T_03_01,T_03_03 critico
```

---

## F-03.1 — Schema Postgres

**Objetivo:** Aplicar o schema de lançamentos e caixinhas (uuid, centavos, `user_id`) na
branch de teste.

**Tasks que a compõem:** T-03.01

**Critério de saída:** Migration aplicada na branch de teste com as duas tabelas do contrato.

**Roda em paralelo com:** F-03.2 (T-03.02 não depende de T-03.01; T-03.03/T-03.04 esperam as duas)

---

## F-03.2 — Function de API autenticada

**Objetivo:** Expor lançamentos e caixinhas via Neon Function, autenticada por JWT e isolada
por `user_id`.

**Tasks que a compõem:** T-03.02, T-03.03, T-03.04

**Critério de saída:** Rotas de lançamentos e caixinhas exigem JWT válido e só retornam/alteram
linhas do usuário do token.

**Roda em paralelo com:** F-03.1 (T-03.02 não depende de T-03.01; T-03.03/T-03.04 esperam as duas)
