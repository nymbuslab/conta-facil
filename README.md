# Conta Fácil

Aplicativo mobile-first de controle financeiro pessoal. Cada usuário acessa seus próprios
lançamentos, parcelamentos e caixinhas por uma conta autenticada.

## Stack

- React 19, TypeScript, Vite e TanStack Router
- Tailwind CSS, componentes shadcn/ui-style e ícones Lucide
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
```

As variáveis locais são obtidas do Neon e ficam em `.env.local`, que não é versionado:

```bash
neon env pull
```

Para executar as integrações contra a branch de teste, use os comandos
`test:integration:*` definidos em `package.json`. O arquivo `.env.test.local` também é local e
ignorado pelo Git.

## Arquitetura

O navegador autentica pelo Neon Managed Auth e chama somente a Neon Function `api`, enviando o
JWT da sessão. A Function valida o token, extrai o usuário e acessa o Postgres. O SPA nunca recebe
credenciais do banco e cada consulta é filtrada por `user_id`.

```text
React SPA -> Neon Managed Auth -> JWT -> Neon Function -> Drizzle -> Neon Postgres
```

O schema está em `src/db/schema.ts`, a migration em `drizzle/` e as rotas da Function em
`src/functions/api/`. As decisões e o histórico da integração estão em
`docs/sprintx/features/integracao-neon/`.

## Estado da entrega

A integração foi validada na branch Neon `test`, inclusive com a Function implantada. A promoção
para produção permanece separada e exige plano de rollout e rollback aprovado.
