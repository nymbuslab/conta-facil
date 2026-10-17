---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: dashboard-extrato
sprint_id: sprint-02
atualizado_em: 2026-10-17
fases:
  - id: F-02.1
    titulo: Repositorio e rotas
    status: concluido
    criterio_saida: lancamentos.test.ts cobre os dois repositorios e as duas rotas novas
    paralelizavel: false
    paralela_com: []
    tasks: [T-02.01, T-02.02, T-02.03, T-02.04]
  - id: F-02.2
    titulo: Integracao real na branch test
    status: concluido
    criterio_saida: npm run test:integration:lancamentos passa cobrindo os dois endpoints novos
    paralelizavel: false
    paralela_com: []
    tasks: [T-02.05, T-02.06]
---

# Fases — Sprint 02

```mermaid
%% Grafo de tasks — sprint-02 — gerado pela sprintx a partir de tasks.md
flowchart LR
  subgraph fase_02_1["F-02.1 — Repositorio e rotas"]
    T_02_01["T-02.01<br/>Repositorio vencendo"]
    T_02_02["T-02.02<br/>Rota vencendo"]
    T_02_03["T-02.03<br/>Repositorio recentes"]
    T_02_04["T-02.04<br/>Rota recentes"]
  end
  subgraph fase_02_2["F-02.2 — Integracao real na branch test"]
    T_02_05["T-02.05<br/>Integracao vencendo"]
    T_02_06["T-02.06<br/>Integracao recentes"]
  end
  T_02_01 --> T_02_02
  T_02_02 --> T_02_03
  T_02_03 --> T_02_04
  T_02_02 --> T_02_05
  T_02_04 --> T_02_06
  T_02_05 --> T_02_06

  classDef concluida fill:#d4f4dd,stroke:#2e7d32,color:#1b3d20
  classDef andamento fill:#fff3cd,stroke:#b8860b,color:#4a3800
  classDef bloqueada fill:#f8d7da,stroke:#c62828,color:#4a1d1f
  classDef pendente  fill:#eceff1,stroke:#78909c,color:#263238
  classDef critico   stroke-width:3px

  class T_02_01 concluida
  class T_02_02 concluida
  class T_02_03 concluida
  class T_02_04 concluida
  class T_02_05 concluida
  class T_02_06 concluida
  class T_02_01,T_02_02,T_02_03,T_02_04,T_02_06 critico
```

> Um bloco por fase. O paralelismo declarado aqui é definitivo.

---

## F-02.1 — Repositório e rotas

**Objetivo:** Implementar `listarVencendo`/`listarRecentes` no repositório de lançamentos e as
rotas `GET /lancamentos/vencendo` e `GET /lancamentos/recentes` que os expõem.

**Tasks que a compõem:** T-02.01, T-02.02, T-02.03, T-02.04

**Critério de saída:** `lancamentos.test.ts` cobre os dois repositórios e as duas rotas,
incluindo isolamento por `userId` e validação de parâmetros.

**Roda em paralelo com:** nenhuma

---

## F-02.2 — Integração real na branch test

**Objetivo:** Provar os dois endpoints contra o Postgres real da branch `test`, atrás de
`garantirBranchDeTeste()`.

**Tasks que a compõem:** T-02.05, T-02.06

**Critério de saída:** `npm run test:integration:lancamentos` passa cobrindo os dois endpoints.

**Roda em paralelo com:** nenhuma
