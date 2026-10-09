---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: navegacao-inferior
sprint_id: sprint-04
atualizado_em: 2026-10-08
fases:
  - id: F-04.1
    titulo: Modelo de dados base de Caixinhas
    status: concluido
    criterio_saida: Tipos e schemas existem e o CaixinhasProvider funciona com criar depositar resgatar excluir e totalGuardado
    paralelizavel: false
    paralela_com: []
    tasks: [T-04.01, T-04.02]
  - id: F-04.2
    titulo: Construcao paralela de hook e componentes
    status: concluido
    criterio_saida: Hook de saldo combinado e os tres componentes de UI de Caixinhas existem isoladamente
    paralelizavel: false
    paralela_com: []
    tasks: [T-04.03, T-04.04, T-04.05, T-04.06]
  - id: F-04.3
    titulo: Integracao final
    status: concluido
    criterio_saida: Rota caixinhas montada de fato, e a tela Inicio mostra o card Guardado e o saldo combinado
    paralelizavel: false
    paralela_com: []
    tasks: [T-04.07, T-04.08]
---

# Fases — Sprint 04

```mermaid
%% Grafo de tasks — sprint-04 — gerado pela sprintx a partir de tasks.md
flowchart LR
  subgraph fase_04_1["F-04.1 — Modelo de dados base de Caixinhas"]
    T_04_01["T-04.01<br/>Tipos e schemas de…"]
    T_04_02["T-04.02<br/>CaixinhasProvider"]
  end
  subgraph fase_04_2["F-04.2 — Construcao paralela de hook e componentes"]
    T_04_03["T-04.03<br/>Hook useSaldoAcumulado"]
    T_04_04["T-04.04<br/>Componente…"]
    T_04_05["T-04.05<br/>Modal de nova…"]
    T_04_06["T-04.06<br/>Modal de…"]
  end
  subgraph fase_04_3["F-04.3 — Integracao final"]
    T_04_07["T-04.07<br/>Montar a rota…"]
    T_04_08["T-04.08<br/>Card Guardado e…"]
  end

  T_04_01 --> T_04_02
  T_04_02 --> T_04_03
  T_04_02 --> T_04_04
  T_04_01 --> T_04_05
  T_04_02 --> T_04_05
  T_04_01 --> T_04_06
  T_04_02 --> T_04_06
  T_04_04 --> T_04_07
  T_04_05 --> T_04_07
  T_04_06 --> T_04_07
  T_04_03 --> T_04_08

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
  class T_04_07 concluida
  class T_04_08 concluida
  class T_04_01,T_04_02,T_04_04,T_04_07 critico
```

---

## F-04.1 — Modelo de dados base de Caixinhas

**Objetivo:** Criar o tipo `Caixinha`, os schemas zod e o `CaixinhasProvider` com as quatro ações.

**Tasks que a compõem:** T-04.01, T-04.02

**Critério de saída:** Criar, depositar, resgatar e excluir caixinha funcionam no estado, com `totalGuardado` derivado corretamente.

**Roda em paralelo com:** nenhuma

---

## F-04.2 — Construção paralela de hook e componentes

**Objetivo:** Construir, em paralelo (todas dependem só de T-04.02, já concluída, e tocam arquivos distintos), o hook de saldo combinado e os três componentes de UI de Caixinhas.

**Tasks que a compõem:** T-04.03, T-04.04, T-04.05, T-04.06

**Critério de saída:** `useSaldoAcumulado` reflete o total guardado; `CaixinhaCard`, o modal de criar e o modal de movimentar existem e funcionam isoladamente.

**Roda em paralelo com:** nenhuma

---

## F-04.3 — Integração final

**Objetivo:** Montar a rota `/caixinhas` de fato e atualizar a tela Início com o card "Guardado" e o saldo combinado — as duas tasks não dependem uma da outra e tocam arquivos distintos.

**Tasks que a compõem:** T-04.07, T-04.08

**Critério de saída:** A rota `/caixinhas` funciona de ponta a ponta, e a tela Início mostra 3 cards e o saldo acumulado considerando Caixinhas.

**Roda em paralelo com:** nenhuma
