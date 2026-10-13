# Conta Fácil

App de controle financeiro pessoal (protótipo em evolução para produto real). Mobile-first, tela
Início mostra o mês vigente, caixinhas (poupança por objetivo) e parcelamentos.

Repositório: https://github.com/nymbuslab/conta-facil (privado)

## Stack

- **React 19** + **Vite** + **TypeScript**, roteamento com **TanStack Router** (rotas em `src/routes/`).
- **Tailwind CSS 4** + plugin oficial do Vite, componentes shadcn/ui-style em
  `src/components/ui/` e ícones `lucide-react`.
- Formulários: **react-hook-form** + **zod** (schemas em `src/types/lancamento.ts`, `src/types/caixinha.ts`).
- Tabelas: `@tanstack/react-table` via `src/components/data-table.tsx`.
- Testes: **Vitest** + **Testing Library** (`npm run test`). Build: `npm run build` (roda `tsc -b` antes).
- Persistência: **Neon Postgres**, acessado somente por uma Neon Function com Hono e Drizzle ORM.
  Login e cadastro usam Neon Managed Auth; o cliente envia o JWT para a Function.

## Como rodar

```bash
npm install
npm run dev      # servidor local
npm run test     # suíte vitest
npm run build    # typecheck + build de produção
npm run audit:security                 # falha em alerta alto/crítico ou erro de rede
npm run test:migrate                   # aplica migrations somente em test/test-*
npm run test:integration:idempotencia  # concorrência e rollback no Postgres de teste
```

## Arquitetura

```
src/
  routes/          uma rota por tela: index (Início), caixinhas, parcelas, perfil, __root
  components/       componentes de tela + ui/ (primitivas tipo shadcn)
  state/            auth e contextos remotos de lançamentos e caixinhas
  db/               schema Drizzle de lançamentos, caixinhas e idempotências
  functions/api/    API Hono autenticada por JWT
  hooks/            use-saldo-acumulado (combina receitas/despesas filtradas + caixinhas)
  lib/              cliente HTTP autenticado, formatters e utilitários de data
  types/            schemas zod + interfaces (Lancamento = Receita | Despesa, Caixinha)
```

Fluxo de dados: `LancamentosProvider` e `CaixinhasProvider` (montados em `__root.tsx`) carregam e
alteram dados pela Neon Function usando `api-client.ts`; a resposta persistida atualiza o estado
React. Cada mutação passa por uma função do contexto, nunca por `setState` direto no componente. A tela
Início (`routes/index.tsx`) filtra receitas e despesas pelo **mês vigente** antes de somar e
listar — "Guardado" (caixinhas) é saldo corrido, não entra nesse filtro.

## Decisões de arquitetura

- **Despesa não tem data de emissão**, só vencimento — simplificação pedida explicitamente; o
  modelo antigo tinha os dois campos e uma regra de validação cruzada que foi removida.
- **Mês vigente** definido por `ehMesVigente` (`src/lib/datas.ts`), comparando ano/mês da data
  contra `new Date()` do ambiente — não há seletor de mês na UI ainda.
- **Parcelamento**: o usuário informa o valor de cada parcela, não o total — a Function multiplica
  esse valor pela quantidade de parcelas para gerar as N linhas, todas com o mesmo valor (mudança
  de 2026-10-11; antes era o inverso, dividindo um valor total com a sobra de centavos na última
  parcela).
- **Tabelas responsivas**: `DataTable` (`components/data-table.tsx`) e as primitivas de
  `ui/table.tsx` usam padding menor + `overflow-auto` no mobile; descrição trunca com reticências
  nas listas, detalhe completo só aparece no modal de pagamento.
- **Dialogs**: todo `DialogContent` (`ui/dialog.tsx`) tem margem lateral fixa no mobile
  (`w-[calc(100%-2rem)]`) — nunca encostar nas bordas da tela.
- **Persistência**: optou por **Neon Functions + Neon Managed Auth** como camada de API entre o
  SPA e o Postgres — o Postgres nunca é exposto direto ao browser. A Data API foi descartada
  (decisão revertida em 2026-10-10, D-02 em
  `docs/sprintx/features/integracao-neon/00-DECISOES.md`): a documentação oficial do Neon trata a
  Data API como caminho de migração para quem já depende de PostgREST/Supabase, não como escolha
  para um app novo — um app novo sem backend consulta o Postgres via Neon Functions. Login/
  cadastro real via `@neondatabase/auth` substituíram o perfil mockado. Toda rota privada exige
  sessão e cada consulta da Function filtra pelo `sub` do JWT.
