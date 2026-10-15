# Schema de banco — caixinhas, lancamentos e idempotencia

## Contrato de entrada

`src/db/schema.ts:47-64` — tabela `caixinhas` (Drizzle, Postgres):

```ts
export const caixinhas = pgTable(
  'caixinhas',
  {
    id: uuid().defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    nome: text().notNull(),
    valorGuardado: integer('valor_guardado').notNull().default(0),
    meta: integer().notNull(),
    criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
    atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).notNull().defaultNow(),
  },
  (tabela) => [
    index('caixinhas_user_id_idx').on(tabela.userId),
    index('caixinhas_user_criado_id_idx').on(tabela.userId, tabela.criadoEm, tabela.id),
    check('caixinhas_valor_guardado_nao_negativo', sql`${tabela.valorGuardado} >= 0`),
    check('caixinhas_meta_positiva', sql`${tabela.meta} > 0`),
  ],
)
```

Não existe tabela de movimentações por caixinha: `valorGuardado` é um total acumulado, atualizado
por `UPDATE ... SET valor_guardado = valor_guardado + valor` (depósito) ou `- valor` (resgate) —
`src/functions/api/caixinhas.ts:113-148`. Não há registro de cada depósito/resgate individual, só
o saldo corrente.

`src/db/schema.ts:19-45` — tabela `lancamentos`: `tipo` é enum `pgEnum('tipo_lancamento',
['receita', 'despesa'])`. Receita exige `dataEmissao` preenchido e `vencimento` nulo (constraint
`lancamentos_campos_por_tipo`, `src/db/schema.ts:40-43`). Valores são `integer` (centavos).

`src/db/schema.ts:66-81` — tabela `idempotencias`: chave única por `(userId, chave)`, usada pelas
mutações financeiras (`depositar`, `resgatar`, criação de lançamento) via
`executarComIdempotencia` (`src/functions/api/idempotencia.ts`).

## Contrato de saída

`CaixinhaBanco = typeof caixinhas.$inferSelect` — todas as colunas da tabela, incluindo `userId` e
timestamps internos (`src/db/schema.ts:85`). O endpoint de listagem projeta só um subconjunto
público (ver `base/function-caixinhas.md`).

## Limites e cotas

NÃO DOCUMENTADO (sem rate limit ou limite de tamanho específico para caixinhas além dos checks de
banco acima).

## Erros conhecidos e tratamento

- `caixinhas_valor_guardado_nao_negativo`: o Postgres rejeita qualquer `UPDATE` que deixaria
  `valorGuardado` negativo — é essa constraint, e não lógica de aplicação, que garante que um
  resgate maior que o saldo nunca é aplicado (`src/functions/api/caixinhas.ts:125-148` trata o
  caso lendo o estado atual depois do `UPDATE` sem efeito).

## Riscos para a nossa implementação

Qualquer decisão de rastrear a origem do depósito (saldo atual vs. dinheiro de fora) por
depósito individual exige **schema novo** — hoje não há onde guardar essa informação por
movimento, só o total acumulado por caixinha. Uma migration nova (`drizzle/000N_<nome>.sql`,
seguindo a numeração sequencial existente) é inevitável se a decisão for granular por depósito.
Se a decisão for por caixinha inteira (não por depósito), ainda assim exige uma coluna nova em
`caixinhas` (ex.: separar `valorGuardado` em duas parcelas, ou um novo campo booleano/enum).

## Fonte

`src/db/schema.ts` (lido integralmente) — acessado em 2026-10-15
