# Backend — rotas e repositório de `lancamentos`

## Contrato de entrada

`criarRotasLancamentos(repositorio, executarIdempotencia)` (`src/functions/api/lancamentos.ts:413-416`)
monta as rotas Hono sob `/lancamentos`. Hoje existem:
- `GET /` (listar, paginado por cursor) — `lancamentos.ts:419-434`.
- `GET /resumo` — `lancamentos.ts:436-442`.
- `GET /parcelamentos` — `lancamentos.ts:444-456`.
- `GET /vencendo`, `GET /recentes` — `lancamentos.ts:458-477`.
- `POST /` (criar, com `Idempotency-Key` opcional) — `lancamentos.ts:479-515`.
- `PATCH /:id/pagar` (marcar como paga) — `lancamentos.ts:517-524`.

**Não existe** `PATCH /:id` (editar campos) nem `DELETE /:id` para lançamentos — só para
caixinhas (`DELETE /caixinhas/:id`, `src/functions/api/caixinhas.ts:369`).

O contrato `RepositorioLancamentos` (`lancamentos.ts:155-163`) é a interface que toda rota usa
(em vez do banco direto), o que permite mock em teste (`src/functions/api/lancamentos.test.ts:15-38`
constrói um repositório fake). Qualquer rota nova de editar/excluir precisa adicionar o método
correspondente a essa interface e ao `repositorioPadrao` (`lancamentos.ts:165` em diante).

`POST /` aceita `Idempotency-Key` (uuid) e usa `executarComIdempotencia`
(`src/functions/api/idempotencia.ts`) quando presente; sem a chave, cria direto. `PATCH /:id/pagar`
**não** usa idempotência hoje (`lancamentos.ts:517-524` não lê `Idempotency-Key`).

## Contrato de saída

`POST /` devolve `201` com os lançamentos criados (array, por causa de parcelamento).
`PATCH /:id/pagar` devolve `200` com o lançamento atualizado, ou `404` se não existir/não for
do usuário. `GET /` devolve `{ itens, proximoCursor }`.

## Limites e cotas

Paginação por cursor keyset (`criadoEm`, `id`), limite padrão e máximo em
`src/lib/paginacao.ts` (`LIMITE_PADRAO`, `LIMITE_MAXIMO`, citados em `lancamentos.ts:14-20`).

## Erros conhecidos e tratamento

- Parâmetros inválidos → `400` com `{ erro: 'Parâmetros inválidos' }` (padrão repetido em
  quase toda rota GET).
- `id` que não bate no schema uuid → `404` com `{ erro: 'Lançamento não encontrado' }`
  (`lancamentos.ts:518-519`, mesmo padrão que uma rota de editar/excluir deve seguir).
- `marcarComoPaga` do repositório filtra `tipo = 'despesa'` na cláusula `where`
  (`lancamentos.ts:248-261`) — tentar pagar uma receita simplesmente não encontra linha e
  devolve `null`/404, nunca um erro de validação explícito.

## Riscos para a nossa implementação

- Qualquer rota nova de editar precisa decidir se reaplica a validação de
  `criarLancamentoSchema`/`despesaBaseSchema` (`lancamentos.ts:25-41`) ou um schema próprio
  (edição pode ter regras diferentes de criação, ex.: não permitir trocar `tipo`).
- `marcarComoPaga` já é o único precedente de mutação parcial (`PATCH`) sem idempotência —
  se editar/excluir seguirem o mesmo padrão, falha de rede + retry do cliente pode duplicar
  efeito (ex.: excluir duas vezes é inofensivo, mas editar duas vezes com payloads diferentes
  em retry não é).

## Fonte

`src/functions/api/lancamentos.ts` (linhas citadas acima) e
`src/functions/api/caixinhas.ts:369` — lidos em 2026-10-17.
