# Fluxo de lançamentos

## Contrato de entrada

`POST /lancamentos` recebe receita ou despesa validada por Zod. Despesa parcelada aceita de 2 a 360 parcelas em `src/functions/api/lancamentos.ts:12-27`.

## Contrato de saída

O endpoint retorna uma lista de lançamentos e status 201 em `src/functions/api/lancamentos.ts:148-159`. Parcelamentos geram várias linhas com o mesmo `parcelamentoId`.

## Limites e cotas

Quantidade de parcelas: mínimo 2 e máximo 360, definidos em `src/functions/api/lancamentos.ts:24`.

## Erros conhecidos e tratamento

JSON ou payload inválido retorna 400. Não existe chave que associe uma tentativa repetida à criação anterior.

## Riscos para a nossa implementação

Uma repetição cria outra receita, despesa ou conjunto completo de parcelas. A chave precisa proteger o lote inteiro, não cada parcela individual.

## Fonte

`src/functions/api/lancamentos.ts:12-27,35-48,148-159` e `src/state/lancamentos-context.tsx:150-176` - acessados em 2026-10-11.
