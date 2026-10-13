# Fluxo de caixinhas

## Contrato de entrada

Os endpoints `depositar` e `resgatar` recebem UUID da caixinha e valor inteiro positivo em centavos em `src/functions/api/caixinhas.ts:117-142`.

## Contrato de saída

Depósito e resgate retornam a caixinha atualizada. Caixinha inexistente retorna 404; saldo insuficiente retorna 400.

## Limites e cotas

O valor precisa ser inteiro e positivo; não há limite máximo documentado.

## Erros conhecidos e tratamento

O resgate usa uma atualização condicional com `valor_guardado >= valor`, evitando saldo negativo em `src/functions/api/caixinhas.ts:55-68`. Nenhum dos dois endpoints reconhece uma tentativa repetida.

## Riscos para a nossa implementação

As expressões SQL atuais são atômicas por chamada, mas duas chamadas iguais continuam somando ou subtraindo duas vezes.

## Fonte

`src/functions/api/caixinhas.ts:25-77,117-146` e `src/state/caixinhas-context.tsx:127-154` - acessados em 2026-10-11.
