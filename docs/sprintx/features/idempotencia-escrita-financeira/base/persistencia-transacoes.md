# Persistência e transações

## Contrato de entrada

O schema atual contém `lancamentos` e `caixinhas`, ambas isoladas por `user_id`, em `src/db/schema.ts:17-60`. O banco é acessado por Drizzle sobre `node-postgres` em `src/functions/api/db.ts`.

## Contrato de saída

Drizzle oferece `db.transaction`, que confirma todas as operações como uma unidade ou desfaz o conjunto. PostgreSQL oferece unicidade e `INSERT ... ON CONFLICT` atômico sob concorrência.

## Limites e cotas

NÃO DOCUMENTADO o tamanho máximo da resposta que será armazenada. NÃO DOCUMENTADO o prazo de retenção das chaves.

## Erros conhecidos e tratamento

Fazer `SELECT` antes de `INSERT` sem uma restrição única cria corrida. A reserva da chave e a mutação financeira precisam permanecer na mesma transação curta.

## Riscos para a nossa implementação

Uma transação aberta enquanto aguarda rede aumenta contenção. O fluxo não deve chamar serviços externos dentro dela. A unicidade precisa incluir o usuário para não permitir leitura cruzada de respostas.

## Fonte

`src/db/schema.ts:17-60`, `src/functions/api/db.ts` - acessados em 2026-10-11. Drizzle: https://orm.drizzle.team/docs/transactions. PostgreSQL: https://www.postgresql.org/docs/16/transaction-iso.html e https://www.postgresql.org/docs/current/sql-insert.html - acessados em 2026-10-11.
