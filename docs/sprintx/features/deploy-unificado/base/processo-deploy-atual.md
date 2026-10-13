# Processo de deploy atual (dois passos manuais)

## Contrato de entrada

- Deploy do frontend: `git push` na branch `master` do GitHub (`nymbuslab/conta-facil`) — o projeto Cloudflare Pages `conta-facil` está conectado ao repositório e builda/publica sozinho a cada push, sem comando manual (`CLAUDE.md`, seção "Deploy do frontend"; `PROGRESSO.md`, item concluído de 2026-10-11).
- Deploy do backend: `neon deploy --env <arquivo>` executado manualmente contra a branch linkada `production` — nenhum push redeploya a Function `api` (`CLAUDE.md`, seção "Deploy do backend é separado do deploy do frontend").
- O arquivo do `--env` é o gitignorado que o `neon env pull` escreve (aqui `.env.local`), acrescido manualmente de `FUNCTION_ALLOWED_ORIGINS`, porque `neon.ts:10` lê essa chave de `process.env` (`CLAUDE.md`, "Env vars"; `neon.ts:10`).

## Contrato de saída

- Frontend novo publicado no Cloudflare Pages no domínio `https://contafacil.nymbuslab.com.br` (`README.md:57`).
- Function nova implantada na branch `production`; o deployment novo leva cerca de 1 minuto para assumir de verdade — chamada logo após ainda pode bater na instância antiga (`CLAUDE.md`, observação interna, sem número da doc oficial).
- Ao terminar, `neon deploy` baixa as vars geridas pelo Neon da branch de volta para `.env.local` local, mantendo o ambiente sincronizado (`docs/sprintx/features/rollout-neon-production/base/deploy-e-promocao-neon.md:14`).

## Limites e cotas

- NÃO DOCUMENTADO tempo exato de propagação do deploy da Function — o "~1 min" é observação interna do `CLAUDE.md`, não número da documentação oficial.
- NÃO DOCUMENTADO duração do build do Cloudflare Pages.

## Erros conhecidos e tratamento

- Esquecer o `neon deploy` não dá erro visível: o frontend novo roda contra a Function antiga, sem nenhuma falha — foi o incidente real da tarefa de inversão do parcelamento (`PROGRESSO.md:27-29`, o P2 que originou este trabalho).
- `neon deploy` opera na branch linkada, sem flag de branch na chamada — deploy com o link apontando para outra branch vai para a branch errada (`docs/sprintx/features/rollout-neon-production/base/deploy-e-promocao-neon.md:7`).
- Env vars de build do Pages faltando (`VITE_NEON_FUNCTION_API_BASE_URL`, `VITE_NEON_AUTH_BASE_URL`) deixam a tela em branco sem erro óbvio; a primeira quebra só apareceu ao recarregar a página em produção (`CLAUDE.md`, "Env vars de build do Cloudflare Pages").

## Riscos para a nossa implementação

- A ordem importa: a Function nova (que pode depender de schema novo) precisa assumir antes do frontend que a consome — o P1 do `PROGRESSO.md:11-14` fixa "publicar a Neon Function antes do frontend".
- Migrations novas (`drizzle/**`) precisam estar aplicadas em `production` antes da Function nova; aplicar SQL em `production` é ação autorizada explicitamente à parte (P1 do `PROGRESSO.md:11-14`).
- Não existe hoje registro de quando a Function foi deployada pela última vez: detectar "Function desatualizada" exige estado novo criado por este trabalho.
- O push é o passo irreversível: o Pages builda sozinho a partir dele, então toda checagem precisa acontecer antes do push, não depois.

## Fonte

- `CLAUDE.md` (seções de deploy do backend/frontend e env vars de build) — acessado em 2026-10-12
- `PROGRESSO.md` linhas 11-14 (P1) e 27-29 (P2 de origem) — acessado em 2026-10-12
- `README.md` — acessado em 2026-10-12
- `neon.ts` — acessado em 2026-10-12
- `docs/sprintx/features/rollout-neon-production/base/deploy-e-promocao-neon.md` — gravado em 2026-10-10
