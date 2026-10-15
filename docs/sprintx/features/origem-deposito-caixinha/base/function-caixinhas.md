# Neon Function — rotas de caixinhas

## Contrato de entrada

`src/functions/api/caixinhas.ts:179-304` (`criarRotasCaixinhas`), montado em
`src/functions/api/index.ts` (NÃO DOCUMENTADO o caminho exato de montagem — não lido nesta
ingestão, mas o padrão das outras Functions é prefixo `/caixinhas`).

- `GET /` — query `limite`/`cursor` (paginação por cursor), devolve página + `totalGuardado`
  (soma de todas as caixinhas do usuário, calculada no banco:
  `src/functions/api/caixinhas.ts:102-108`).
- `POST /` — `{ nome: string (min 1), meta: number (int positivo) }` → cria caixinha com
  `valorGuardado: 0`.
- `POST /:id/depositar` — `{ valor: number (int positivo) }`, em centavos. Aceita header opcional
  `Idempotency-Key` (UUID). Sem a chave, executa direto; com a chave, passa por
  `executarComIdempotencia` (ver `base/idempotencia.md`).
- `POST /:id/resgatar` — mesmo contrato de entrada do depósito.
- `DELETE /:id` — sem corpo.

Nenhuma rota aceita hoje um campo que diga se o valor "veio do saldo atual" ou não — o schema de
validação é só `movimentarSchema = z.object({ valor: z.number().int().positive() })`
(`src/functions/api/caixinhas.ts:26`).

## Contrato de saída

- `POST /:id/depositar` e `/:id/resgatar` devolvem o `CaixinhaBanco` inteiro (200) — inclui
  `valorGuardado` atualizado.
- Depósito: 404 se a caixinha não existe para o usuário.
- Resgate: 404 se não existe; 400 `{ erro: 'Saldo insuficiente' }` se o valor pedido é maior que
  o `valorGuardado` atual (`ResultadoResgate`, `src/functions/api/caixinhas.ts:37-40`).
- Com `Idempotency-Key`: replay devolve a mesma resposta já computada; reuso da chave com
  payload/operação diferente devolve 409 `{ erro: 'Chave de idempotência já usada com outro
  pedido' }`.

## Limites e cotas

`idParamSchema = z.string().uuid()` — id de caixinha precisa ser UUID válido, senão 404
(`src/functions/api/caixinhas.ts:158,223-224`). Sem outro limite documentado.

## Erros conhecidos e tratamento

- Corpo não é JSON válido → 400 `{ erro: 'Dados inválidos' }` (criar) ou `{ erro: 'Valor
  inválido' }` (depositar/resgatar).
- `Idempotency-Key` presente mas não é UUID → 400 `{ erro: 'Chave de idempotência inválida' }`.
- `RespostaMovimentacaoError` (`src/functions/api/caixinhas.ts:168-177`) carrega o status/corpo
  que o caminho idempotente precisa devolver quando a mutação falha dentro da transação
  (404 ou 400), sem derrubar o registro de idempotência.

## Riscos para a nossa implementação

- O `repositorio.depositar` (`src/functions/api/caixinhas.ts:113-124`) só sabe somar
  `valorGuardado`. Se a feature exigir não descontar do saldo quando a origem é "de fora", a
  Function precisa, no mínimo, devolver essa informação para o cálculo de saldo do frontend (ver
  `base/calculo-saldo.md`) — hoje o frontend deriva `totalGuardado` inteiro da soma de todas as
  caixinhas, sem noção de origem.
- Qualquer novo campo no corpo de `POST /:id/depositar` quebra o contrato de idempotência por
  hash: `calcularHashRequisicao` (`src/functions/api/idempotencia.ts:52-54`) já inclui `payload`
  inteiro (`{ id, ...resultado.data }`), então adicionar um campo ao `movimentarSchema` muda o
  hash automaticamente — é compatível, mas precisa ser coberto pelos testes de idempotência
  existentes (`src/functions/api/idempotencia.test.ts`, `src/functions/api/caixinhas.test.ts`).

## Fonte

`src/functions/api/caixinhas.ts` (lido integralmente) — acessado em 2026-10-15
