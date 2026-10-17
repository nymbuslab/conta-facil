# Convenções de teste e idempotência usadas no projeto

## Contrato de entrada

`executarComIdempotencia` (`src/functions/api/idempotencia.ts`) recebe
`{ userId, chave, operacao, payload }` + um callback de mutação, calcula um hash canônico do
payload (`calcularHashRequisicao`, `idempotencia.ts:50-52`, ordena chaves recursivamente antes
de hashear) e usa uma transação com lock por `(userId, chave)`. Usado hoje em `POST /lancamentos`
(`lancamentos.ts:496-508`) e nas mutações de caixinha. **Não usado** em `PATCH /:id/pagar`.

Testes de integração contra banco real exigem `garantirBranchDeTeste()`
(`src/test/guardar-branch-teste.ts:22-31`) — recusa rodar se `NEON_BRANCH` não casar com
`/^test(-[A-Za-z0-9_-]+)?$/, nunca configurável por env var solta. Chamada nos pontos de
entrada que escrevem no Postgres de teste (comentário em `CLAUDE.md`, "Segurança de teste de
integração": 11 pontos de entrada hoje).

## Contrato de saída

Resultado de `executarComIdempotencia`: `{ tipo: 'executada' | 'replay', status, corpo }` ou
`{ tipo: 'conflito' }` (mesmo payload com hash diferente reusando a chave → `409`).

## Limites e cotas

NÃO DOCUMENTADO (sem TTL explícito na leitura do código desta sessão; `CLAUDE.md` cita
retenção de 90 dias via `npm run manutencao:limpar-idempotencias`, sem cron automático).

## Erros conhecidos e tratamento

Reuso de `Idempotency-Key` com payload diferente → `409` (`lancamentos.ts:505-507`).

## Riscos para a nossa implementação

- Se a F2 decidir que editar/excluir precisam de idempotência (proteção contra duplo clique
  + retry de rede), é reaproveitar `executarComIdempotencia`, não reinventar — mesmo padrão
  do `POST /lancamentos`.
- Teste de integração desta feature (se precisar tocar banco real) precisa passar por
  `garantirBranchDeTeste()`/`confirmarIdentidadeConexao()`, igual todo teste de integração
  existente no projeto.

## Fonte

`src/functions/api/idempotencia.ts`, `src/test/guardar-branch-teste.ts:1-31`, `CLAUDE.md`
(seções "Idempotência financeira" e "Segurança de teste de integração") — lidos em
2026-10-17.
