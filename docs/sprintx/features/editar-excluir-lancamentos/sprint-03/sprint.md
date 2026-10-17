---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: editar-excluir-lancamentos
sprint_id: sprint-03
titulo: Frontend - estado e dialogo de acoes
status: concluido
criterio_saida: dialogo unico oferece marcar como paga, editar e excluir, com alcance de parcela e erro de vinculo de caixinha tratados
fases: [F-03.1, F-03.2]
riscos: [Dialogo com tres acoes e campo de alcance condicional pode crescer demais em um arquivo so - ui-extrato-dialogos.md]
atualizado_em: 2026-10-17
---

# Sprint 03 — Frontend: estado e diálogo de ações

## Objetivo

Dar ao `LancamentosProvider` as mutações `editarReceita`, `editarDespesa` e
`excluirLancamento` (otimistas, com rollback), e construir o novo `AcoesLancamentoDialog` —
um diálogo só, que abre ao clicar na linha e oferece marcar como paga (quando aplicável),
editar e excluir, substituindo o `ConfirmarPagamentoDialog` atual.

`T-03.01` depende também de `T-01.01` (sprint-01), que dá ao mock de API a simulação de
`PATCH`/`DELETE` em `/lancamentos/:id` — dependência cruzada de sprint, fora do diagrama desta
sprint, mas declarada no `depende_de` da task.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-03.1 | Estado otimista no contexto | nenhuma |
| F-03.2 | Diálogo de ações | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

`npm run test -- --run src/state/lancamentos-context.test.tsx src/components/acoes-lancamento-dialog.test.tsx`
termina com 0 failed.

## Riscos conhecidos

- Um diálogo com três ações e um campo de alcance condicional pode crescer demais num arquivo
  só (`ui-extrato-dialogos.md`) — se isso acontecer durante a execução, quebrar em
  subcomponentes é refinamento local da task, não motivo pra reabrir o plano.
