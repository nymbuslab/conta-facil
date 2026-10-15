# Padrões de teste — caixinhas e migrations

## Contrato de entrada

- Testes unitários/Vitest: `src/functions/api/caixinhas.test.ts`,
  `src/hooks/use-saldo-acumulado.test.tsx`, `src/state/caixinhas-context.test.tsx`,
  `src/components/movimentar-caixinha-modal.test.tsx`, `src/db/schema.test.ts` — rodados por
  `npm run test` (Vitest).
- Teste de integração real contra a branch Neon `test`:
  `src/test/caixinhas-setup.ts` (script de setup, não arquivo `*.test.ts`), chamado por
  `npm run test:integration:idempotencia` (ver `CLAUDE.md` do projeto). Sempre atrás de
  `garantirBranchDeTeste()` + `confirmarIdentidadeConexao()`
  (`src/test/guardar-branch-teste.ts`), que recusam rodar fora da branch `test`/`test-*`.
- Migrations: `drizzle/0000_init.sql`, `drizzle/0001_idempotencia.sql`,
  `drizzle/0002_paginacao_indices.sql` — numeração sequencial de 4 dígitos + nome descritivo.
  Aplicadas por `npm run test:migrate` (branch de teste) e manualmente em `production` (ver
  `CLAUDE.md`, seção "Env vars"/"Rollout").

## Contrato de saída

`src/test/caixinhas-setup.ts` prova, com usuários reais criados via Neon Auth e dados reais no
Postgres de teste: depósito/resgate concorrente com a mesma `Idempotency-Key` produz um único
efeito (replay), reuso da chave com payload diferente dá 409, chave reaproveitável após falha de
negócio (400), isolamento da chave por usuário, e o saldo final bate exatamente com a sequência de
operações. É o teste mais próximo do real que existe para este fluxo.

## Limites e cotas

NÃO DOCUMENTADO.

## Erros conhecidos e tratamento

NÃO DOCUMENTADO (fora do escopo do que foi lido).

## Riscos para a nossa implementação

- Qualquer mudança no contrato de `POST /:id/depositar` (novo campo) precisa de task dedicada
  para atualizar `caixinhas-setup.ts`, senão o teste de integração real para de refletir o
  comportamento novo sem quebrar (ele só falha se o `valorGuardado` final divergir, não se um
  campo novo for ignorado).
- Migration nova precisa seguir a numeração sequencial (`0003_<nome>.sql`) e ser testada primeiro
  na branch `test` antes de qualquer aplicação em `production` — padrão já registrado no
  `CLAUDE.md` do projeto para as migrations anteriores.

## Fonte

`src/test/caixinhas-setup.ts` (lido integralmente), `drizzle/*.sql` (nomes, via `ls`) — acessado
em 2026-10-15
