---
expx_schema: 1
expx_tool: sprintx
kind: convergencia
trabalho_id: rollout-neon-production
atualizado_em: 2026-10-11
rodada: 4
voltas_maximas: 2
resultado: convergido
decisoes_conferidas: 6
achados: []
---

# Convergência — rollout-neon-production

## Rodada 1 — 2026-10-11

Decisões conferidas: 2 (D-01, D-05). Tasks com critério de aceite reconferido: 3 (T-01.01,
T-01.02, T-02.03). Conferido pelo agente `auditor-convergencia`.

| id | tipo_lacuna | severidade | origem | evidência | destino |
|---|---|---|---|---|---|
| C-01 | contradiz | ALTA | — | `.env.production.local.example` caía na regra `.env.*` do `.gitignore` (só `!.env.example` estava isento); o arquivo nunca aparecia em `git status` e nunca podia ser commitado | T-05.01 |
| C-02 | contradiz | ALTA | — | `VERIFICACAO.md` afirmava que `test:function:deployed` lê `.env.production.local`; na realidade o script está hardcoded em `.env.test.local` e tem guard (`garantirBranchDeTeste()`) que recusa rodar fora de `test`/`test-*` | T-05.02 |
| C-03 | parcial | MÉDIA | D-05 | `ROLLBACK.md` citava nomes de tool (`create_snapshot`, `restore_snapshot`, `finalize_branch_restore`, `deploy_function`) sem fonte documentada nas skills Neon locais nem em `base/deploy-e-promocao-neon.md`, que marca essa área como NÃO DOCUMENTADO | T-05.03 |

Nenhum achado de `nao_pedido`. `D-01` não tem `origem` em nenhuma task (nem concluída, nem
bloqueada) — é realizada estruturalmente pela existência das tasks de Cloudflare/frontend nas
sprints 03/04, hoje bloqueadas por B-03/B-04 (bloqueio já registrado em `00-BLOQUEIOS.md`, fora
do escopo desta conferência). Nenhum dos 3 arquivos conferidos contradiz D-01.

**Resultado da rodada 1:** `tasks_acrescentadas` — abriu `sprint-05/` (fase única "Convergência,
rodada 1") com T-05.01, T-05.02, T-05.03, uma por achado.

## Rodada 2 — 2026-10-11

As 3 tasks da sprint-05 foram executadas e concluídas:

- T-05.01: `.gitignore` recebeu `!.env.production.local.example`; `git check-ignore -v` agora
  mostra a regra de negação como última regra aplicada, e `git add` funciona sem `--force`.
- T-05.02: `VERIFICACAO.md` não afirma mais que `test:function:deployed` lê
  `.env.production.local` — documenta o comportamento real (travado em `test`) e acrescenta um
  `curl` direto como alternativa para checar a Function de `production`.
- T-05.03: `ROLLBACK.md` agora cita explicitamente que os nomes de tool vêm do schema ao vivo do
  MCP do Neon (confirmado via `ToolSearch` nesta sessão), não das skills locais, com aviso de
  revalidação se a versão do MCP mudar.

Reconferido: os 3 achados (C-01, C-02, C-03) não são mais verdade contra o estado atual dos
arquivos. Nenhuma lacuna nova encontrada.

**Resultado da rodada 2:** `convergido`. Nenhuma sprint nova. Segue para o Passo 3/3.1 da F6.

## Rodada 3 — 2026-10-11

Depois do fechamento da rodada 2, o usuário autorizou e destravou B-01 e B-02 (ver
`00-BLOQUEIOS.md`), e T-02.01 (migration) e T-02.02 (deploy da Function) foram concluídas. Task
concluída depois de uma rodada `convergido` reabre a conferência — esta rodada não conta como
volta de correção (não houve achado a corrigir).

Decisão reconferida: D-02 (branch `production` completa com schema de negócio e Function) e D-04
(domínio `contafacil.nymbuslab.com.br` como origem autorizada em `FUNCTION_ALLOWED_ORIGINS`).

Evidência: `get_database_tables` lista `lancamentos` e `caixinhas` na branch `production`;
`describe_table_schema` confere colunas/constraints contra `src/db/schema.ts`; `list_functions`
lista a function `api`; `GET /health` responde 200 `{"ok":true}`; requisição com
`Origin: https://contafacil.nymbuslab.com.br` recebe `Access-Control-Allow-Origin` igual.

Nenhuma lacuna encontrada. `D-02` e `D-04` estão realizadas no estado real de `production`.

**Resultado da rodada 3:** `convergido`. Nenhuma sprint nova.

## Rodada 4 — 2026-10-11

Depois da rodada 3, as sprints 03 e 04 inteiras foram concluídas: Cloudflare Pages provisionado
(T-03.01 a T-03.04) e golden path real validado (T-04.01, T-04.02). Esta rodada confere o
restante da definição de pronto global (seção 7 do `ORQUESTRADOR.md`) e as decisões D-03, D-06,
D-07, D-10, D-11, D-12.

| decisão | verificação | resultado |
|---|---|---|
| D-03 (Cloudflare Pages) | `wrangler pages project list` mostra `conta-facil` | realizada |
| D-10 (env var do frontend no Pages, não commitada) | API do Cloudflare confirma `VITE_NEON_FUNCTION_API_BASE_URL` em `deployment_configs.production.env_vars`; não existe no repositório | realizada |
| D-11 (DNS configurado no Cloudflare) | registro CNAME ativo, `GET /pages/projects/.../domains/...` retorna `status: active` | realizada |
| D-12 (token Cloudflare como pré-requisito, sem travar o lado Neon) | sprint-02 (Neon) concluiu antes do token chegar; sprint-03 só avançou depois — confirma a ordem prevista | realizada |
| D-06 (golden path manual real, não só health check) | 6/6 passos do `CHECKLIST-GOLDEN-PATH.md` executados via browser contra o domínio real | realizada |
| D-07 (pronto = backend + frontend + golden path) | os três estão de pé simultaneamente (branch `production` com schema/Function, domínio servindo o SPA, golden path verde) | realizada |

Os seis itens da "Definição de pronto global" (seção 7 do `ORQUESTRADOR.md`) são verdade agora:
tabelas com schema do Drizzle, Function respondendo com CORS correto, `ROLLBACK.md` com o
procedimento, projeto Pages publicando o build com a env var certa e o domínio resolvendo, golden
path inteiro verde, e os cinco documentos vivos sem frase desatualizada (confirmado por `grep` na
T-04.02).

Dois ajustes fora do que as tasks previam, ambos necessários para realizar as decisões já
tomadas (não são decisão nova, não são `nao_pedido` — são correção de pré-requisito que faltava
para D-02/D-06 funcionarem):

- Um Worker avulso (`dash_template`) foi criado por engano pelo painel do Cloudflare durante a
  tentativa manual de configurar o domínio, e apagado depois de identificado.
- O domínio confiável do Neon Auth (`add_auth_trusted_domain`) não estava na nenhuma task
  explicitamente, mas sem ele o cadastro/login real (D-06) não funciona — corrigido durante
  T-04.01, registrado em `00-BLOQUEIOS.md` (B-05) e em `CLAUDE.md`.

Nenhuma lacuna ALTA ou MÉDIA. Nenhum achado `nao_pedido` além dos dois já descritos acima, que
são correção, não funcionalidade extra.

**Resultado da rodada 4:** `convergido`. Nenhuma sprint nova. Trabalho pronto para o Passo 3/3.1
final da F6.
