---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: dashboard-extrato
sprint_id: sprint-04
atualizado_em: 2026-10-17
fases:
  - id: F-04.1
    titulo: Dados no contexto
    status: concluido
    criterio_saida: lancamentos-context.test.tsx cobre contasVencendo e ultimosLancamentos
    paralelizavel: false
    paralela_com: []
    tasks: [T-04.01, T-04.02]
  - id: F-04.2
    titulo: Cards e composicao
    status: concluido
    criterio_saida: index.test.tsx cobre os dois cards novos e a ausencia de FAB/filtros
    paralelizavel: false
    paralela_com: []
    tasks: [T-04.03, T-04.04, T-04.05, T-04.06]
---

# Fases — Sprint 04

```mermaid
%% Grafo de tasks — sprint-04 — gerado pela sprintx a partir de tasks.md
flowchart LR
  subgraph fase_04_1["F-04.1 — Dados no contexto"]
    T_04_01["T-04.01<br/>Contexto contasVencendo"]
    T_04_02["T-04.02<br/>Contexto ultimosLancamentos"]
  end
  subgraph fase_04_2["F-04.2 — Cards e composicao"]
    T_04_03["T-04.03<br/>Card ContasVencendo"]
    T_04_04["T-04.04<br/>Card UltimosLancamentos"]
    T_04_05["T-04.05<br/>index.tsx dashboard"]
    T_04_06["T-04.06<br/>Skeleton do dashboard"]
  end
  T_04_01 --> T_04_02
  T_04_01 --> T_04_03
  T_04_02 --> T_04_04
  T_04_03 --> T_04_05
  T_04_04 --> T_04_05
  T_04_05 --> T_04_06

  classDef concluida fill:#d4f4dd,stroke:#2e7d32,color:#1b3d20
  classDef andamento fill:#fff3cd,stroke:#b8860b,color:#4a3800
  classDef bloqueada fill:#f8d7da,stroke:#c62828,color:#4a1d1f
  classDef pendente  fill:#eceff1,stroke:#78909c,color:#263238
  classDef critico   stroke-width:3px

  class T_04_01 concluida
  class T_04_02 concluida
  class T_04_03 concluida
  class T_04_04 concluida
  class T_04_05 concluida
  class T_04_06 concluida
  class T_04_01,T_04_02,T_04_04,T_04_05,T_04_06 critico
```

> Um bloco por fase. O paralelismo declarado aqui é definitivo.

---

## F-04.1 — Dados no contexto

**Objetivo:** Dar a `LancamentosProvider` o estado e os métodos de carregamento das duas listas
novas do dashboard, chamando os endpoints da sprint-02.

**Tasks que a compõem:** T-04.01, T-04.02

**Critério de saída:** `lancamentos-context.test.tsx` cobre os dois novos pares
estado/carregamento, incluindo erro seguindo `mensagemErroApi`.

**Roda em paralelo com:** nenhuma

---

## F-04.2 — Cards e composição

**Objetivo:** Criar os dois cards de conteúdo e recompor `index.tsx` como dashboard, com
skeleton próprio.

**Tasks que a compõem:** T-04.03, T-04.04, T-04.05, T-04.06

**Critério de saída:** `index.test.tsx` cobre os dois cards, o "ver mais" de cada um, e a
ausência de FAB/filtros na tela.

**Roda em paralelo com:** nenhuma
