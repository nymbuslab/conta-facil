---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: origem-deposito-caixinha
sprint_id: sprint-03
atualizado_em: 2026-10-15
fases:
  - id: F-03.1
    titulo: Tipos e formulario
    status: concluido
    criterio_saida: Modal de deposito oferece o campo de origem pre-marcado, validado por zod
    paralelizavel: false
    paralela_com: []
    tasks: [T-03.01, T-03.02]
  - id: F-03.2
    titulo: Integracao do contexto com saldo e lancamentos
    status: concluido
    criterio_saida: Deposito de_fora recarrega o saldo e o efeito liquido no saldo acumulado e zero
    paralelizavel: false
    paralela_com: []
    tasks: [T-03.03, T-03.04, T-03.05]
---

# Fases — Sprint 03

```mermaid
%% Grafo de tasks — sprint-03 — gerado pela sprintx a partir de tasks.md
flowchart LR
  subgraph fase_03_1["F-03.1 — Tipos e formulario"]
    T_03_01["T-03.01<br/>Schema de origem e…"]
    T_03_02["T-03.02<br/>Campo de origem no…"]
  end
  subgraph fase_03_2["F-03.2 — Integracao do contexto…"]
    T_03_03["T-03.03<br/>Contexto encaminha origem…"]
    T_03_04["T-03.04<br/>Tela de caixinhas recarrega…"]
    T_03_05["T-03.05<br/>Deposito de_fora nao…"]
  end
  T_03_01 --> T_03_02
  T_03_02 --> T_03_03
  T_03_03 --> T_03_04
  T_03_03 --> T_03_05

  classDef concluida fill:#d4f4dd,stroke:#2e7d32,color:#1b3d20
  classDef andamento fill:#fff3cd,stroke:#b8860b,color:#4a3800
  classDef bloqueada fill:#f8d7da,stroke:#c62828,color:#4a1d1f
  classDef pendente  fill:#eceff1,stroke:#78909c,color:#263238
  classDef critico   stroke-width:3px

  class T_03_01 concluida
  class T_03_02 concluida
  class T_03_03 concluida
  class T_03_04 concluida
  class T_03_05 concluida
  class T_03_01,T_03_02,T_03_03,T_03_04 critico
```

> `T-03.04` e `T-03.05` dependem só de `T-03.03` e não uma da outra — rodam em paralelo (arquivos
> distintos). Caminho crítico: `T-03.01 → T-03.02 → T-03.03 → T-03.04` (empate com `T-03.05`,
> desempatado pelo id menor).

---

## F-03.1 — Tipos e formulário

**Objetivo:** Dar ao usuário a escolha de origem no formulário de depósito, com validação e valor padrão corretos.

**Tasks que a compõem:** T-03.01, T-03.02

**Critério de saída:** `npm run test -- movimentar-caixinha-modal.test.tsx` passa cobrindo depósito e resgate.

**Roda em paralelo com:** nenhuma

---

## F-03.2 — Integração do contexto com saldo e lançamentos

**Objetivo:** Propagar a origem pelo contexto, recarregar o saldo do mês quando necessário, e provar o efeito líquido zero do caso `de_fora`.

**Tasks que a compõem:** T-03.03, T-03.04, T-03.05

**Critério de saída:** `npm run test -- caixinhas-context.test.tsx caixinhas.test.tsx use-saldo-acumulado.test.tsx` passa.

**Roda em paralelo com:** nenhuma
