---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: editar-excluir-lancamentos
sprint_id: sprint-02
titulo: Backend - editar e excluir lancamento
status: concluido
criterio_saida: rotas PATCH e DELETE /lancamentos/:id funcionam contra o repositorio real, com idempotencia e bloqueio de vinculo com caixinha
fases: [F-02.1, F-02.2, F-02.3]
riscos: [Sem FK real entre lancamentos e caixinha_movimentacoes - caixinha-movimentacoes-risco.md, totalParcelas e copiado por linha e precisa ser corrigido manualmente ao excluir parcela - parcelamento-estrutura.md]
atualizado_em: 2026-10-17
---

# Sprint 02 — Backend: editar e excluir lançamento

## Objetivo

Dar ao `RepositorioLancamentos` os métodos `buscarPorId`, `estaVinculadoACaixinha`, `editar` e
`excluir`, e expor isso como as rotas `PATCH /lancamentos/:id` e `DELETE /lancamentos/:id`,
com idempotência e o bloqueio de edição/exclusão de receita vinculada a caixinha (D-04).

`T-02.04` e `T-02.06` (as duas rotas) dependem também de `T-01.02` (sprint-01), que dá ao
teste de rota o repositório fake mockável — dependência cruzada de sprint, fora do diagrama
desta sprint (que só desenha tasks do próprio `tasks.md`), mas declarada no `depende_de` de
cada task.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-02.1 | Leitura de apoio | nenhuma |
| F-02.2 | Editar lançamento | nenhuma |
| F-02.3 | Excluir lançamento | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

`npm run test -- --run src/functions/api/lancamentos.test.ts` termina com 0 failed, cobrindo
editar/excluir com e sem `alcance`, bloqueio de caixinha e idempotência.

## Riscos conhecidos

- Sem FK real entre `lancamentos` e `caixinha_movimentacoes` — o bloqueio do D-04 é só de
  aplicação (`caixinha-movimentacoes-risco.md`).
- `totalParcelas` é copiado por linha, não calculado — excluir uma parcela com `alcance:
  'somente'` no meio do grupo deixa as linhas remanescentes com `totalParcelas` desatualizado
  se a correção não for feita (`parcelamento-estrutura.md`).
