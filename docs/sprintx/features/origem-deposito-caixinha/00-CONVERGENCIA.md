---
expx_schema: 1
expx_tool: sprintx
kind: convergencia
trabalho_id: origem-deposito-caixinha
atualizado_em: 2026-10-15
rodada: 1
voltas_maximas: 2
resultado: convergido
decisoes_conferidas: 7
achados: []
---

# Convergência — origem-deposito-caixinha

> Gravado pela F6 no Passo 2.5. Rodada sem achado ALTA nem MÉDIA: `resultado: convergido`.

## Rodada 1 — 2026-10-15

Decisões conferidas: 7 (D-01 a D-07). Tasks com critério de aceite reconferido: 15.

Agente `auditor-convergencia` confirmou, decisão por decisão, que o código realiza exatamente o
que `00-DECISOES.md` registra: depósito `de_fora` cria movimentação e lançamento de receita
vinculados na mesma transação (com e sem `Idempotency-Key`); origem é por depósito individual,
sustentada pela tabela `caixinha_movimentacoes`; resgate soma de volta ao saldo sem olhar a
origem original e grava linha de auditoria com `origem: null`; caixinhas existentes não foram
reclassificadas (escopo restritivo de D-04, sem código exigido); o campo de origem nasce
pré-marcado em "saldo atual" no modal; e o backend aceita `origem` como opcional com default
`saldo_atual`. Nenhum código fora do escopo das decisões foi encontrado. `npm run test` (344
passed, 2 skipped) e `npm run build` rodaram limpos durante a conferência.

| id | tipo_lacuna | severidade | origem | evidência | destino |
|---|---|---|---|---|---|
| — | — | — | — | Nenhum achado. | — |

Resultado: convergido.
