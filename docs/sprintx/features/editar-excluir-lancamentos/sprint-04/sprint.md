---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: editar-excluir-lancamentos
sprint_id: sprint-04
titulo: Integracao nas telas Extrato e Parcelas
status: concluido
criterio_saida: receita e despesa (paga ou nao) abrem o dialogo de acoes nas duas telas, e a tela Parcelas reflete edicao/exclusao de parcela
fases: [F-04.1]
riscos: [Nenhum risco registrado.]
atualizado_em: 2026-10-17
---

# Sprint 04 — Integração nas telas Extrato e Parcelas

## Objetivo

Ligar o `AcoesLancamentoDialog` (sprint-03) às duas telas que listam lançamentos
(`ExtratoLista`, `ListaLancamentos`), cobrindo receita e despesa paga — que hoje não abrem
diálogo nenhum — e confirmar que a tela Parcelas reflete edição/exclusão de parcela nos
agregados que já mostra.

`T-04.01` depende também de `T-03.06` (sprint-03, fim do diálogo de ações) — dependência
cruzada de sprint, fora do diagrama desta sprint, mas declarada no `depende_de` da task.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-04.1 | Integração nas telas | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

`npm run test -- --run src/components/extrato-lista.test.tsx src/components/lista-lancamentos.test.tsx src/routes/parcelas.test.tsx`
termina com 0 failed.

## Riscos conhecidos

Nenhum risco registrado.
