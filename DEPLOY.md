# Deploy do Conta Fácil

O deploy do projeto tem duas partes que **não** acontecem juntas:

- **Frontend** — o projeto Cloudflare Pages `conta-facil` está conectado ao GitHub
  (`nymbuslab/conta-facil`, branch de produção `master`) e builda/publica sozinho a cada `git push`.
  Isso inclui a pasta `functions/` (Cloudflare Pages Functions — hoje só o proxy reverso do Auth
  em `functions/auth/[[catchall]].js`, ver seção abaixo): é parte do mesmo build automático do
  frontend, sem deploy manual separado, diferente da Neon Function.
- **Backend (Function `api` + schema)** — a Neon Function **não** é redeployada por push nenhum;
  toda mudança em `src/functions/api/**`, `src/db/**`, `neon.ts` ou uma nova migration exige um
  deploy manual contra a branch `production` do Neon.

## Proxy do Neon Auth (`functions/auth/[[catchall]].js`)

O Neon Auth é um domínio diferente do app (`*.neonauth.c-6.us-east-2.aws.neon.tech` vs
`contafacil.nymbuslab.com.br`), o que torna o cookie de sessão "de terceiros" para o navegador —
alguns (Brave sempre, mobile com frequência) bloqueiam isso por padrão e a sessão não persistia
entre visitas. `functions/auth/[[catchall]].js` repassa tudo sob `/auth/*` para o host real do
Neon Auth, fazendo o `Set-Cookie` nascer no mesmo domínio do app.

- **Env var nova, server-side, só do Pages Functions** (painel → Settings → Environment
  variables → aba **Functions**, não a de build): `NEON_AUTH_UPSTREAM_URL` — a mesma URL que já
  era `NEON_AUTH_BASE_URL`/`VITE_NEON_AUTH_BASE_URL` antes desta mudança, agora só lida em
  runtime pelo proxy. Valor diferente por ambiente (produção aponta para o host de produção do
  Neon Auth, preview para o de `test`).
- **`VITE_NEON_AUTH_BASE_URL` passa a apontar para o próprio domínio do app**:
  `https://contafacil.nymbuslab.com.br/auth` em produção (e o domínio de preview + `/auth` em
  preview) em vez do host direto do Neon Auth.
- **Ordem obrigatória ao configurar/trocar isso**: nunca mudar `VITE_NEON_AUTH_BASE_URL` antes de
  confirmar que o proxy já responde (`NEON_AUTH_UPSTREAM_URL` configurada e um teste direto em
  `/auth/<algum-path>` batendo no upstream real) — mudar a env var de build primeiro quebra o
  login na hora, porque o client passaria a chamar `/auth/*` no próprio domínio antes de existir
  configuração nenhuma apontando para o upstream.
- Mudar env var no painel **não** dispara um novo build sozinho — depois de configurar, é preciso
  um novo `git push` (ou retry manual do deploy) para o valor novo entrar no bundle. Isso vale
  tanto para env var de build (`VITE_*`) quanto para env var de Functions
  (`NEON_AUTH_UPSTREAM_URL`) — as duas ficam "congeladas" por deployment.
- **`NEON_AUTH_UPSTREAM_URL` precisa incluir o path, não só o host** — o valor correto é igual ao
  `NEON_AUTH_BASE_URL` de `.env.local`/`.env.test.local`, que já traz `/neondb/auth` no final
  (ex. `https://ep-shiny-snow-b4twxw1g.neonauth.c-6.us-east-2.aws.neon.tech/neondb/auth`). Só o
  host, sem esse path, faz toda rota do Better Auth devolver 404 através do proxy (achado real na
  validação de Preview em 2026-10-17).
- **Domínio confiável por branch de Preview**: a allowlist do Neon Auth (`add_auth_trusted_domain`)
  valida pelo header `Origin` da requisição — confirmado na validação de Preview (POST
  `/sign-in/email` devolvia `403 INVALID_ORIGIN` até o domínio de preview ser registrado na
  branch `test`). Produção não deveria precisar de nada novo aqui, porque a origem que o Neon Auth
  vê continua sendo `contafacil.nymbuslab.com.br`, já confiável hoje — mas qualquer branch de
  Preview nova usada para validar login precisa do seu domínio (`<nome-da-branch>.conta-facil.pages.dev`,
  veja o alias em `aliases` na resposta da API de deployments) registrado antes de testar.

