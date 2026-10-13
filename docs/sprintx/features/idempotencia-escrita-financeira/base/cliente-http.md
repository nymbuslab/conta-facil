# Cliente HTTP

## Contrato de entrada

O cliente recebe caminho, método, corpo e token. Em escritas, define `Authorization` e `Content-Type` em `src/lib/api-client.ts:25-31`.

## Contrato de saída

Respostas 2xx viram JSON ou `undefined` para 204. Falhas viram `ApiError` com status e mensagem em `src/lib/api-client.ts:38-50`.

## Limites e cotas

NÃO DOCUMENTADO para timeout, quantidade de tentativas ou backoff.

## Erros conhecidos e tratamento

O método `post` envia uma única requisição e não aceita cabeçalho idempotente em `src/lib/api-client.ts:54-59`.

## Riscos para a nossa implementação

Gerar uma chave nova em cada repetição elimina a proteção. A mesma operação lógica precisa conservar a chave entre a primeira tentativa e a repetição automática.

## Fonte

`src/lib/api-client.ts:1-66` - acessado em 2026-10-11.