- **Segurança de teste de integração**: todo script/teste que cadastra usuário real ou
  escreve/apaga linha no Postgres (`scripts/neon-test-reset.sh`, `src/test/*-setup.ts`,
  `src/state/*.integration.test.tsx`) chama `garantirBranchDeTeste()`
  (`src/test/guardar-branch-teste.ts`), que recusa rodar se `NEON_BRANCH` não for `test` ou
  `test-*` — esse padrão nunca é configurável por variável de ambiente, para não poder apontar
  para `production` por engano.
- **Troca de usuário no mesmo navegador**: `LancamentosProvider`/`CaixinhasProvider` são
  remontados com `key={usuario?.id}` em `__root.tsx` (`ProvedoresDeDados`) a cada troca de
  sessão — sem isso, uma resposta tardia da sessão anterior poderia aparecer nos dados do
  usuário que entrou depois.
- **Erro de sessão é distinto de deslogado**: `useAuth` (`src/state/auth-context.tsx`) tem
  `status: 'carregando' | 'autenticado' | 'anonimo' | 'erro'` — falha transitória de verificação
  (JWKS fora do ar, rede) vira `'erro'` com `recarregarSessao()` (refetch), e `__root.tsx` mostra
  tela de nova tentativa em vez de mandar pro login. No backend, `auth-middleware` separa token
  inválido/expirado (401) de serviço de auth indisponível (503); config ausente segue 500.
- **Formato do token do Neon Auth**: `cliente.token()` (plugin JWT) devolve `{ data: { token } }`;
  o objeto de `getSession()` devolve `{ data: { session: { token } } }` — este é o campo que a
  própria lib lê em `getJWTToken` (JWT injetado via header `set-auth-jwt`). `extrairToken`
  (`src/state/auth-context.tsx`) aceita os dois formatos de propósito; não "simplificar" para um
  só sem confirmar o adapter em uso.
- **Idempotência financeira**: criação de lançamentos, depósito e resgate aceitam
  `Idempotency-Key`. A chave é opcional no backend durante o rollout, mas o frontend novo sempre
  envia uma UUID por operação e repete no máximo uma vez apenas falha de rede, 502, 503 ou 504.
  A Function usa chave única por usuário, hash canônico e trava transacional; mutação e resposta
  idempotente são confirmadas juntas. Reuso com operação ou payload diferente retorna 409 e os
  logs não incluem descrição, payload ou valor. Migration `drizzle/0001_idempotencia.sql`;
  implantada em `production` desde 2026-10-13 (golden path de escrita validado manualmente; o
  replay da chave e o 409 por reuso continuam provados só pelos testes de integração na branch
  `test`).
- **Domínio confiável do Neon Auth**: toda branch nova precisa ter o domínio do frontend
  registrado via `add_auth_trusted_domain` (MCP do Neon) ou no console — sem isso, `sign-up`/
  `sign-in` tomam `403` mesmo com CORS da Function liberado, porque é uma allowlist separada do
  `FUNCTION_ALLOWED_ORIGINS`. Faltou nesse passo no rollout de `production`
  (`docs/sprintx/features/rollout-neon-production/00-BLOQUEIOS.md`, B-05) e só apareceu ao testar
  o golden path real.

## Env vars

Preenchidas por `neon link` em `.env.local` (nunca versionado — `.gitignore` cobre `.env.*`):

| Nome | Para quê |
|---|---|
| `DATABASE_URL` / `DATABASE_URL_UNPOOLED` | conexão Postgres, somente no servidor e scripts |
| `NEON_AUTH_BASE_URL` / `NEON_AUTH_JWKS_URL` | Neon Managed Auth |
| `NEON_FUNCTION_API_BASE_URL` | URL pública da Function `api`, exposta ao Vite como `VITE_NEON_FUNCTION_API_BASE_URL` |
| `FUNCTION_ALLOWED_ORIGINS` | Origens liberadas no CORS da Function (lista separada por vírgula) — declarada em `neon.ts`, obrigatória no deploy |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_ENDPOINT_URL_S3` / `AWS_REGION` | Object Storage (bucket `documentos`, privado) |
| `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` | Autenticação do `wrangler` contra a conta Cloudflare, usadas para publicar o frontend no Cloudflare Pages |

Configuração declarativa em `neon.ts` (`auth: true`, bucket `documentos` privado), aplicada com
`neon deploy`. Projeto Neon: `conta-facil` (`falling-tree-35553185`). A aplicação está em
produção: branch `production` (`br-rapid-night-b4f7w7vu`) com schema de negócio, Function `api`
e Auth; frontend publicado no Cloudflare Pages (projeto `conta-facil`) no domínio
`https://contafacil.nymbuslab.com.br`. Decisões e histórico do rollout em
`docs/sprintx/features/rollout-neon-production/`.

