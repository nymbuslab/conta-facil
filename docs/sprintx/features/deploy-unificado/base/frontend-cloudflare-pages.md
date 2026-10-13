# Deploy do frontend via Cloudflare Pages

> O passo do `git push` que dispara o build no Pages, as env vars obrigatórias e as falhas conhecidas.

## Contrato de entrada

- `git push` na branch `master` do repositório `nymbuslab/conta-facil` dispara build e deploy automáticos no projeto Cloudflare Pages `conta-facil`, sem comando local (CLAUDE.md, deploy do frontend; FECHAMENTO.md do rollout, pós-fechamento).
- Env vars de build obrigatórias (produção e preview): `VITE_NEON_FUNCTION_API_BASE_URL` e `VITE_NEON_AUTH_BASE_URL` — sem a segunda, `auth-context.tsx` lança "VITE_NEON_AUTH_BASE_URL nao definida" e a tela fica em branco (CLAUDE.md, env vars de build do Cloudflare Pages).
- `NODE_VERSION=24` fixado nas env vars de build por causa do bug do `npm 10.9.2` no resolvedor de dependências (CLAUDE.md; FECHAMENTO.md do rollout, pós-fechamento).

## Contrato de saída

- O build publica o SPA no domínio `https://contafacil.nymbuslab.com.br` (registro CNAME `contafacil → conta-facil.pages.dev`, proxied — `docs/sprintx/features/rollout-neon-production/00-BLOQUEIOS.md`, B-06).
- Se a Function ou o Auth mudarem de URL, as duas env vars do Pages precisam ser atualizadas juntas, no painel ou via API `PATCH /accounts/{id}/pages/projects/conta-facil`, campo `deployment_configs.*.env_vars` (CLAUDE.md).

## Limites e cotas

- Duração do build do Pages: NÃO DOCUMENTADO nas fontes internas.
- Trigger de build é a branch de produção `master` (FECHAMENTO.md do rollout, pós-fechamento). Previews de outras branches: NÃO DOCUMENTADO.

## Erros conhecidos e tratamento

- Build falha com `Cannot read properties of null (reading 'edgesOut')` → `npm 10.9.2` do ambiente padrão do Cloudflare; solução documentada: manter `NODE_VERSION=24` (CLAUDE.md; FECHAMENTO.md do rollout). Primeiro lugar a olhar se o build voltar a falhar.
- Tela em branco após build → falta `VITE_NEON_AUTH_BASE_URL` (e/ou `VITE_NEON_FUNCTION_API_BASE_URL`) nas env vars de build (CLAUDE.md).
- `wrangler pages deploy` manual não é mais o caminho — o projeto está conectado ao GitHub (FECHAMENTO.md do rollout).

## Riscos para a nossa implementação

- O passo do frontend no fluxo unificado é um `git push` — carrega todos os commits pendentes, que podem não existir ainda no momento do deploy de backend. Se o fluxo unificado inclui o push, precisa decidir o que fazer quando não há nada para pushar (decisão da F2).
- Sem verificação pós-push documentada, o processo não sabe se o build passou antes de declarar o deploy concluído (lacuna 3 da base).
- O frontend embute URLs da Function e do Auth no build: um deploy do frontend sem o backend pronto expõe exatamente o bug silencioso que motivou a feature (Function antiga respondendo "normal" com comportamento desatualizado).

## Fonte

CLAUDE.md (raiz; deploy do frontend e env vars de build do Cloudflare Pages) — acessado em 2026-10-12; `docs/sprintx/features/rollout-neon-production/{FECHAMENTO.md, 00-BLOQUEIOS.md (B-06)}` — acessados em 2026-10-12.
