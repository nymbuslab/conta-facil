---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: navegacao-inferior
sprint_id: sprint-04
titulo: Caixinhas
status: concluido
criterio_saida: Criar, depositar, resgatar e excluir caixinha funcionam, e a tela Inicio mostra o card Guardado e o saldo acumulado considerando as caixinhas
fases: [F-04.1, F-04.2, F-04.3]
riscos: []
atualizado_em: 2026-10-08
---

# Sprint 04 — Caixinhas

## Objetivo

Implementar o domínio de Caixinhas (reservas com meta) como um lançamento separado de Despesa/Receita: criar, depositar, resgatar e excluir, com o saldo acumulado e o novo card "Guardado" da tela Início refletindo o total guardado.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-04.1 | Modelo de dados base de Caixinhas | nenhuma |
| F-04.2 | Construção paralela de hook e componentes | nenhuma |
| F-04.3 | Integração final | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

Criar uma caixinha, depositar e resgatar valor atualiza o card dela e o total guardado; excluir uma caixinha devolve o valor ao saldo acumulado geral; a tela Início mostra o 3º card "Guardado" e o saldo acumulado descontando o total guardado.

## Riscos conhecidos

Nenhum risco registrado.