Esquecer o segundo passo não gera erro visível: o frontend novo roda contra a Function antiga,
respondendo "normal" com comportamento desatualizado. Foi o incidente que motivou o script abaixo.

## Como rodar

```bash
npm run deploy          # executa o fluxo unificado (interativo)
npm run deploy -- --sim # dry-run: imprime o que faria, sem executar nenhuma ação
```

O script faz, na ordem:

1. **Checagens fail-closed** — branch git precisa ser `master`, a árvore precisa estar limpa e o
   `.neon` precisa apontar para `production`. Qualquer uma falha aborta com `exit 1`.
2. **Auditoria de dependências** (`npm run audit:security`, via `scripts/auditar-dependencias.mjs`)
   — roda sempre que há algo a fazer, inclusive em `--sim`. Qualquer alerta `high`/`critical` não
   documentado aborta antes de qualquer ação (deploy ou push). É o mesmo gate fail-closed usado
   isoladamente; aqui ele vira parte obrigatória do fluxo, em vez de depender de alguém lembrar de
   rodar `npm run audit:security` manualmente antes do deploy.
3. **Gate de migration** — se houve mudança em `drizzle/**` (ou o estado local estiver ausente),
   ele para e pergunta se a migration já foi aplicada em `production`. **O script nunca aplica SQL
   sozinho**; sem a confirmação, aborta antes de qualquer ação.
4. **Deploy da Function** — valida `FUNCTION_ALLOWED_ORIGINS` (ausente ou vazio aborta), imprime os
   caminhos que mudaram e só segue após confirmação. Em caso de sucesso, grava o SHA do `HEAD` em
   `.deploy-state.json` (arquivo local, gitignorado).
5. **Health check** — faz `GET /health` da Function com retry, **entre** o deploy da Function e o
   push (toda checagem termina antes do passo irreversível).
6. **Push** — `git push origin master`, que dispara o build do Cloudflare Pages.

O que decide o caminho é o par *Function mudou?* × *há commits a pushar?*:

| Function mudou | Commits a pushar | Ação |
|---|---|---|
| sim | sim | deploy da Function → health check → push |
| sim | não | deploy da Function → health check (push pulado com aviso) |
| não | sim | só push (sem Function, sem health check) |
| não | não | nada a fazer (sai com `exit 0`) |

Estado de deploy ausente conta como "Function + migrations pendentes" (fail-closed).

## Checklist do que fica **fora** do script

Estes pontos dependem de painel/console e não são automatizados aqui:

### Env vars de build do Cloudflare Pages

No painel do Pages (produção **e** preview), manter:

- `VITE_NEON_FUNCTION_API_BASE_URL` — URL pública da Function `api`.
- `VITE_NEON_AUTH_BASE_URL` — **desde o proxy do Auth**, é o próprio domínio do app + `/auth`
  (ex. `https://contafacil.nymbuslab.com.br/auth` em produção), não mais o host direto do Neon
  Auth. Sem ela, `auth-context.tsx` lança `VITE_NEON_AUTH_BASE_URL nao definida` e a tela fica em
  branco.
- `NODE_VERSION=24` — o ambiente padrão do Cloudflare detecta `npm 10.9.2`, que quebra o
  `npm clean-install` deste projeto (`Cannot read properties of null (reading 'edgesOut')`).

Se a Function mudar de URL, atualizar a primeira. Se o Neon Auth mudar de URL, é
`NEON_AUTH_UPSTREAM_URL` (env var de **Functions**, não de build — ver seção "Proxy do Neon Auth"
acima) que muda, não `VITE_NEON_AUTH_BASE_URL`. Tudo isso via painel ou API
(`PATCH /accounts/{id}/pages/projects/conta-facil`, campo `deployment_configs.*.env_vars`).

