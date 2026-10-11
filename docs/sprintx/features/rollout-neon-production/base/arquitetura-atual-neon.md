# Arquitetura atual da integração Neon (branch `test`)

> Substitua todos os marcadores `{{...}}`. Se a fonte não afirma algo, escreva `NÃO DOCUMENTADO` — nunca invente. Todo número vem acompanhado da referência que o afirma.

## Contrato de entrada

Declaração de infraestrutura em `neon.ts`: `auth: true`, uma Function `api` (`src/functions/api/index.ts`) com env `FUNCTION_ALLOWED_ORIGINS`, e um bucket `documentos` (`access: private`), sem uso nesta feature (`neon.ts:1-19`).

A Function expõe `app.route('/lancamentos', ...)` e `app.route('/caixinhas', ...)` sobre Hono, com CORS restrito a `FUNCTION_ALLOWED_ORIGINS` (lista separada por vírgula, default `http://localhost:5173` se a env não existir) e `authMiddleware` aplicado a tudo exceto `/health` (`src/functions/api/index.ts:1-28`).

Conexão com o Postgres: `DATABASE_URL` (pooled, usada em runtime pela Function via `pg.Pool` + `attachDatabasePool`, `src/functions/api/db.ts:1-19`) e `DATABASE_URL_UNPOOLED` (direta, exigida por `drizzle-kit` para gerar/rodar migration — `drizzle.config.ts:1-18`, que lança erro se a env não estiver definida).

## Contrato de saída

`neon deploy` aplica `neon.ts` à branch linkada e, ao final, baixa as env vars geridas pelo Neon (`DATABASE_URL`, etc.) para `.env.local` — comportamento documentado em `.claude/skills/neon/SKILL.md:352`. `neon deploy --env <arquivo>` carrega esse arquivo em `process.env` antes de avaliar `neon.ts` e sobe os valores de `functions.*.env` (aqui, `FUNCTION_ALLOWED_ORIGINS`) como env da Function (`.claude/skills/neon/SKILL.md:354-356`).

## Limites e cotas

NÃO DOCUMENTADO — nenhuma fonte lida (código do projeto ou skills do Neon) afirma limite de linhas, tamanho de payload ou cota de requisições para a Function `api` deste projeto.

## Erros conhecidos e tratamento

- `DATABASE_URL` ausente faz `obterBanco()` lançar `Error('DATABASE_URL nao definida')` (`src/functions/api/db.ts:13`).
- `DATABASE_URL_UNPOOLED` ausente faz `drizzle.config.ts` lançar erro explicando que a conexão pooled não suporta DDL/controle de migration (`drizzle.config.ts:5-10`).
- `FUNCTION_ALLOWED_ORIGINS` ausente faz o CORS da Function cair no default `http://localhost:5173` (`src/functions/api/index.ts:10`) — qualquer outra origem (inclusive a de produção) é rejeitada silenciosamente pelo CORS (`origin: (origin) => origensPermitidas.includes(origin) ? origin : undefined`).
- O projeto declara em `CLAUDE.md` que `FUNCTION_ALLOWED_ORIGINS` é "obrigatória no deploy".

## Riscos para a nossa implementação

- O rollout para `production` precisa de uma nova origem permitida (domínio de produção do frontend) em `FUNCTION_ALLOWED_ORIGINS`, ou o app autenticado em produção será bloqueado por CORS sem erro visível no servidor.
- A migration (`drizzle/0000_init.sql`) ainda não foi aplicada em nenhuma branch chamada `production` — não há evidência no código ou nos docs da feature anterior de que isso já ocorreu (ver lacuna).
- `test:db:reset` (`scripts/neon-test-reset.sh`) e os setups de integração só podem rodar com `NEON_BRANCH` igual a `test` ou `test-*` (`CLAUDE.md`, seção "Decisões de arquitetura") — nenhum desses scripts pode ser usado contra `production`, de propósito.

## Fonte

- `neon.ts:1-19` — acessado em 2026-10-10
- `src/functions/api/index.ts:1-28` — acessado em 2026-10-10
- `src/functions/api/db.ts:1-19` — acessado em 2026-10-10
- `drizzle.config.ts:1-18` — acessado em 2026-10-10
- `CLAUDE.md` (seções "Env vars" e "Decisões de arquitetura") — acessado em 2026-10-10
