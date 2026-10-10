# Neon Data API e Lakebase Postgres

## Contrato de entrada

- `neon.ts` atual (`neon.ts:1-10`) declara só `auth: true` e o bucket `documentos`. **Não
  declara `dataApi`** — a decisão registrada em `CLAUDE.md` ("optou por Neon Data API + Neon
  Managed Auth") ainda não está refletida na infraestrutura como código do projeto.
  — Fonte: `neon.ts`, `CLAUDE.md` (seção "Decisões de arquitetura").
- Para habilitar a Data API: `dataApi: true` em `neon.ts`, o que exige `authProvider` — por
  padrão `"neon"`, que por sua vez exige `auth: true` já habilitado (já está). Alternativa:
  `authProvider: "external"` com `jwksUrl` de outro IdP.
  — Fonte: `.claude/skills/neon/SKILL.md:408-429`.
- Conexão direta ao Postgres (fora da Data API): `DATABASE_URL` (pooled, via PgBouncer) e
  `DATABASE_URL_UNPOOLED` (direta) — ambas já confirmadas por nome em `.env.local` e documentadas
  em `CLAUDE.md`.

## Contrato de saída

- NÃO DOCUMENTADO o formato exato das respostas da Data API (é um endpoint HTTP compatível com
  PostgREST) — a skill local não detalha o contrato de request/response, só quando usá-la.
- Conexão Postgres direta: resultado é o que o driver escolhido devolver (node-postgres,
  `@neondatabase/serverless`, etc.) — nenhum driver está instalado hoje no `package.json`.

## Limites e cotas

- Conexão pooled (`-pooler`, usada para tráfego de app) não suporta operações de nível de
  sessão (`SET`, `LISTEN/NOTIFY`, prepared statements persistentes entre chamadas).
  — Fonte: `.claude/skills/neon-postgres/SKILL.md:273-281`.
- Migração de schema e `pg_dump`/`pg_restore` exigem a conexão direta (`DATABASE_URL_UNPOOLED`),
  nunca a pooled.
  — Fonte: `.claude/skills/neon-postgres/SKILL.md:95-99,273-281`.

## Erros conhecidos e tratamento

- Rodar migration ou operação de sessão na conexão pooled falha de formas que não mencionam
  pooling (`prepared statement "s0" already exists`, `SET search_path` que não persiste,
  `SQLSTATE 25006` em escrita que caiu numa transação read-only herdada) — a causa real é sempre
  "usou a string errada", não um bug da migration.
  — Fonte: `.claude/skills/neon-postgres/SKILL.md:280`.

## Riscos para a nossa implementação

- **Risco mais importante da base.** A skill oficial `neon` (`.claude/skills/neon/SKILL.md:38,
  54,58,86-88`) é explícita: a Data API serve só como caminho de migração para um app que já
  depende de PostgREST ou de um cliente `supabase-js` — "apps novos consultam o Postgres via
  Functions ou handlers existentes, não a Data API". Ela também desaconselha PostgREST
  diretamente no browser confiando em RLS como controle de acesso ("é fácil configurar errado:
  política mal feita expõe o banco ao cliente"). O Conta Fácil é um app novo, sem dependência
  prévia de PostgREST/Supabase — a decisão já tomada no `CLAUDE.md` local ("Data API porque o
  app é SPA sem backend próprio") contradiz essa recomendação, que aponta para **Neon Functions**
  como a camada de API para um SPA sem backend, não a Data API. Isso é uma decisão que precisa
  ser revisitada explicitamente na F2, com o usuário, antes do plano — não é algo que a F1 decide.
- Nenhum driver Postgres nem SDK de Data API está instalado ainda (`package.json` não lista
  `@neondatabase/serverless`, `pg`, `drizzle-orm`, nem um client HTTP para a Data API) — qualquer
  caminho escolhido parte do zero.
- Nenhuma migration nem schema existe no repositório hoje (`supabase/migrations`,
  `prisma/migrations`, `alembic/versions` ou `drizzle` não encontrados) — schema de usuários,
  lançamentos e caixinhas está inteiramente por definir.

## Fonte

`.claude/skills/neon/SKILL.md` (local ao projeto) — acessado em 2026-10-10.
`.claude/skills/neon-postgres/SKILL.md` (local ao projeto) — acessado em 2026-10-10.
`neon.ts`, `package.json`, `CLAUDE.md` (raiz do projeto) — acessado em 2026-10-10.
