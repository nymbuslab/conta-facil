---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: integracao-neon
sprint_id: sprint-02
atualizado_em: 2026-10-10
fases:
  - id: F-02.1
    titulo: Autenticacao real
    status: concluido
    criterio_saida: Login e cadastro autenticam contra a branch de teste e perfil mockado foi removido
    paralelizavel: false
    paralela_com: []
    tasks: [T-02.01, T-02.02, T-02.03, T-02.04]
---

# Fases — Sprint 02

```mermaid
%% Grafo de tasks — sprint-02 — gerado pela sprintx a partir de tasks.md
flowchart LR
  subgraph fase_02_1["F-02.1 — Autenticacao real"]
    T_02_01["T-02.01<br/>Provider de sessao"]
    T_02_02["T-02.02<br/>Tela de login"]
    T_02_03["T-02.03<br/>Tela de cadastro"]
    T_02_04["T-02.04<br/>Proteger rotas"]
  end

  T_02_01 --> T_02_02
  T_02_01 --> T_02_03
  T_02_02 --> T_02_04
  T_02_03 --> T_02_04

  classDef concluida fill:#d4f4dd,stroke:#2e7d32,color:#1b3d20
  classDef andamento fill:#fff3cd,stroke:#b8860b,color:#4a3800
  classDef bloqueada fill:#f8d7da,stroke:#c62828,color:#4a1d1f
  classDef pendente  fill:#eceff1,stroke:#78909c,color:#263238
  classDef critico   stroke-width:3px

  class T_02_01 concluida
  class T_02_02 concluida
  class T_02_03 concluida
  class T_02_04 concluida
  class T_02_01,T_02_02,T_02_04 critico
```

---

## F-02.1 — Autenticacao real

**Objetivo:** Login e cadastro reais via Neon Managed Auth, com rotas protegidas e o perfil
mockado removido.

**Tasks que a compõem:** T-02.01, T-02.02, T-02.03, T-02.04

**Critério de saída:** Login e cadastro autenticam contra a branch de teste e nenhuma tela
importa `src/lib/perfil-mock.ts`.

**Roda em paralelo com:** nenhuma
