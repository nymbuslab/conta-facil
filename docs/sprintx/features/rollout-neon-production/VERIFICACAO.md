# Verificação HTTP de production

> Como rodar os scripts de verificação existentes contra a branch `production` do Neon, sem
> commitar segredo nenhum.

## Pré-requisito

Copie `.env.production.local.example` da raiz do repositório para `.env.production.local` e
preencha os valores reais da branch `production` (projeto `falling-tree-35553185`, branch
`br-rapid-night-b4f7w7vu`), obtidos via `neon env pull` ou pelo console do Neon. Esse arquivo
nunca é commitado — `.env.*` já está no `.gitignore`.

## `npm run test:function:health`

Roda a Function localmente (importa `src/functions/api/index.ts` direto, sem precisar de rede) e
confere que `GET /health` responde 200 com `{ ok: true }`. Não depende do arquivo
`.env.production.local` — só do código da Function no disco.

```bash
npm run test:function:health
```

## `npm run test:function:deployed`

Esse script (`src/test/function-deployed-setup.ts`) é **travado na branch `test`** por
`garantirBranchDeTeste()` (`src/test/guardar-branch-teste.ts`) e por `--env-file=.env.test.local`
hardcoded em `package.json` — ele nunca vai ler `.env.production.local`, de propósito: é a mesma
guarda de segurança que impede qualquer script de integração de escrever/ler em `production` por
engano (ver `CLAUDE.md`, seção "Segurança de teste de integração"). Rodá-lo sempre confere a
Function de `test`, não a de `production`.

```bash
npm run test:function:deployed
```

Para checar a Function **de `production`** depois que ela existir (T-02.02), use um `curl`
direto na URL real, sem passar pelo script travado em `test`:

```bash
curl -s -o /dev/null -w "%{http_code}\n" "$NEON_FUNCTION_API_BASE_URL/health"
```

Com `NEON_FUNCTION_API_BASE_URL` vindo de `.env.production.local` (carregado manualmente no
shell, nunca commitado). Resposta esperada: `200`.

## Segurança

- Nunca cole o valor de `DATABASE_URL`, `DATABASE_URL_UNPOOLED` ou qualquer chave real num
  commit, PR ou mensagem — só os nomes das variáveis.
- `.env.production.local` segue a mesma regra de `.env.test.local` e `.env.local`: existe só na
  máquina local, nunca no git.
