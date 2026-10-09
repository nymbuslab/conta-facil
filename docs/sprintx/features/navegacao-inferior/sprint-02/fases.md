---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: navegacao-inferior
sprint_id: sprint-02
atualizado_em: 2026-10-08
fases:
  - id: F-02.1
    titulo: Provider, rotas e componente de navegacao
    status: concluido
    criterio_saida: LancamentosProvider funciona a partir do root, as 3 rotas novas resolvem, e BottomNav marca a aba ativa corretamente isolado
    paralelizavel: false
    paralela_com: []
    tasks: [T-02.01, T-02.02, T-02.03]
  - id: F-02.2
    titulo: Integracao no root e ajuste de layout
    status: concluido
    criterio_saida: BottomNav visivel em todas as rotas e FAB sem sobreposicao
    paralelizavel: false
    paralela_com: []
    tasks: [T-02.04, T-02.05]
---

# Fases — Sprint 02

```mermaid
%% Grafo de tasks — sprint-02 — gerado pela sprintx a partir de tasks.md
flowchart LR
  subgraph fase_02_1["F-02.1 — Provider, rotas e componente de navegacao"]
    T_02_01["T-02.01<br/>Mover LancamentosProvider…"]
    T_02_02["T-02.02<br/>Criar rotas Parcelas…"]
    T_02_03["T-02.03<br/>Componente BottomNav"]
  end
  subgraph fase_02_2["F-02.2 — Integracao no root e ajuste de layout"]
    T_02_04["T-02.04<br/>Montar BottomNav no root"]
    T_02_05["T-02.05<br/>Ajustar FAB e padding"]
  end

  T_02_02 --> T_02_03
  T_02_01 --> T_02_04
  T_02_02 --> T_02_04
  T_02_03 --> T_02_04
  T_02_04 --> T_02_05

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
  class T_02_02,T_02_03,T_02_04,T_02_05 critico
```

---

## F-02.1 — Provider, rotas e componente de navegação

**Objetivo:** Deixar prontas as três peças independentes que a integração da F-02.2 vai montar: o provider no root, as rotas novas, e o componente de navegação.

**Tasks que a compõem:** T-02.01, T-02.02, T-02.03

**Critério de saída:** `LancamentosProvider` funciona a partir do root, as 3 rotas novas resolvem sem erro, e `BottomNav` renderiza os 4 rótulos com o estado ativo correto quando testado isoladamente.

**Roda em paralelo com:** nenhuma

---

## F-02.2 — Integração no root e ajuste de layout

**Objetivo:** Montar o `BottomNav` no root para aparecer em todas as rotas, e ajustar o `RegistrarFab`/padding para não sobrepor a nova barra.

**Tasks que a compõem:** T-02.04, T-02.05

**Critério de saída:** `BottomNav` aparece em pelo menos duas rotas diferentes renderizadas, e o `RegistrarFab` tem posição ajustada para não colidir com a barra.

**Roda em paralelo com:** nenhuma
