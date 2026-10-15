---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: origem-deposito-caixinha
sprint_id: sprint-02
titulo: Backend - deposito com origem e lancamento vinculado
status: concluido
criterio_saida: POST /:id/depositar grava movimentacao e receita vinculada quando origem e de_fora, com e sem chave de idempotencia, provado contra Postgres real
fases: [F-02.1, F-02.2, F-02.3]
riscos: [Composicao entre caixinhas.ts e lancamentos.ts e nova no projeto, exige extrair modulo compartilhado sem acoplar as duas rotas Hono]
atualizado_em: 2026-10-15
---

# Sprint 02 — Backend: depósito com origem e lançamento vinculado

## Objetivo

Implementar a lógica de negócio da Function: `POST /:id/depositar` passa a aceitar `origem` e,
quando `de_fora`, cria atomicamente a linha de movimentação e o lançamento de receita vinculado;
`POST /:id/resgatar` passa a gravar linha de auditoria. Depende da tabela criada na sprint-01.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-02.1 | Helper compartilhado de lançamento | nenhuma |
| F-02.2 | Rotas de caixinhas com origem | nenhuma |
| F-02.3 | Integração real | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

`npm run test -- caixinhas.test.ts` cobre os quatro cenários de depósito/resgate com origem, e
`npm run test:integration:idempotencia` passa contra a branch `test` com o cenário `de_fora`
incluído e a limpeza de `lancamentos`/`caixinha_movimentacoes` no lugar.

## Riscos conhecidos

- `caixinhas.ts` e `lancamentos.ts` hoje são módulos independentes, cada um com `repositorioPadrao`
  privado não exportado — a composição exige um módulo novo em vez de importar um do outro
  (`base/lancamentos-receita.md`).
- Sem `Idempotency-Key`, a Function hoje chama o repositório direto sem transação — para `de_fora`
  isso precisa de uma transação simples própria, senão o depósito e a receita podem divergir numa
  falha parcial (ver plano aprovado, seção 3).
