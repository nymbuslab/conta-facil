---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: rollout-neon-production
sprint_id: sprint-02
atualizado_em: 2026-10-11
fases:
  - id: F-02.1
    titulo: Schema e Function em production
    status: concluida
    criterio_saida: Tabelas lancamentos e caixinhas existem e a Function api responde 200 em /health
    paralelizavel: true
    paralela_com: [F-02.2]
    tasks: [T-02.01, T-02.02]
  - id: F-02.2
    titulo: Rollback documentado
    status: concluida
    criterio_saida: ROLLBACK.md existe com o procedimento de Instant Restore referenciando a branch production real
    paralelizavel: true
    paralela_com: [F-02.1]
    tasks: [T-02.03]
---

# Fases — Sprint 02

```mermaid
%% Grafo de tasks — sprint-02 — gerado pela sprintx a partir de tasks.md
flowchart LR
  subgraph fase_02_1["F-02.1 — Schema e Function em production"]
    T_02_01["T-02.01<br/>Aplicar migration em…"]
    T_02_02["T-02.02<br/>Implantar Function api"]
  end
  subgraph fase_02_2["F-02.2 — Rollback documentado"]
    T_02_03["T-02.03<br/>Documentar rollback"]
  end

  classDef concluida fill:#d4f4dd,stroke:#2e7d32,color:#1b3d20
  classDef andamento fill:#fff3cd,stroke:#b8860b,color:#4a3800
  classDef bloqueada fill:#f8d7da,stroke:#c62828,color:#4a1d1f
  classDef pendente  fill:#eceff1,stroke:#78909c,color:#263238
  classDef critico   stroke-width:3px

  class T_02_01 concluida
  class T_02_02 concluida
  class T_02_03 concluida
  class T_02_01 critico
```

> Um bloco por fase. O paralelismo declarado aqui é definitivo: a execução nunca decide paralelismo sozinha.

---

## F-02.1 — Schema e Function em production

**Objetivo:** Aplicar a migration de negócio e implantar a Function `api` na branch `production`.

**Tasks que a compõem:** T-02.01, T-02.02

**Critério de saída:** Tabelas `lancamentos` e `caixinhas` existem e a Function `api` responde 200 em `/health`.

**Roda em paralelo com:** F-02.2

---

## F-02.2 — Rollback documentado

**Objetivo:** Registrar o procedimento de Instant Restore para a branch `production`.

**Tasks que a compõem:** T-02.03

**Critério de saída:** `ROLLBACK.md` existe com o procedimento referenciando a branch `production` real.

**Roda em paralelo com:** F-02.1
