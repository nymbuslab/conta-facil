---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: editar-excluir-lancamentos
sprint_id: sprint-01
titulo: Fundacao de teste para editar e excluir
status: concluido
criterio_saida: suite passa com os mocks de PATCH/DELETE de lancamentos e o fake de repositorio prontos para TDD
fases: [F-01.1]
riscos: [Nenhum risco registrado.]
atualizado_em: 2026-10-17
---

# Sprint 01 — Fundação de teste para editar e excluir

## Objetivo

Dar às sprints seguintes a capacidade de escrever teste (TDD) para editar e excluir lançamentos:
o mock de API usado pelos testes de UI passa a simular `PATCH`/`DELETE` em `/lancamentos/:id`
(incluindo o bloqueio de vínculo com caixinha), e o repositório fake usado pelos testes de rota
ganha os métodos correspondentes. Nenhuma lógica de negócio real é escrita aqui.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-01.1 | Mocks de teste para editar/excluir | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

`npm run test -- --run src/test/api-client-mocks.test.ts src/functions/api/lancamentos.test.ts`
termina com 0 failed.

## Riscos conhecidos

Nenhum risco registrado.
