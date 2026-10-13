---
expx_schema: 1
expx_tool: sprintx
kind: fechamento
trabalho_id: deploy-unificado
titulo: Deploy unificado em um comando
tipo_trabalho: feature
fechado_em: 2026-10-12
modulo_afetado: [scripts, raiz]
arquivos_alterados: [scripts/deploy.mjs, scripts/deploy.test.ts, DEPLOY.md, package.json, .gitignore]
palavras_chave: [deploy, neon, cli, cloudflare, push, function, health-check, dry-run]
resumo: npm run deploy unifica os dois passos manuais de deploy, deploya a Function e valida o health check antes do push, com modo --sim e gates fail-closed.
decisao_principal: D-17 — todas as checagens (inclusive o health check da Function) acontecem antes do push, que e o passo irreversivel.
risco_residual: Sem API de versao da Function, o health check prova que a Function responde, nao que a instancia nova ja assumiu; o primeiro uso real depende de resolver o gate de migration (P1).
testes_adicionados: 41
---

# Fechamento — deploy-unificado

## O que foi entregue

Um comando único, `npm run deploy` (`scripts/deploy.mjs`), substitui os dois passos manuais de
deploy. O script:

- checa, fail-closed, branch git `master`, árvore limpa e link `.neon` em `production`;
- trata o gate de migration (mudança em `drizzle/**` ou estado ausente) — **nunca** aplica SQL,
  só exige confirmação de que a migration já foi aplicada em `production`;
- valida `FUNCTION_ALLOWED_ORIGINS` (ausente ou vazio aborta) e, com confirmação interativa
  imprimindo os caminhos que mudaram, roda `npx neon deploy --env`, gravando o SHA do `HEAD` em
  `.deploy-state.json`;
- faz `GET /health` da Function com retry, **entre** o deploy e o push;
- só então roda `git push origin master` e avisa que o build do Cloudflare Pages foi disparado.

A matriz *Function mudou?* × *há commits a pushar?* decide a sequência: F+C+ completo; F+C−
Function e health sem push (com aviso); F−C+ só push; F−C− nada a fazer (`exit 0`). Estado de
deploy ausente conta como "Function + migrations pendentes" (fail-closed). O modo `--sim` imprime
o plano sem executar nenhuma ação.

`DEPLOY.md` documenta o que fica fora do script: env vars de build do Cloudflare Pages, domínio
confiável do Neon Auth em branch nova, migration em `production` e reposição de
`FUNCTION_ALLOWED_ORIGINS` pós-deploy.

## Decisão principal

D-17: todas as checagens — inclusive o health check da Function — terminam antes do push. O push
é o passo irreversível (dispara o build do Pages sozinho), então nada que possa falhar roda
depois dele.

## Risco residual

- O health check prova que a Function responde, **não** que a instância nova já assumiu (a Neon
  leva ~1 min para trocar a instância; não há API de versão pública) — lacuna documentada em
  `base/neon-cli-deploy.md`.
- O primeiro `npm run deploy` real de uma entrega com migration vai **abortar** no gate de
  migration até o rollout do P1 (aplicar `drizzle/0001_idempotencia.sql` em `production`) ser
  autorizado e feito — comportamento fail-closed desejado.
- O script exige árvore limpa para rodar; as ~44 mudanças das duas entregas de 2026-10-12
  precisam ser commitadas antes do primeiro uso.
