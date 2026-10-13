# Migrations Drizzle em production

> Como a migration entra no fluxo de deploy e por que ela vem antes da Function e do frontend.

## Contrato de entrada

- `npx drizzle-kit migrate` lê `DATABASE_URL_UNPOOLED` do ambiente (`drizzle.config.ts:3-17`) — a conexão pooled não suporta DDL/controle de migration (mensagem de erro do próprio config, `drizzle.config.ts:7`).
- Migrations vivem em `drizzle/*.sql` com journal em `drizzle/meta/_journal.json`; `package.json` expõe `db:generate` (gerar) e `db:migrate` (aplicar) (`package.json:26-27`).
- No rollout de `production`, a migration `drizzle/0000_init.sql` foi aplicada via MCP `run_sql_transaction` contra a branch `production` (`docs/sprintx/features/rollout-neon-production/00-BLOQUEIOS.md`, B-01); o mesmo bloqueio documentou as alternativas: `npx drizzle-kit migrate` com `DATABASE_URL_UNPOOLED` de production, ou SQL colado no SQL Editor do console Neon.
- A migration pendente atual é `drizzle/0001_idempotencia.sql` (tabela `idempotencias`), aplicada até agora somente na branch Neon de teste (`docs/sprintx/features/idempotencia-escrita-financeira/FECHAMENTO.md`, risco residual).

## Contrato de saída

- Aplicar migration cria/altera objetos na branch apontada. Verificação usada no rollout: `get_database_tables` + `describe_table_schema` conferindo colunas e constraints contra `src/db/schema.ts` (B-01).

## Limites e cotas

NÃO DOCUMENTADO nas fontes internas lidas.

## Erros conhecidos e tratamento

- `DATABASE_URL_UNPOOLED` ausente → `drizzle.config.ts` lança na subida (`drizzle.config.ts:5-9`).
- Escrita em production via MCP foi classificada como "Production Deploy" pelo harness e exigiu permissão explícita do usuário (B-01) — espera-se o mesmo para `drizzle-kit migrate` contra production.
- Migration em produção é destrutiva quando o SQL contém `DROP`/`DELETE` — B-01 nota que a `0000` era só aditiva; cada migration nova precisa da mesma checagem antes de rodar.

## Riscos para a nossa implementação

- O fluxo unificado precisa detectar migrations pendentes antes de decidir se o passo de migration roda — comando para listar pendentes sem aplicar: NÃO DOCUMENTADO nas fontes internas (lacuna 4 da base).
- Ordem: migration DEVE preceder o deploy da Function nova que a referencia (a Function de idempotência usa a tabela `idempotencias`; o risco residual do FECHAMENTO exige "aplicar a migration e publicar a Function antes do frontend").

## Fonte

`drizzle.config.ts` (raiz) — acessado em 2026-10-12; `package.json` (scripts `db:*`) — acessado em 2026-10-12; `docs/sprintx/features/rollout-neon-production/00-BLOQUEIOS.md` (B-01) — acessado em 2026-10-12; `docs/sprintx/features/idempotencia-escrita-financeira/FECHAMENTO.md` — acessado em 2026-10-12.
