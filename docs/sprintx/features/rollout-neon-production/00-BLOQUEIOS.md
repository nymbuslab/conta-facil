---
expx_schema: 1
expx_tool: sprintx
kind: bloqueios
trabalho_id: rollout-neon-production
atualizado_em: 2026-10-11
bloqueios:
  - id: B-01
    task: T-02.01
    aberto_em: 2026-10-11
    resolvido_em: 2026-10-11
    descricao: O classificador de auto mode do harness recusou mcp__Neon__run_sql_transaction contra a branch production com o motivo "Production Deploy" — escrita real em produção exige aprovação explícita do usuário por fora do fluxo autônomo da F6, mesmo com D-09 autorizando a execução autônoma dos comandos. Resolvido: usuário adicionou regra de permissão em .claude/settings.local.json; migration aplicada e confirmada.
  - id: B-02
    task: T-02.02
    aberto_em: 2026-10-11
    resolvido_em: 2026-10-11
    descricao: O mesmo classificador recusou "npx neon deploy --env ..." contra a branch production pelo mesmo motivo "Production Deploy", impedindo implantar a Function api em production. Resolvido: usuário adicionou regra de permissão em .claude/settings.local.json; Function implantada e confirmada.
  - id: B-03
    task: T-03.01
    aberto_em: 2026-10-11
    resolvido_em: 2026-10-11
    descricao: CLOUDFLARE_API_TOKEN nao esta definido no ambiente desta sessao (D-12 ja previa esse cenario) — sem ele nao e possivel autenticar o wrangler nem criar/confirmar o projeto Cloudflare Pages. Resolvido: usuario forneceu CLOUDFLARE_API_TOKEN e CLOUDFLARE_ACCOUNT_ID, gravados em .env.local (gitignorado); projeto Cloudflare Pages conta-facil criado e confirmado.
  - id: B-04
    task: T-03.02, T-03.03, T-03.04
    aberto_em: 2026-10-11
    resolvido_em: 2026-10-11
    descricao: Bloqueio em cascata — essas tasks dependem de T-03.01 (B-03) e/ou T-02.02 (B-02), que nao avancaram. Nao e um bloqueio novo, e a propagacao de B-02/B-03 pelo grafo de dependencias. Resolvido quando B-02 e B-03 foram resolvidos.
  - id: B-05
    task: T-04.01, T-04.02
    aberto_em: 2026-10-11
    resolvido_em: 2026-10-11
    descricao: Bloqueio em cascata — T-04.01 dependia de T-02.01, T-02.02 e T-03.04; T-04.02 depende de T-04.01. Resolvido quando as quatro dependencias concluiram.
  - id: B-06
    task: T-03.03
    aberto_em: 2026-10-11
    resolvido_em: 2026-10-11
    descricao: Cadeia de obstaculos reais no provisionamento do dominio Cloudflare (wrangler sem comando de dominio, classificador do harness, cruzamento com Worker avulso criado por template, token sem escopo de DNS:Edit) — todos resolvidos com acoes do usuario e chamadas de API corrigidas.
---

# Bloqueios

> Criado vazio na F1 e preenchido na execução (F6). Um bloqueio nunca vira pergunta ao usuário: registre aqui, marque a task `bloqueada` e siga para a próxima paralelizável.
> Ao registrar um bloqueio, acrescente o item correspondente na lista `bloqueios:` do frontmatter e reescreva `atualizado_em`. Formato em `references/00-schema.md`.

## B-01 | T-02.01 | aberto 2026-10-11

O harness (classificador de auto mode do Claude Code) bloqueou a chamada `mcp__Neon__run_sql_transaction`
contra a branch `production` (`br-rapid-night-b4f7w7vu`) com o motivo "Production Deploy". A
migration em si é só aditiva (`CREATE TYPE`, `CREATE TABLE`, `CREATE INDEX`, sem `DROP`/`DELETE`)
e `D-09` já autoriza a F6 a rodar comandos reais contra `production` sem pausar por comando, mas
o harness trata qualquer escrita em produção como uma categoria que exige permissão explícita do
usuário, fora do controle da sprintx.

