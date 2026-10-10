---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: integracao-neon
sprint_id: sprint-03
titulo: Schema e Function de API
status: concluido
criterio_saida: Schema aplicado na branch de teste e a Function autenticada expoe lancamentos e caixinhas isolados por usuario
fases: [F-03.1, F-03.2]

riscos: [Nenhum risco adicional alem dos ja registrados nas sprints anteriores]
atualizado_em: 2026-10-10
---

# Sprint 03 — Schema e Function de API

## Objetivo

Criar o schema Postgres de lançamentos e caixinhas (uuid, centavos, `user_id`) e a Neon
Function que expõe esses dados via HTTP, autenticada por JWT, nunca pela Data API direto do
browser (D-02).

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-03.1 | Schema Postgres | F-03.2 |
| F-03.2 | Function de API autenticada | F-03.1 |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

A migration roda na branch de teste sem erro, e as rotas de lançamentos e caixinhas da Function
só retornam/alteram linhas do `user_id` do token que fez a chamada.

## Riscos conhecidos

- Nenhum risco adicional além dos já registrados em `base/neon-data-api-e-postgres.md` e nas
  sprints anteriores.
