---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: editar-excluir-lancamentos
sprint_id: sprint-05
titulo: Convergencia, rodada 1
status: concluido
criterio_saida: AcoesLancamentoDialog avisa quando a despesa editada/excluida ja foi paga (D-02)
fases: [F-05.1]
riscos: [Nenhum risco registrado.]
atualizado_em: 2026-10-17
---

# Sprint 05 — Convergência, rodada 1

## Objetivo

Fechar o achado C-01 da rodada 1 de convergência (`00-CONVERGENCIA.md`): D-02 diz que despesa já
paga pode ser editada/excluída "com aviso no diálogo", mas o código só remove a opção "Marcar
como paga" — não existe nenhum texto avisando que a despesa já foi paga e que a mudança afeta o
card Total Pago.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-05.1 | Aviso de despesa paga | nenhuma |

Detalhe da fase em `fases.md`; task em `tasks.md`.

## Critério de saída

`npm run test -- --run src/components/acoes-lancamento-dialog.test.tsx` termina com 0 failed.

## Riscos conhecidos

Nenhum risco registrado.