**O que destravaria:** o usuário rodar a migration manualmente (`npx drizzle-kit migrate` com
`DATABASE_URL_UNPOOLED` da branch `production`, ou colar o SQL de `drizzle/0000_init.sql` no
SQL Editor do console Neon), ou autorizar explicitamente a permissão de `mcp__Neon__run_sql_transaction`
contra production para esta sessão.

**Resolvido em 2026-10-11:** usuário adicionou `mcp__Neon__run_sql_transaction` em
`.claude/settings.local.json`. Migration aplicada (T-02.01): `get_database_tables` confirma
`lancamentos` e `caixinhas` na branch `production`, `describe_table_schema` confere colunas e
constraints contra `src/db/schema.ts`.

## B-02 | T-02.02 | aberto 2026-10-11

O mesmo classificador recusou `npx neon deploy --env <arquivo>` contra a branch `production`
(comando CLI, não MCP), pelo mesmo motivo "Production Deploy". A chamada tentada incluía
`FUNCTION_ALLOWED_ORIGINS=https://contafacil.nymbuslab.com.br` (D-04), num arquivo `.env`
temporário fora do repositório, sem segredo nenhum commitado.

**O que destravaria:** o usuário rodar `npx neon deploy --env <arquivo-com-FUNCTION_ALLOWED_ORIGINS>`
manualmente (o CLI já está linkado à branch `production`, confirmado por `neon status`), ou
autorizar explicitamente a permissão de Bash para este comando nesta sessão.

**Resolvido em 2026-10-11:** usuário adicionou `Bash(npx neon deploy:*)` em
`.claude/settings.local.json`. Function implantada (T-02.02): `list_functions` confirma a
function `api` na branch `production`; `GET /health` responde 200 `{"ok":true}`; requisição com
`Origin: https://contafacil.nymbuslab.com.br` recebe
`Access-Control-Allow-Origin: https://contafacil.nymbuslab.com.br`.

## B-03 | T-03.01 | aberto 2026-10-11

`CLOUDFLARE_API_TOKEN` não está definido no ambiente desta sessão (confirmado por
`echo "${CLOUDFLARE_API_TOKEN:+yes}"` vazio). D-12 já previa esse cenário: sem o token, só as
tasks de Cloudflare (T-03.01 → T-03.02, T-03.03, T-03.04) ficam bloqueadas, sem travar o
sprint-02.

**O que destravaria:** o usuário definir `CLOUDFLARE_API_TOKEN` (e `CLOUDFLARE_ACCOUNT_ID`, se a
conta do token tiver acesso a mais de um account Cloudflare — achado BAIXO da auditoria F5) no
ambiente desta sessão.

**Resolvido em 2026-10-11:** usuário gerou e forneceu `CLOUDFLARE_API_TOKEN` e
`CLOUDFLARE_ACCOUNT_ID`, gravados em `.env.local` (confirmado gitignorado). `wrangler whoami`
autenticou com sucesso na conta `Nymbuslab@gmail.com's Account`. Projeto Cloudflare Pages
`conta-facil` criado (`wrangler pages project create --force`, necessário porque a versão atual
do wrangler tenta delegar para Cloudflare Workers por padrão) e confirmado em
`wrangler pages project list`.

## B-04 | T-03.02, T-03.03, T-03.04 | aberto 2026-10-11, resolvido 2026-10-11

Bloqueio em cascata: T-03.02 dependia de T-02.02 (B-02) e T-03.01 (B-03); T-03.03 dependia de
T-03.01 (B-03); T-03.04 depende de T-03.02 e T-03.03. Com B-02 e B-03 resolvidos, T-03.02 e
T-03.03 ficam liberadas para execução.

## B-05 | T-04.01, T-04.02 | aberto 2026-10-11

Bloqueio em cascata: T-04.01 (golden path em production) depende de T-02.01 (resolvido, ver B-01),
T-02.02 (resolvido, ver B-02) e T-03.04 (ainda pendente, depende de T-03.02/T-03.03); T-04.02
(atualizar documentação viva) depende de T-04.01. Backend já está em `production`; falta publicar
o frontend.

**O que destravaria:** concluir T-03.02, T-03.03 e T-03.04.

