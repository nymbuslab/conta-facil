---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: navegacao-inferior
sprint_id: sprint-01
titulo: Capacidade de testar
status: concluido
criterio_saida: npm run test -- --run termina com 0 failed e ao menos 1 passed
fases: [F-01.1]
riscos: [Projeto nao tinha nenhum framework de teste instalado antes desta sprint]
atualizado_em: 2026-10-08
---

# Sprint 01 — Capacidade de testar

## Objetivo

Instalar e configurar o Vitest + Testing Library (ambiente jsdom) no projeto, que hoje não tem nenhum framework de teste, e provar que a suíte roda com um smoke test real sobre um componente já existente. Nenhuma funcionalidade de negócio é entregue nesta sprint.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-01.1 | Configurar harness de teste | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

`npm run test -- --run` executa a suíte inteira e termina com 0 failed e ao menos 1 teste passed.

## Riscos conhecidos

- Projeto não tinha nenhum framework de teste instalado antes desta sprint (`base/roteamento-tanstack-router.md` e o restante da base não registram nenhum `*.test.*` existente) — toda a configuração é feita do zero nesta sprint.
