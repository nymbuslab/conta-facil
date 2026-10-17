---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: editar-excluir-lancamentos
sprint_id: sprint-04
atualizado_em: 2026-10-17
fases:
  - id: F-04.1
    titulo: Integracao nas telas
    status: concluido
    criterio_saida: receita e despesa (paga ou nao) abrem o dialogo de acoes nas duas telas, e a tela Parcelas reflete edicao/exclusao de parcela
    paralelizavel: false
    paralela_com: []
    tasks: [T-04.01, T-04.02, T-04.03]
---

# Fases — Sprint 04

```mermaid
%% Grafo de tasks — sprint-04 — gerado pela sprintx a partir de tasks.md
flowchart LR
  subgraph fase_04_1["F-04.1 — Integracao nas telas"]
    T_04_01["T-04.01<br/>Linha de receita abre…"]
    T_04_02["T-04.02<br/>Despesa ja paga…"]
    T_04_03["T-04.03<br/>Tela Parcelas reflete…"]
  end
  T_04_01 --> T_04_02
  T_04_02 --> T_04_03

  classDef concluida fill:#d4f4dd,stroke:#2e7d32,color:#1b3d20
  classDef andamento fill:#fff3cd,stroke:#b8860b,color:#4a3800
  classDef bloqueada fill:#f8d7da,stroke:#c62828,color:#4a1d1f
  classDef pendente  fill:#eceff1,stroke:#78909c,color:#263238
  classDef critico   stroke-width:3px

  class T_04_01 concluida
  class T_04_02 concluida
  class T_04_03 concluida
  class T_04_01,T_04_02,T_04_03 critico
```

> Um bloco por fase. O paralelismo declarado aqui é definitivo: a execução nunca decide paralelismo sozinha. As três tasks encadeiam porque T-04.01 e T-04.02 editam os mesmos arquivos de tela.

---

## F-04.1 — Integração nas telas

**Objetivo:** Ligar o diálogo de ações às duas telas, cobrindo receita e despesa paga, e confirmar o reflexo na tela Parcelas.

**Tasks que a compõem:** T-04.01, T-04.02, T-04.03

**Critério de saída:** receita e despesa (paga ou não) abrem o diálogo de ações nas duas telas, e a tela Parcelas reflete edição/exclusão de parcela.

**Roda em paralelo com:** nenhuma
