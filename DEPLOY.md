# Deploy do Conta Fácil

O deploy do projeto tem duas partes que **não** acontecem juntas:

- **Frontend** — o projeto Cloudflare Pages `conta-facil` está conectado ao GitHub
  (`nymbuslab/conta-facil`, branch de produção `master`) e builda/publica sozinho a cada `git push`.
- **Backend (Function `api` + schema)** — a Neon Function **não** é redeployada por push nenhum;
  toda mudança em `src/functions/api/**`, `src/db/**`, `neon.ts` ou uma nova migration exige um
  deploy manual contra a branch `production` do Neon.

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
- `VITE_NEON_AUTH_BASE_URL` — URL do Neon Auth. Sem ela, `auth-context.tsx` lança
  `VITE_NEON_AUTH_BASE_URL nao definida` e a tela fica em branco.
- `NODE_VERSION=24` — o ambiente padrão do Cloudflare detecta `npm 10.9.2`, que quebra o
  `npm clean-install` deste projeto (`Cannot read properties of null (reading 'edgesOut')`).

Se a Function ou o Auth mudarem de URL, atualizar as duas primeiras **juntas**, no painel ou via
API (`PATCH /accounts/{id}/pages/projects/conta-facil`, campo `deployment_configs.*.env_vars`).

### Domínio confiável do Neon Auth

Toda branch nova do Neon precisa do domínio do frontend registrado em `add_auth_trusted_domain`
(MCP do Neon ou console). Sem isso, `sign-up`/`sign-in` tomam `403` mesmo com o CORS da Function
liberado — é uma allowlist separada de `FUNCTION_ALLOWED_ORIGINS`.

### Migration em production

Aplicar o SQL de `drizzle/**` na branch `production` **antes** de publicar a Function que o
referencia. Caminhos possíveis: `npx drizzle-kit migrate` com o `DATABASE_URL_UNPOOLED` de
produção, ou o SQL colado no SQL Editor do console Neon. Operação autorizada explicitamente à
parte — o script só faz o gate de confirmação, nunca aplica sozinho.

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
