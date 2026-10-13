---
expx_schema: 1
expx_tool: sprintx
kind: base_indice
trabalho_id: deploy-unificado
atualizado_em: 2026-10-12
areas:
  - arquivo: processo-deploy-atual.md
    titulo: Processo de deploy atual
    lacunas: 0
  - arquivo: neon-cli-deploy.md
    titulo: Contrato do neon deploy no CLI
    lacunas: 2
  - arquivo: scripts-padrao-projeto.md
    titulo: Padroes de script do projeto
    lacunas: 0
  - arquivo: frontend-cloudflare-pages.md
    titulo: Deploy do frontend via Cloudflare Pages
    lacunas: 1
  - arquivo: drizzle-migrate-production.md
    titulo: Migrations Drizzle em production
    lacunas: 1
---

# Índice da base

| Arquivo | Área | Lacunas |
|---|---|---|
| `processo-deploy-atual.md` | Os dois passos manuais de deploy, ordem correta e incidente de origem | 0 |
| `neon-cli-deploy.md` | Contrato do `neon deploy` no CLI: `--env`, cotas, link `.neon`, acumulação de env | 2 |
| `scripts-padrao-projeto.md` | Padrões de script do projeto: fail-closed, injeção de executor, Windows | 0 |
| `frontend-cloudflare-pages.md` | Push que dispara o build no Pages, env vars obrigatórias, falhas conhecidas | 1 |
| `drizzle-migrate-production.md` | Migrations em `production`: `DATABASE_URL_UNPOOLED`, ordem antes da Function | 1 |
