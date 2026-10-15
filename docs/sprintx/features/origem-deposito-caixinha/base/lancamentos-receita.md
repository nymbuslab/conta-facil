# Criação de lançamento de receita (caso a decisão exija vincular)

## Contrato de entrada

`src/functions/api/lancamentos.ts:29-33` — para criar uma receita via `POST /lancamentos`:

```ts
baseLancamentoSchema.extend({
  tipo: z.literal('receita'),
  dataEmissao: z.string().date(),
})
// baseLancamentoSchema: { descricao: string (min 1), valor: number (int positivo) }
```

`prepararLancamentos` (`src/functions/api/lancamentos.ts:292-301`) monta a linha para inserção:
`{ userId, tipo: 'receita', descricao, valor, dataEmissao }`. A rota aceita `Idempotency-Key`
opcional, mesmo padrão de `base/idempotencia.md`.

## Contrato de saída

`POST /lancamentos` devolve os lançamentos criados (array), status 201.

## Limites e cotas

`valor` é `integer` positivo em centavos, igual ao padrão de `caixinhas`.

## Erros conhecidos e tratamento

NÃO DOCUMENTADO nesta ingestão (rota não lida além do schema de criação e `prepararLancamentos`).

## Riscos para a nossa implementação

Se a F2 decidir que um depósito "de fora" deve gerar também uma receita vinculada, a Function de
caixinhas precisaria **ou** chamar a criação de lançamento dentro da mesma transação do depósito
(hoje são rotas/repositórios separados, sem acoplamento nenhum — `caixinhas.ts` não importa nada
de `lancamentos.ts`), **ou** o frontend dispara duas chamadas (depósito + receita) — o que quebra
a garantia de atomicidade que a idempotência hoje dá por operação única. Isso é uma decisão de
arquitetura real a levantar na F2, não um detalhe de implementação.

## Fonte

`src/functions/api/lancamentos.ts:24-40,292-301` (lido parcialmente, só os trechos de criação de
receita) — acessado em 2026-10-15
