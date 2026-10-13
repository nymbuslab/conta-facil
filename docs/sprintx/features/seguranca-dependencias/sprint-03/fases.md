---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: seguranca-dependencias
sprint_id: sprint-03
atualizado_em: 2026-10-12
fases:
  - id: F-03.1
    titulo: Evidencia compilada e visual
    status: concluido
    criterio_saida: Teste do CSS final passa e os 16 pares possuem medidas e fingerprints equivalentes
    paralelizavel: false
    paralela_com: []
    tasks: [T-03.01, T-03.02]
---

```mermaid
flowchart LR
  subgraph fase_03_1["F-03.1 - Evidencia compilada e visual"]
    T_03_01["T-03.01<br/>Testar CSS compilado"]
    T_03_02["T-03.02<br/>Medir pares visuais"]
  end
  T_03_01 --> T_03_02

  classDef concluida fill:#d4f4dd,stroke:#2e7d32,color:#1b3d20
  classDef critico stroke-width:3px
  class T_03_01,T_03_02 concluida
  class T_03_01,T_03_02 critico
```

# Fases - Sprint 03

## F-03.1 - Evidência compilada e visual

**Objetivo:** substituir evidência nominal por verificações sobre o CSS final e por medições reproduzíveis da interface.

**Tasks que a compõem:** T-03.01, T-03.02

**Critério de saída:** teste do CSS final passa e os 16 pares possuem medidas e fingerprints equivalentes.

**Roda em paralelo com:** nenhuma
