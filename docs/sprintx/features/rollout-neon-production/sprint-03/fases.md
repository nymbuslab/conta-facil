---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: rollout-neon-production
sprint_id: sprint-03
atualizado_em: 2026-10-11
fases:
  - id: F-03.1
    titulo: Provisionamento Cloudflare Pages
    status: concluida
    criterio_saida: https://contafacil.nymbuslab.com.br responde 200 com o build atual do app
    paralelizavel: false
    paralela_com: []
    tasks: [T-03.01, T-03.02, T-03.03, T-03.04]
---

# Fases — Sprint 03

```mermaid
%% Grafo de tasks — sprint-03 — gerado pela sprintx a partir de tasks.md
flowchart LR
  subgraph fase_03_1["F-03.1 — Provisionamento Cloudflare Pages"]
    T_03_01["T-03.01<br/>Criar projeto Pages"]
    T_03_02["T-03.02<br/>Configurar env var da…"]
    T_03_03["T-03.03<br/>Configurar DNS do…"]
    T_03_04["T-03.04<br/>Build e publicar…"]
  end
  T_03_01 --> T_03_02
  T_03_01 --> T_03_03
  T_03_02 --> T_03_04
  T_03_03 --> T_03_04

  classDef concluida fill:#d4f4dd,stroke:#2e7d32,color:#1b3d20
  classDef andamento fill:#fff3cd,stroke:#b8860b,color:#4a3800
  classDef bloqueada fill:#f8d7da,stroke:#c62828,color:#4a1d1f
  classDef pendente  fill:#eceff1,stroke:#78909c,color:#263238
  classDef critico   stroke-width:3px

  class T_03_01 concluida
  class T_03_02 concluida
  class T_03_03 concluida
  class T_03_04 concluida
  class T_03_01,T_03_02,T_03_04 critico
```

> Um bloco por fase. O paralelismo declarado aqui é definitivo: a execução nunca decide paralelismo sozinha.

---

## F-03.1 — Provisionamento Cloudflare Pages

**Objetivo:** Criar o projeto Pages, configurar env var e DNS, e publicar o build de produção.

**Tasks que a compõem:** T-03.01, T-03.02, T-03.03, T-03.04

**Critério de saída:** `https://contafacil.nymbuslab.com.br` responde 200 com o build atual do app.

**Roda em paralelo com:** nenhuma
