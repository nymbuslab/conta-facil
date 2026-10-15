# Idempotência de escrita financeira

## Contrato de entrada

`src/functions/api/idempotencia.ts:79-134` — `criarExecutorIdempotencia` recebe `{ userId,
chave (UUID), operacao: string, payload: unknown }` e uma função `mutacao(banco) => Promise<{
status, corpo }>`. Usado por `depositar`/`resgatar` de caixinhas e pela criação de lançamentos
(`src/functions/api/caixinhas.ts:240-255`, `src/functions/api/lancamentos.ts:404+`).

O hash de deduplicação (`calcularHashRequisicao`, `idempotencia.ts:52-54`) é calculado sobre o
`payload` inteiro, com chaves ordenadas — então qualquer campo novo no corpo de
`POST /:id/depositar` (ex.: origem do valor) entra automaticamente no hash, sem código extra.

## Contrato de saída

`ResultadoIdempotencia`: `{ tipo: 'executada' | 'replay', status, corpo }` ou `{ tipo: 'conflito'
}` — conflito quando a mesma chave é reusada com `operacao` ou `hashRequisicao` diferentes
(`idempotencia.ts:93-96`).

## Limites e cotas

Chave única por `(userId, chave)` no banco (`idempotencias_user_id_chave_unique`,
`src/db/schema.ts:79`). Retenção de 90 dias, limpa por `npm run manutencao:limpar-idempotencias`
(ver `CLAUDE.md` do projeto).

## Erros conhecidos e tratamento

Mutação que falha dentro da transação (ex.: caixinha não encontrada, saldo insuficiente) lança
`RespostaMovimentacaoError` — a trava `pg_advisory_xact_lock` garante que duas requisições com a
mesma chave não correm em paralelo (`idempotencia.ts:60-62`).

## Riscos para a nossa implementação

Se a feature acrescentar um campo ao corpo de `POST /:id/depositar`, os testes de idempotência
existentes (`src/functions/api/idempotencia.test.ts`, `src/functions/api/caixinhas.test.ts`)
precisam continuar cobrindo o novo shape do payload — o comportamento de hash/replay não muda,
mas o formato do payload testado muda.

## Fonte

`src/functions/api/idempotencia.ts` (lido integralmente) — acessado em 2026-10-15
