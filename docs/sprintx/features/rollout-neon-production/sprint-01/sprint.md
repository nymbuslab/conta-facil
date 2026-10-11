---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: rollout-neon-production
sprint_id: sprint-01
titulo: Capacidade de verificar o rollout
status: concluida
criterio_saida: Existe um roteiro documentado para checar a Function de production e um checklist do golden path manual, prontos para uso nas sprints seguintes
fases: [F-01.1]
riscos: [Sem harness de verificacao pronto antes de tocar production, um deploy ruim so seria percebido pelo usuario final]
atualizado_em: 2026-10-11
---

# Sprint 01 — Capacidade de verificar o rollout

## Objetivo

Preparar o que permite confirmar, nas sprints seguintes, se o backend Neon e o frontend em
production estão funcionando — sem tocar em `production` ainda. Nenhuma task desta sprint é
negócio: é harness de verificação, reaproveitando os scripts `npm run test:function:health` e
`npm run test:function:deployed` já existentes.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-01.1 | Harness de verificação de production | nenhuma |

Detalhe da fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

`docs/sprintx/features/rollout-neon-production/VERIFICACAO.md` e
`CHECKLIST-GOLDEN-PATH.md` existem e descrevem passos verificáveis, sem depender de nada que
ainda não existe em `production`.

## Riscos conhecidos

- Sem harness de verificação pronto antes do deploy em `production`, um erro no CORS ou na
  migration só apareceria quando um usuário real tentasse usar o app — risco citado em
  `base/arquitetura-atual-neon.md` (CORS cai no default `localhost` se a env não for passada).
