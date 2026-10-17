---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: editar-excluir-lancamentos
sprint_id: sprint-01
atualizado_em: 2026-10-17
fases:
  - id: F-01.1
    titulo: Mocks de teste para editar/excluir
    status: concluido
    criterio_saida: Mock de API e repositorio fake respondem editar/excluir, incluindo o bloqueio de vinculo com caixinha
    paralelizavel: false
    paralela_com: []
    tasks: [T-01.01, T-01.02]
---

# Fases — Sprint 01

```mermaid
%% Grafo de tasks — sprint-01 — gerado pela sprintx a partir de tasks.md
flowchart LR
  subgraph fase_01_1["F-01.1 — Mocks de teste para editar/excluir"]
    T_01_01["T-01.01<br/>Mock da API client…"]
    T_01_02["T-01.02<br/>Fake Repositorio…"]
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

## F-01.1 — Mocks de teste para editar/excluir

**Objetivo:** Dar às sprints seguintes mocks de PATCH/DELETE de lançamentos e um repositório fake que simula editar/excluir.

**Tasks que a compõem:** T-01.01, T-01.02

**Critério de saída:** Mock de API e repositório fake respondem editar/excluir, incluindo o bloqueio de vínculo com caixinha.

**Roda em paralelo com:** nenhuma