**Risco real confirmado em 2026-10-17:** esse `PATCH` **não faz merge** de `env_vars` por
ambiente, mesmo a documentação da Cloudflare dando a entender que sim (só fala em "setar chave
para `null` apaga a variável", nada sobre o que acontece com chave omitida) — na prática, mandar
só a variável nova **substitui o objeto `env_vars` inteiro daquele ambiente**, apagando todas as
outras. Sempre fazer `GET` do projeto primeiro, mesclar a variável nova no JSON de `env_vars` já
existente daquele ambiente (preservando todas as outras) e só então `PATCH` com o objeto
completo — nunca um `PATCH` parcial com uma chave só.

### Domínio confiável do Neon Auth

Toda branch nova do Neon precisa do domínio do frontend registrado em `add_auth_trusted_domain`
(MCP do Neon ou console). Sem isso, `sign-up`/`sign-in` tomam `403` mesmo com o CORS da Function
liberado — é uma allowlist separada de `FUNCTION_ALLOWED_ORIGINS`.

### Migration em production

Aplicar o SQL de `drizzle/**` na branch `production` **antes** de publicar a Function que o
referencia. Caminhos possíveis: `npx drizzle-kit migrate` com o `DATABASE_URL_UNPOOLED` de
produção, ou o SQL colado no SQL Editor do console Neon (ou MCP do Neon). Operação autorizada
explicitamente à parte — o script só faz o gate de confirmação, nunca aplica sozinho.

**Risco conhecido, causa raiz confirmada e corrigida em 2026-10-16:** `drizzle.__drizzle_migrations`
em `production` ficou vazia porque as 4 migrations até aqui (`0000` a `0003`) foram sempre
aplicadas por SQL direto (MCP do Neon ou SQL Editor do console) — o bloqueio original foi o
classificador de auto mode do harness recusando `drizzle-kit migrate` autônomo contra
`production` (mesmo gate de `B-01` em `docs/sprintx/features/rollout-neon-production/`). SQL
direto cria as tabelas certas, mas só o próprio `drizzle-kit` grava a tabela de controle — então
ela nunca foi populada, e a próxima `drizzle-kit migrate` tentaria reaplicar tudo desde o início
e colidir com as tabelas já existentes.

Corrigido inserindo manualmente as 4 linhas de controle em `production` (hash + timestamp,
copiados da branch `test`, onde `drizzle-kit migrate` roda de verdade a cada
`npm run test:migrate` — hash é do conteúdo do arquivo, igual em qualquer branch). Confirmado por
leitura: os 4 hashes em `production` batem com os de `test`.

**Ao aplicar uma migration nova em `production`:** se continuar usando SQL direto (MCP ou SQL
Editor) em vez de `drizzle-kit migrate` — por exemplo, se o classificador do harness bloquear de
novo —, inserir manualmente a linha correspondente em `drizzle.__drizzle_migrations` (hash do
arquivo + timestamp do `drizzle/meta/_journal.json`) depois de aplicar o SQL, para não deixar a
tabela de controle atrasada outra vez.

### Reposição de `FUNCTION_ALLOWED_ORIGINS` pós-deploy

`neon.ts` lê `FUNCTION_ALLOWED_ORIGINS` de `process.env` e ela é obrigatória no deploy. Depois do
`neon deploy`, o CLI baixa as env vars geridas pelo Neon de volta para `.env.local`; mantenha a
chave preenchida (lista separada por vírgula) no arquivo usado no `--env`, senão o próximo deploy
aborta no passo 3.

## Observações

- Após o deploy da Function, a instância nova leva cerca de **1 minuto** para assumir de verdade.
  O health check prova que a Function responde, não que a instância nova já está no ar.
- O deploy da Function não é disparado por `git push`; sempre que mudar código da Function,
  rode `npm run deploy` (ou o `npx neon deploy --env <arquivo>` manual).
- `npm run deploy` só cobre `production`. A Function da branch `test` **não** é redeployada por
  nenhum script e fica parada até alguém rodar `npx neon deploy --branch test --env
  .env.test.local` manualmente — achado em 2026-10-16, quando a Function de `test` estava parada
  desde 2026-10-10 (antes de idempotência, paginação e da feature de origem do depósito) e uma
  validação visual local quebrou com 404 em rotas que só existiam em `production`. Antes de
  validar algo manualmente contra `test`, considerar redeployar a Function primeiro.
