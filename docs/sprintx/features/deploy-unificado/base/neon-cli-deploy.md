# Contrato do `neon deploy` (CLI)

> O que o CLI Neon exige e faz no deploy da Function `api`, conforme a skill local `neon-functions` (fonte oficial empacotada no projeto).

## Contrato de entrada

- `neon deploy --env <file>`: deploy completo a partir do `neon.ts`; `--env` é o **arquivo** de onde o env da Function é lido — o CLI carrega o arquivo em `process.env` a cada deploy e sobe os valores (`.claude/skills/neon-functions/SKILL.md:148,151`).
- O arquivo de `--env` é o gitignored que o `neon env pull` escreve (`.env` se existir, senão `.env.local`); vars gerenciadas pelo Neon vêm do pull, segredos próprios (como `FUNCTION_ALLOWED_ORIGINS`) são acrescentados ao arquivo manualmente (`.claude/skills/neon-functions/SKILL.md:207`).
- Toda chave declarada em `functions.*.env` do `neon.ts` precisa estar presente no arquivo: valor ausente é `undefined` e `defineConfig` lança (`.claude/skills/neon-functions/SKILL.md:151,207`). O `neon.ts` deste projeto declara só `FUNCTION_ALLOWED_ORIGINS`, lida com `process.env.FUNCTION_ALLOWED_ORIGINS!` (`neon.ts:10`), e a Function `api` aponta direto para `src/functions/api/index.ts` sem build step prévio (`neon.ts:8`).
- Deploy alternativo de função única: `neon functions deploy <slug> --src <entry>`, com `--env KEY=VALUE` inline (não caminho de arquivo) (`.claude/skills/neon-functions/SKILL.md:153,219`).
- O CLI opera contra a branch linkada; `neon checkout` de branch existente NÃO reconcilia mudanças — todo apply exige `neon deploy --env <file>` (`.claude/skills/neon-functions/SKILL.md:177`).
- O link do CLI vive no arquivo `.neon` gitignorado, JSON `{"orgId", "projectId", "branch"}` — formatado real confirmado neste repositório, branch linkada `production` (arquivo `.neon`, lido em 2026-10-12); `neon link` grava o link uma vez por projeto e depois os comandos dispensam flags de projeto/branch (`.claude/skills/neon/SKILL.md:277-280`).
- A branch `production` é a default do projeto: comandos que resolvem "branch padrão" sem flag caem nela — risco inverso de atingir `production` por omissão (`docs/sprintx/features/rollout-neon-production/base/deploy-e-promocao-neon.md:42`).
- Ao terminar, o deploy baixa as vars geridas pelo Neon da branch de volta para o env file local, mantendo o ambiente sincronizado (`.claude/skills/neon/SKILL.md:352`).

## Contrato de saída

- Deploy completo aplica o `neon.ts` (functions, buckets, triggers declarados). A URL pública da Function vem do campo `invocation_url` de `neon functions get <slug>`, na forma `https://<branch_id>-<slug>.compute.<cell>.us-east-2.aws.neon.tech` (`.claude/skills/neon-functions/SKILL.md:153`).
- `neon deploy` NÃO roda o build step do projeto (`.claude/skills/neon-functions/references/native-binaries.md:82-86`) — neste projeto não há build prévio da Function: o deploy empacota `src/functions/api/index.ts` direto (`neon.ts:8`).

## Limites e cotas

- Env da Function: ≤1.000 variáveis, ≤64 KiB total, prefixo `NEON_` reservado (`.claude/skills/neon-functions/SKILL.md:221`).
- Env vars persistem e **acumulam** entre deploys: omitir `--env` num deploy posterior NÃO limpa variável definida antes (`.claude/skills/neon-functions/references/sentry.md:96`).

## Erros conhecidos e tratamento

- Valor ausente → `undefined` → `defineConfig` lança e o deploy falha (`.claude/skills/neon-functions/SKILL.md:151`; `neon.ts:10` usa a asserção `!`).
- NUNCA coercionar valor ausente para string vazia: subiria `""` e **apagaria a chave viva** no deploy; atribuição vazia no arquivo (`KEY=`) também é `""` (`.claude/skills/neon-functions/SKILL.md:151`).
- `npx neon deploy` contra `production` foi classificado como "Production Deploy" pelo harness e exigiu permissão explícita do usuário na sessão (`docs/sprintx/features/rollout-neon-production/00-BLOQUEIOS.md`, B-02).

## Riscos para a nossa implementação

- O fluxo unificado precisa garantir que o arquivo do `--env` exista e contenha `FUNCTION_ALLOWED_ORIGINS` **antes** de chamar o CLI — senão o deploy falha (undefined) ou, pior, apaga a chave viva se alguém "resolver" o erro com valor vazio.
- Branch errada: o CLI segue o link da sessão; rodar com o link apontando para outra branch (ex. `test`) publicaria a Function de teste achando que é production. O fluxo precisa conferir a branch linkada antes de rodar.
- Janela de propagação: chamada logo após o deploy pode bater na instância antiga (CLAUDE.md) — a verificação pós-deploy precisa lidar com isso.

## Fonte

`.claude/skills/neon-functions/SKILL.md` (linhas 148–221) e `references/{sentry.md:96, native-binaries.md:82-86}` — acessados em 2026-10-12; `neon.ts` (raiz) — acessado em 2026-10-12; `neon status` — executado em 2026-10-12 (link: projeto `falling-tree-35553185`, branch `production`, Function `api`, Auth enabled).