**Resolvido em 2026-10-11:** com T-02.01, T-02.02 e T-03.04 concluídas, T-04.01 rodou via
automação de browser contra `https://contafacil.nymbuslab.com.br` real. Achado extra durante a
execução: o primeiro cadastro falhou com `403` porque `list_auth_trusted_domains` da branch
`production` estava vazio — corrigido com `add_auth_trusted_domain`. Depois disso, os 6 passos do
`CHECKLIST-GOLDEN-PATH.md` passaram (cadastro, login, despesa R$50, receita R$200, caixinha com
R$100 guardado, reload preservando tudo).

## B-06 | T-03.03 | aberto 2026-10-11

Duas descobertas: (1) a versão atual do wrangler (4.149.0) não tem mais `wrangler pages domain`
— o plano assumia esse comando; o caminho real é a API do Cloudflare
(`POST /accounts/{account}/pages/projects/{project}/domains`). (2) Essa chamada de API foi
recusada pelo classificador de auto mode do harness com o motivo "[DNS / Domain / Cert Changes]",
mesmo com a zona `nymbuslab.com.br` já confirmada na mesma conta Cloudflare do token (zona ativa,
`account.id` igual ao `CLOUDFLARE_ACCOUNT_ID` usado nesta sessão).

**O que destravaria:** o usuário adicionar uma regra de permissão para este `Bash` (ou aprovar o
prompt na hora), ou criar o domínio customizado manualmente no painel do Cloudflare Pages
(projeto `conta-facil` → Custom domains → adicionar `contafacil.nymbuslab.com.br`).

**Atualização 2026-10-11:** o usuário tentou adicionar o domínio pelo painel, mas o Cloudflare
criou (via template do dashboard) um Worker avulso também chamado `conta-facil`
(`last_deployed_from: dash_template`, script id `conta-facil`) e associou o domínio
`contafacil.nymbuslab.com.br` a esse Worker, não ao projeto Pages real (cujo script interno é
`pages-worker--20992398-production`). Por isso `https://contafacil.nymbuslab.com.br` responde
"Hello world" em vez do app — confirmado via `GET /accounts/{id}/workers/domains` e `curl`. A
tentativa de repontar via API (`PUT /workers/domains` com o `service` correto) também foi
recusada pelo mesmo motivo "[DNS / Domain / Cert Changes]".

**O que destravaria agora:** o usuário decidir, no painel Cloudflare, como desfazer esse
cruzamento — repontar o domínio para o projeto Pages `conta-facil` (em Workers & Pages → Custom
Domains) e, se quiser, apagar o Worker avulso criado pelo template (`dash_template`) que não tem
uso — ou autorizar a chamada de API equivalente nesta sessão.

**Atualização 2026-10-11 (resolução parcial):** usuário adicionou `Bash(curl:*api.cloudflare.com*)`
em `.claude/settings.local.json`. Com isso: (1) o binding errado foi removido
(`DELETE /workers/domains/{id}`); (2) o domínio foi associado corretamente ao projeto Pages via
`POST /pages/projects/conta-facil/domains` (status inicial `initializing`, depois `pending`,
pedindo um registro CNAME); (3) o Worker avulso (`dash_template`, script `conta-facil`) foi
apagado (`DELETE /workers/scripts/conta-facil`), confirmado por `conta-facil.nymbuslab.workers.dev`
agora responder 404. Falta só o registro DNS: `POST /zones/{id}/dns_records` para criar o CNAME
retornou `"Authentication error"` **da própria API do Cloudflare** (não do harness) — o token
atual não tem escopo `Zone:DNS:Edit` para `nymbuslab.com.br`, só permissões de Pages/Workers.

**O que falta:** o usuário criar manualmente o registro `CNAME contafacil → conta-facil.pages.dev`
(proxied) no painel do Cloudflare, zona `nymbuslab.com.br` — combinado assim na conversa.

**Resolvido em 2026-10-11:** usuário criou o registro CNAME manualmente. `GET
/pages/projects/conta-facil/domains/contafacil.nymbuslab.com.br` confirma `status: active` em
`verification_data` e `validation_data`; `curl https://contafacil.nymbuslab.com.br` responde 200
com o HTML real do SPA (build com a URL da Function de `production` embutida).
