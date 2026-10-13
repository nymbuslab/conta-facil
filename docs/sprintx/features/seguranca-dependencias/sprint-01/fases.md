---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: seguranca-dependencias
sprint_id: sprint-01
atualizado_em: 2026-10-11
fases:
  - id: F-01.1
    titulo: Harness da auditoria
    status: concluido
    criterio_saida: O script cobre a matriz de auditoria e o baseline visual registra 16 estados v3 persistentes
    paralelizavel: false
    paralela_com: []
    tasks: [T-01.01, T-01.02]
---

```mermaid
%% Grafo de tasks - sprint-01 - gerado pela sprintx a partir de tasks.md
flowchart LR
  subgraph fase_01_1["F-01.1 - Harness da auditoria"]
    T_01_01["T-01.01<br/>Criar verificador npm"]
    T_01_02["T-01.02<br/>Capturar baseline visual"]
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

# Fases - Sprint 01

## F-01.1 - Harness da auditoria

**Objetivo:** Criar um comando testável que traduza o relatório do npm em um portão de segurança.

**Tasks que a compõem:** T-01.01, T-01.02

**Critério de saída:** O script cobre a matriz de auditoria e o baseline registra 16 estados v3 persistentes.

**Roda em paralelo com:** nenhuma
