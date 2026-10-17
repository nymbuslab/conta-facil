---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: dashboard-extrato
sprint_id: sprint-01
titulo: Capacidade de testar
status: concluido
criterio_saida: npm run test -- --run passa com os mocks novos e a rota /extrato renderiza vazia
fases: [F-01.1, F-01.2]
riscos: [Nenhuma mudanca de schema necessaria - os dois endpoints novos sao so consultas sobre lancamentos existente]
atualizado_em: 2026-10-17
---

# Sprint 01 — Capacidade de testar

## Objetivo

Preparar o cliente fake de testes para os dois endpoints novos (`/lancamentos/vencendo` e
`/lancamentos/recentes`) e dar à rota `/extrato` uma existência mínima no roteador, para que as
sprints seguintes já tenham onde escrever teste contra comportamento real.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-01.1 | Mocks dos endpoints novos | nenhuma |
| F-01.2 | Scaffold da rota Extrato | F-01.1 |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

`npm run test -- --run` passa incluindo os testes novos do cliente fake
(`api-client-mocks.test.ts`) e do scaffold de `extrato.tsx`.

## Riscos conhecidos

- Nenhum risco de schema (ver `base/contrato-lancamentos.md`) — os dois endpoints novos são
  consultas sobre a tabela `lancamentos` já existente, sem migration.
