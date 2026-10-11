---
expx_schema: 1
expx_tool: sprintx
kind: base_indice
trabalho_id: rollout-neon-production
atualizado_em: 2026-10-10
areas:
  - arquivo: arquitetura-atual-neon.md
    titulo: Arquitetura atual da integracao Neon (branch test)
    lacunas: 0
  - arquivo: deploy-e-promocao-neon.md
    titulo: Deploy e promocao de branch no Neon (CLI)
    lacunas: 2
  - arquivo: hospedagem-do-frontend.md
    titulo: Hospedagem do frontend (SPA)
    lacunas: 2
---

# Índice da base — rollout-neon-production

> Criado na F1 e atualizado a cada arquivo de base gravado.

| Arquivo | Área | Resumo |
|---|---|---|
| `arquitetura-atual-neon.md` | Integração Neon na branch `test` | Como `neon.ts`, a Function, o CORS e as duas connection strings (pooled/unpooled) funcionam hoje. |
| `deploy-e-promocao-neon.md` | Deploy e promoção via CLI do Neon | O que `neon deploy`/`apply` faz, e os mecanismos de reset-from-parent e Instant Restore para rollback. |
| `hospedagem-do-frontend.md` | Hospedagem do SPA | Onde o frontend é publicado hoje — não documentado em nenhuma fonte do repositório. |

<!-- Item equivalente no frontmatter, um por linha da tabela — ver bloco `areas:` acima. -->
