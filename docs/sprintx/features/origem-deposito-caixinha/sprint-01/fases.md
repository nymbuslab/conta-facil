---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: origem-deposito-caixinha
sprint_id: sprint-01
atualizado_em: 2026-10-15
fases:
  - id: F-01.1
    titulo: Schema e migration
    status: concluido
    criterio_saida: Tabela caixinha_movimentacoes existe na branch test com os checks cobertos por teste
    paralelizavel: true
    paralela_com: [F-01.2]
    tasks: [T-01.01, T-01.02]
  - id: F-01.2
    titulo: Capacidade de teste
    status: concluido
    criterio_saida: Mock de deposito propaga origem e o Wrapper combinado monta os dois providers
    paralelizavel: true
    paralela_com: [F-01.1]
    tasks: [T-01.03, T-01.04]
---

# Fases — Sprint 01

```mermaid
%% Grafo de tasks — sprint-01 — gerado pela sprintx a partir de tasks.md
flowchart LR
  subgraph fase_01_1["F-01.1 — Schema e migration"]
    T_01_01["T-01.01<br/>Schema novo da tabela…"]
    T_01_02["T-01.02<br/>Migration 0003 gerada…"]
  end
  subgraph fase_01_2["F-01.2 — Capacidade de teste"]
    T_01_03["T-01.03<br/>Mock de deposito aceita…"]
    T_01_04["T-01.04<br/>Wrapper de teste combina…"]
  end
  T_01_01 --> T_01_02
  T_01_03 --> T_01_04

  classDef concluida fill:#d4f4dd,stroke:#2e7d32,color:#1b3d20
  classDef andamento fill:#fff3cd,stroke:#b8860b,color:#4a3800
  classDef bloqueada fill:#f8d7da,stroke:#c62828,color:#4a1d1f
  classDef pendente  fill:#eceff1,stroke:#78909c,color:#263238
  classDef critico   stroke-width:3px

  class T_01_01 concluida
  class T_01_02 concluida
  class T_01_03 concluida
  class T_01_04 concluida
  class T_01_01,T_01_02 critico
```

> `F-01.1` e `F-01.2` rodam em paralelo (arquivos independentes). Dentro de cada fase as tasks são
> sequenciais. Caminho crítico: `T-01.01 → T-01.02` (empate em comprimento com `T-01.03 →
> T-01.04`, desempatado pelo id menor).

---

## F-01.1 — Schema e migration

**Objetivo:** Declarar a tabela de movimentações e aplicá-la como migration validada na branch de teste.

**Tasks que a compõem:** T-01.01, T-01.02

**Critério de saída:** `npm run test:migrate` aplica a migration 0003 na branch `test` sem erro.

**Roda em paralelo com:** F-01.2

---

## F-01.2 — Capacidade de teste

**Objetivo:** Preparar os mocks e o wrapper de teste que as sprints seguintes vão precisar para TDD das regras de negócio.

**Tasks que a compõem:** T-01.03, T-01.04

**Critério de saída:** O mock de depósito propaga `origem` e o Wrapper combinado monta `CaixinhasProvider` + `LancamentosProvider` com estado compartilhado.

**Roda em paralelo com:** F-01.1
