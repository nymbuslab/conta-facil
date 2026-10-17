# Conta Fácil

Aplicativo mobile-first de controle financeiro pessoal. Cada usuário acessa seus próprios
lançamentos, parcelamentos e caixinhas por uma conta autenticada.

## Stack

- React 19, TypeScript, Vite e TanStack Router
- Tailwind CSS 4, componentes shadcn/ui-style e ícones Lucide
- Neon Managed Auth
- Neon Functions com Hono
- Neon Postgres com Drizzle ORM
- Vitest e Testing Library

## Como rodar

```bash
npm install
npm run dev
npm run test -- --run
npm run build
npm run lint
npm run audit:security
npm run pentest
npm run test:migrate
npm run test:integration:idempotencia
```

As variáveis locais são obtidas do Neon e ficam em `.env.local`, que não é versionado:

```bash
neon env pull
```

Para executar as integrações contra a branch de teste, use os comandos
`test:integration:*` definidos em `package.json`. O arquivo `.env.test.local` também é local e
ignorado pelo Git.

## Arquitetura

O navegador autentica pelo Neon Managed Auth (através de um proxy reverso same-origin,
`functions/auth/[[catchall]].js`, para a sessão persistir em navegadores que bloqueiam cookie de
terceiros) e chama somente a Neon Function `api`, enviando o JWT da sessão. A Function valida o
token, extrai o usuário e acessa o Postgres. O SPA nunca recebe credenciais do banco e cada
consulta é filtrada por `user_id`.

```text
React SPA -> proxy /auth/* -> Neon Managed Auth -> JWT -> Neon Function -> Drizzle -> Neon Postgres
```

O schema está em `src/db/schema.ts`, as migrations em `drizzle/` e as rotas da Function em
`src/functions/api/`. A tabela `idempotencias` protege criação de lançamentos, depósitos e
resgates: o frontend envia `Idempotency-Key`, a Function serializa usuário + chave e persiste a
mutação e a resposta na mesma transação. As decisões e o histórico ficam em
`docs/sprintx/features/integracao-neon/` e
`docs/sprintx/features/idempotencia-escrita-financeira/`.

As listas (lançamentos e caixinhas) usam paginação por cursor com filtro de mês e busca no
servidor; os totais do mês (`/lancamentos/resumo`) e os parcelamentos (`/lancamentos/parcelamentos`,
agrupados) vêm de endpoints dedicados, não da soma das páginas carregadas. Os índices `(user_id,
criado_em, id)` que sustentam a paginação estão em `drizzle/0002_paginacao_indices.sql`.

## Estado da entrega

Em produção: `https://contafacil.nymbuslab.com.br`. A branch Neon `production` tem o schema de
negócio e a Function `api` implantados, o frontend é publicado no Cloudflare Pages, e o golden
path autenticado foi validado de ponta a ponta contra o domínio real. O procedimento de rollback
por Instant Restore está documentado em `docs/sprintx/features/rollout-neon-production/ROLLBACK.md`.

A idempotência financeira está implementada e implantada em `production` desde 2026-10-13:
migration e Function publicadas, golden path de escrita validado manualmente. O replay de
`Idempotency-Key` e o 409 por reuso continuam provados pelos testes de integração na branch
`test`, por ser o mesmo código sem lógica nova implantada — não há reteste pendente.
