---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: navegacao-inferior
sprint_id: sprint-05
atualizado_em: 2026-10-08
fases:
  - id: F-05.1
    titulo: Tela Perfil mockada
    status: concluido
    criterio_saida: A rota perfil mostra nome e email ficticios sem campo editavel
    paralelizavel: false
    paralela_com: []
    tasks: [T-05.01]
---

# Fases — Sprint 05

```mermaid
%% Grafo de tasks — sprint-05 — gerado pela sprintx a partir de tasks.md
flowchart LR
  subgraph fase_05_1["F-05.1 — Tela Perfil mockada"]
    T_05_01["T-05.01<br/>Dados ficticios na…"]
  end



  classDef concluida fill:#d4f4dd,stroke:#2e7d32,color:#1b3d20
  classDef andamento fill:#fff3cd,stroke:#b8860b,color:#4a3800
  classDef bloqueada fill:#f8d7da,stroke:#c62828,color:#4a1d1f
  classDef pendente  fill:#eceff1,stroke:#78909c,color:#263238
  classDef critico   stroke-width:3px

  class T_05_01 concluida
  class T_05_01 critico
```

---

## F-05.1 — Tela Perfil mockada

**Objetivo:** Preencher a rota `/perfil` com nome e e-mail fictícios, somente leitura.

**Tasks que a compõem:** T-05.01

**Critério de saída:** A rota `/perfil` mostra o nome e o e-mail fictícios definidos no mock, sem nenhum campo editável.

**Roda em paralelo com:** nenhuma
