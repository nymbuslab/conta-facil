---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: deploy-unificado
sprint_id: sprint-01
atualizado_em: 2026-10-12
fases:
  - id: F-01.1
    titulo: Fundacao do modulo testavel
    status: nao_iniciado
    criterio_saida: deploy.mjs importa no teste sem disparar o fluxo e o executor git real roda em diretorio temporario
    paralelizavel: false
    paralela_com: []
    tasks: [T-01.01]
  - id: F-01.2
    titulo: Estado e classificacao
    status: nao_iniciado
    criterio_saida: Estado e link lidos de arquivos reais e mudancas classificadas com suíte verde
    paralelizavel: false
    paralela_com: []
    tasks: [T-01.02, T-01.03]
---

```mermaid
%% Grafo de tasks — sprint-01 — gerado pela sprintx a partir de tasks.md
flowchart LR
  subgraph fase_01_1["F-01.1 — Fundacao do modulo testavel"]
    T_01_01["T-01.01<br/>Modulo e executores"]
  end
  subgraph fase_01_2["F-01.2 — Estado e classificacao"]
    T_01_02["T-01.02<br/>Estado do deploy e link"]
    T_01_03["T-01.03<br/>Classificar mudancas"]
  end
  T_01_01 --> T_01_02
  T_01_02 --> T_01_03

  classDef concluida fill:#d4f4dd,stroke:#2e7d32,color:#1b3d20
  classDef andamento fill:#fff3cd,stroke:#b8860b,color:#4a3800
  classDef bloqueada fill:#f8d7da,stroke:#c62828,color:#4a1d1f
  classDef pendente  fill:#eceff1,stroke:#78909c,color:#263238
  classDef critico   stroke-width:3px

  class T_01_01 pendente
  class T_01_02 pendente
  class T_01_03 pendente
  class T_01_01,T_01_02,T_01_03 critico
```

# Fases — Sprint 01

## F-01.1 — Fundação do módulo testável

**Objetivo:** Criar `scripts/deploy.mjs` com esqueleto, guard de main e executores (git via
spawn, neon via ComSpec, prompt, fetch) injetáveis, mais `scripts/deploy.test.ts` com harness
de executores falsos e diretório temporário.

**Tasks que a compõem:** T-01.01

**Critério de saída:** O módulo importa no vitest sem disparar o fluxo e o executor git real
roda `git branch --show-current` num repositório temporário.

**Roda em paralelo com:** nenhuma

---

## F-01.2 — Estado e classificação

**Objetivo:** Ler o estado de deploy (`.deploy-state.json`) e o link do CLI (`.neon`), e
classificar mudanças (Function, migrations, tree suja, branch errada, commits a pushar) a
partir das linhas do git.

**Tasks que a compõem:** T-01.02, T-01.03

**Critério de saída:** Estado e link lidos de arquivos reais em diretório temporário e
mudanças classificadas corretamente, com a suíte verde.

**Roda em paralelo com:** nenhuma
