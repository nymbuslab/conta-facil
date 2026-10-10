---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: integracao-neon
sprint_id: sprint-04
titulo: Migrar contextos do front-end
status: concluida
criterio_saida: Inicio, Parcelas e Caixinhas leem e escrevem na Function real e sobrevivem a reload, com os 4 estados de tela
fases: [F-04.1]
riscos: [Nenhum risco adicional alem dos ja registrados nas sprints anteriores]
atualizado_em: 2026-10-10
---

# Sprint 04 — Migrar contextos do front-end

## Objetivo

Trocar `LancamentosProvider`/`CaixinhasProvider` de `useState` em memória para a Neon Function
real, preservando a assinatura de `useLancamentos()`/`useCaixinhas()`, e acrescentar os estados
de carregando/erro que hoje não existem em nenhuma tela.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-04.1 | Migrar contextos e UI | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

As telas Início, Parcelas e Caixinhas leem e escrevem via a Function, sobrevivem a reload, e
mostram carregando/erro/vazio/populado conforme D-06 e D-11.

## Riscos conhecidos

- Nenhum risco adicional além dos já registrados nas sprints anteriores.
