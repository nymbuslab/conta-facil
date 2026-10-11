---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: rollout-neon-production
sprint_id: sprint-02
titulo: Backend Neon em production
status: concluida
criterio_saida: A branch production tem as tabelas lancamentos e caixinhas e a Function api implantada respondendo 200 em /health com CORS liberado para o dominio de produção
fases: [F-02.1, F-02.2]
riscos: [FUNCTION_ALLOWED_ORIGINS sem o dominio novo bloqueia silenciosamente o app em producao via CORS]
atualizado_em: 2026-10-11
---

# Sprint 02 — Backend Neon em production

## Objetivo

Completar na branch `production` (que já existe com Auth e Object Storage, mas sem schema de
negócio nem Function) o que falta: aplicar a migration Drizzle e implantar a Function `api` com
CORS liberado para o domínio de produção. Documentar também o procedimento de rollback por
Instant Restore, caso algo saia errado.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-02.1 | Schema e Function em production | F-02.2 |
| F-02.2 | Rollback documentado | F-02.1 |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

`get_database_tables` na branch `production` lista `lancamentos` e `caixinhas`, `list_functions`
lista a Function `api`, e uma chamada `GET /health` responde 200 — tudo verificável sem depender
do frontend.

## Riscos conhecidos

- `FUNCTION_ALLOWED_ORIGINS` sem o domínio de produção faz o CORS cair no default
  `http://localhost:5173` e bloquear o app real sem erro visível no servidor (`base/arquitetura-atual-neon.md`).
- A janela de "Instant Restore" depende do plano Neon contratado, que não está documentado em
  nenhuma fonte lida (`base/deploy-e-promocao-neon.md`).
