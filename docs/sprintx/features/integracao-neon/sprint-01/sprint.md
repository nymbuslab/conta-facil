---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: integracao-neon
sprint_id: sprint-01
titulo: Capacidade de testar
status: concluido
criterio_saida: npm run test:integration conecta na branch Neon de teste e o health check da Function local responde 200
fases: [F-01.1]
riscos: [Branch de teste pode nao existir ainda no projeto Neon conta-facil, criar antes de rodar T-01.01]
atualizado_em: 2026-10-10
---

# Sprint 01 — Capacidade de testar

## Objetivo

Preparar tudo que as sprints seguintes precisam para testar de verdade: uma branch Neon de
teste resetável, as dependências (Drizzle, pg, Hono, Neon Auth, Neon Functions), a suíte de
integração conectando nessa branch, e o scaffold da Neon Function respondendo localmente. Não
entrega funcionalidade de negócio.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-01.1 | Capacidade de testar | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

`npm run test:integration` conecta com sucesso na branch Neon de teste e `GET /health` na
Function local (`neon dev`) responde `200`.

## Riscos conhecidos

- Branch de teste fixa (D-09) pode ainda não existir no projeto Neon `conta-facil` — T-01.01
  cria/confirma antes de qualquer outra sprint rodar testes de integração.
- Região do projeto Neon não documentada na base (`base/00-LACUNAS.md`) — Functions e Object
  Storage exigem uma das quatro regiões suportadas; confirmar com `neon status` antes de
  T-01.04.