- **Deploy unificado em um comando**: `npm run deploy` (`scripts/deploy.mjs`) executa os dois
  passos na ordem certa — checa branch `master`/árvore limpa/link `.neon` em `production`, roda a
  auditoria de dependências (`audit:security`, aborta em alerta alto/crítico), faz o gate de
  migration, valida `FUNCTION_ALLOWED_ORIGINS`, roda `npx neon deploy --env`, faz o health check da
  Function e só então o push. Modo `--sim` (dry-run) roda a auditoria de verdade mas imprime o
  resto do plano sem executar nada. O checklist do que fica fora do script (env vars do Pages,
  domínio confiável, migration em production, reposição de `FUNCTION_ALLOWED_ORIGINS`) está em
  `DEPLOY.md`.
- **Deploy do backend é separado do deploy do frontend**: `git push` só dispara o build do
  Cloudflare Pages (frontend). A Neon Function `api` (`src/functions/api/`) **não** é redeployada
  por push nenhum — toda mudança em código da Function exige `neon deploy --env <arquivo-com-
  FUNCTION_ALLOWED_ORIGINS>` manual contra a branch `production`. Esquecer esse passo faz o
  frontend novo rodar contra a Function antiga, sem erro nenhum visível (a chamada responde
  normal, só com o comportamento de código desatualizado). Depois do `neon deploy`, o deployment
  novo leva cerca de 1 minuto pra assumir de verdade — uma chamada logo após o deploy ainda pode
  bater na instância antiga.
- **Deploy do frontend**: o projeto Cloudflare Pages está conectado ao GitHub
  (`nymbuslab/conta-facil`, branch de produção `master`) — todo push em `master` builda e publica
  sozinho, sem precisar rodar `wrangler pages deploy` na mão. O ambiente padrão de build do
  Cloudflare detecta `npm 10.9.2`, que tem um bug conhecido no resolvedor de dependências
  (`Cannot read properties of null (reading 'edgesOut')`) e quebra o `npm clean-install` neste
  projeto por causa das cadeias de override de peer dependency do `@neondatabase/auth` — por isso
  `NODE_VERSION=24` está fixado nas env vars de build (produção e preview) do projeto Pages, pra
  trazer um `npm` mais novo junto. Se o build do Pages voltar a falhar com esse erro depois de uma
  atualização do Node, é o primeiro lugar pra olhar.
- **Env vars de build do Cloudflare Pages**: `VITE_NEON_FUNCTION_API_BASE_URL` e
  `VITE_NEON_AUTH_BASE_URL` são obrigatórias nas env vars de build (produção e preview) do projeto
  Pages — sem a segunda, `auth-context.tsx` lança `VITE_NEON_AUTH_BASE_URL nao definida` e a tela
  fica em branco (faltou na primeira conexão com o GitHub, só apareceu ao recarregar a página já
  em produção). Se a Function ou o Auth mudarem de URL (troca de branch, recriação do projeto
  Neon), as duas precisam ser atualizadas juntas no painel do Cloudflare Pages ou via API
  (`PATCH /accounts/{id}/pages/projects/conta-facil`, campo `deployment_configs.*.env_vars`).

## Skills do projeto

Skills do Neon instaladas localmente em `.claude/skills/` (neon, neon-auth, neon-postgres,
neon-object-storage, etc.) — consultar antes de mexer em schema, auth ou storage.

## Design

Stitch `designSystem`: `assets/4d36820163ae41f2a29bf0522f55bb24` (Caderneta Financeira
Digital), no projeto `12211428364777233980`. Reusar em toda tela nova. Os tokens reais de
`src/index.css` prevalecem: cores HSL, azul primário sólido e `--radius: 0.25rem`.
