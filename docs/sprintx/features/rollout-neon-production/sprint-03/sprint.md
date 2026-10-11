---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: rollout-neon-production
sprint_id: sprint-03
titulo: Frontend no Cloudflare Pages
status: concluida
criterio_saida: https://contafacil.nymbuslab.com.br responde 200 com o build atual do app, apontando para a Function de production
fases: [F-03.1]
riscos: [Sem CLOUDFLARE_API_TOKEN no ambiente antes da F6, as tasks desta sprint ficam bloqueadas sem travar o sprint-02]
atualizado_em: 2026-10-11
---

# Sprint 03 — Frontend no Cloudflare Pages

## Objetivo

Publicar o build do Vite no Cloudflare Pages, configurar a variável que aponta para a Function
de `production` (sprint-02) e colocar o domínio `contafacil.nymbuslab.com.br` no ar.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-03.1 | Provisionamento Cloudflare Pages | nenhuma |

Detalhe da fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

Uma requisição HTTP a `https://contafacil.nymbuslab.com.br` responde 200 com o HTML do SPA, e o
app consegue chamar a Function de `production` sem erro de CORS.

## Riscos conhecidos

- Sem `CLOUDFLARE_API_TOKEN` disponível no ambiente antes da F6, a primeira task desta sprint
  (T-03.01) fica bloqueada (D-12, `00-DECISOES.md`), e as demais tasks da sprint dependem dela —
  o sprint-02 (lado Neon) não é afetado por esse bloqueio.
- Domínio e DNS ainda não configurados (lacuna resolvida na F2: é parte do escopo, D-11).
