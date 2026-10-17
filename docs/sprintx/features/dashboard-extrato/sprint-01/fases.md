---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: dashboard-extrato
sprint_id: sprint-01
atualizado_em: 2026-10-17
fases:
  - id: F-01.1
    titulo: Mocks dos endpoints novos
    status: concluido
    criterio_saida: api-client-mocks.test.ts cobre /lancamentos/vencendo e /lancamentos/recentes
    paralelizavel: true
    paralela_com: [F-01.2]
    tasks: [T-01.01, T-01.02]
  - id: F-01.2
    titulo: Scaffold da rota Extrato
    status: concluido
    criterio_saida: Rota /extrato existe e renderiza sem erro
    paralelizavel: true
    paralela_com: [F-01.1]
    tasks: [T-01.03]
---

# Fases — Sprint 01

```mermaid
%% Grafo de tasks — sprint-01 — gerado pela sprintx a partir de tasks.md
flowchart LR
  subgraph fase_01_1["F-01.1 — Mocks dos endpoints novos"]
    T_01_01["T-01.01<br/>Mock de vencendo"]
    T_01_02["T-01.02<br/>Mock de recentes"]
  end
  subgraph fase_01_2["F-01.2 — Scaffold da rota Extrato"]
    T_01_03["T-01.03<br/>Rota vazia extrato"]
  end
  T_01_01 --> T_01_02

  classDef concluida fill:#d4f4dd,stroke:#2e7d32,color:#1b3d20
  classDef andamento fill:#fff3cd,stroke:#b8860b,color:#4a3800
  classDef bloqueada fill:#f8d7da,stroke:#c62828,color:#4a1d1f
  classDef pendente  fill:#eceff1,stroke:#78909c,color:#263238
  classDef critico   stroke-width:3px

  class T_01_01 concluida
  class T_01_02 concluida
  class T_01_03 concluida
  class T_01_01,T_01_02 critico
```

> Um bloco por fase. O paralelismo declarado aqui é definitivo: a execução nunca decide
> paralelismo sozinha.

---

## F-01.1 — Mocks dos endpoints novos

**Objetivo:** Estender o cliente fake de testes para responder aos dois endpoints que a feature
ainda vai criar no backend.

**Tasks que a compõem:** T-01.01, T-01.02

**Critério de saída:** `api-client-mocks.test.ts` cobre os dois caminhos novos com fixtures
configuráveis.

**Roda em paralelo com:** nenhuma

---

## F-01.2 — Scaffold da rota Extrato

**Objetivo:** Registrar a rota `/extrato` no roteador com um componente mínimo, para que
testes de navegação e dos componentes futuros tenham onde montar.

**Tasks que a compõem:** T-01.03

**Critério de saída:** `extrato.test.tsx` confirma que a rota renderiza sem erro.

**Roda em paralelo com:** F-01.1
