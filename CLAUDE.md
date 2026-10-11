# Conta Fácil

App de controle financeiro pessoal (protótipo em evolução para produto real). Mobile-first, tela
Início mostra o mês vigente, caixinhas (poupança por objetivo) e parcelamentos.

Repositório: https://github.com/nymbuslab/conta-facil (privado)

## Stack

- **React 19** + **Vite** + **TypeScript**, roteamento com **TanStack Router** (rotas em `src/routes/`).
- **Tailwind CSS** + componentes shadcn/ui-style em `src/components/ui/`, ícones `lucide-react`.
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
```

## Arquitetura

```
src/
  routes/          uma rota por tela: index (Início), caixinhas, parcelas, perfil, __root
  components/       componentes de tela + ui/ (primitivas tipo shadcn)
  state/            auth e contextos remotos de lançamentos e caixinhas
  db/               schema Drizzle de lançamentos e caixinhas
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

- **Deploy do frontend**: o projeto Cloudflare Pages está conectado ao GitHub
  (`nymbuslab/conta-facil`, branch de produção `master`) — todo push em `master` builda e publica
  sozinho, sem precisar rodar `wrangler pages deploy` na mão. O ambiente padrão de build do
  Cloudflare detecta `npm 10.9.2`, que tem um bug conhecido no resolvedor de dependências
  (`Cannot read properties of null (reading 'edgesOut')`) e quebra o `npm clean-install` neste
  projeto por causa das cadeias de override de peer dependency do `@neondatabase/auth` — por isso
  `NODE_VERSION=24` está fixado nas env vars de build (produção e preview) do projeto Pages, pra
  trazer um `npm` mais novo junto. Se o build do Pages voltar a falhar com esse erro depois de uma
  atualização do Node, é o primeiro lugar pra olhar.

## Skills do projeto

Skills do Neon instaladas localmente em `.claude/skills/` (neon, neon-auth, neon-postgres,
neon-object-storage, etc.) — consultar antes de mexer em schema, auth ou storage.

## Design

Stitch `designSystem`: `assets/4d36820163ae41f2a29bf0522f55bb24` (Caderneta Financeira
Digital), no projeto `12211428364777233980`. Reusar em toda tela nova. Os tokens reais de
`src/index.css` prevalecem: cores HSL, azul primário sólido e `--radius: 0.25rem`.
