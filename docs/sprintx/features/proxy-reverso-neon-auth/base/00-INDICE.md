---
expx_schema: 1
expx_tool: sprintx
kind: base_indice
trabalho_id: proxy-reverso-neon-auth
atualizado_em: 2026-10-16
areas:
  - arquivo: neon-auth-sessao-cookie.md
    titulo: Neon Auth - sessao via cookie cross-origin
    lacunas: 3
  - arquivo: cloudflare-pages-functions-proxy.md
    titulo: Cloudflare Pages Functions - proxy reverso
    lacunas: 3
  - arquivo: auth-interno.md
    titulo: Autenticacao interna do app
    lacunas: 0
  - arquivo: deploy-interno.md
    titulo: Deploy e configuracao de producao
    lacunas: 1
---

# Índice da base — proxy-reverso-neon-auth

> Criado na F1 com `areas: []` e atualizado a cada arquivo de base gravado. Uma linha por área estudada.
> A lista `areas:` do frontmatter espelha esta lista: `arquivo` (nome dentro de `base/`, sem diretório), `titulo` e `lacunas` (quantas lacunas daquela área estão em `00-LACUNAS.md`, `0` se nenhuma). Formato em `references/00-schema.md`.

| Arquivo | Área | Resumo |
|---|---|---|
| `neon-auth-sessao-cookie.md` | Neon Auth — sessão via cookie cross-origin | Sessão do Neon Auth é 100% baseada em cookie cross-origin (`useSession`/`.token()`); `rememberMe` já é `true` por default; a própria skill do Neon admite não garantir cookie de terceiros em todo navegador; `Domain` real do `Set-Cookie` não verificado empiricamente |
| `cloudflare-pages-functions-proxy.md` | Cloudflare Pages Functions — proxy reverso | Padrão de proxy reverso em Workers/Pages Functions (`fetch` + reconstrução de `Response`, incluindo `Set-Cookie`); projeto não tem hoje pasta `functions/` nem `wrangler.toml` |
| `auth-interno.md` | Autenticação interna do app | Como `VITE_NEON_AUTH_BASE_URL` é lida e injetada (`auth-context.tsx`, `vite.config.ts`); contrato de `extrairToken` independe do host |
| `deploy-interno.md` | Deploy e configuração de produção | CSP (`connect-src`), env vars do Pages, domínio confiável do Neon Auth, e que `scripts/deploy.mjs` não conhece `functions/` hoje |
