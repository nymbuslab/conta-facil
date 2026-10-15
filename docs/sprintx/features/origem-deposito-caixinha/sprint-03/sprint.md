---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: origem-deposito-caixinha
sprint_id: sprint-03
titulo: Frontend - escolha de origem no deposito
status: concluido
criterio_saida: Modal de deposito oferece a escolha de origem pre-marcada em saldo atual, e o saldo do mes fica inalterado apos um deposito de_fora
fases: [F-03.1, F-03.2]
riscos: [Tela de caixinhas nao consome useLancamentos hoje, precisa passar a consumir so para recarregar apos um deposito de_fora]
atualizado_em: 2026-10-15
---

# Sprint 03 — Frontend: escolha de origem no depósito

## Objetivo

Expor a escolha de origem no modal de depósito, encaminhá-la pelo contexto de caixinhas, e
garantir que a tela recarregue o saldo do mês (via `LancamentosProvider`) depois de um depósito
"de fora" — provando, no fim, que o efeito líquido no saldo é zero para esse caso (D-01/D-03).

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-03.1 | Tipos e formulário | nenhuma |
| F-03.2 | Integração do contexto com saldo e lançamentos | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

`npm run test -- use-saldo-acumulado.test.tsx movimentar-caixinha-modal.test.tsx
caixinhas-context.test.tsx caixinhas.test.tsx` (rotas) passam, cobrindo o caso `de_fora` com
efeito líquido zero no saldo e o caso `saldo_atual` como regressão.

## Riscos conhecidos

- `src/routes/caixinhas.tsx` (onde o modal é montado) não consome `useLancamentos()` hoje —
  precisa passar a consumir só para chamar `recarregarLancamentos()` após um depósito `de_fora`
  (`base/frontend-caixinhas.md`).
