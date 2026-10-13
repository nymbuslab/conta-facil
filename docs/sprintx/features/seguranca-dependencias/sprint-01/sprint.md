---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: seguranca-dependencias
sprint_id: sprint-01
titulo: Capacidade de auditar dependencias
status: concluido
criterio_saida: O auditor falha fechado e existe baseline visual persistente de 16 estados em dois viewports
fases: [F-01.1]
riscos: [O formato JSON do npm audit pode mudar entre versoes principais do npm]
atualizado_em: 2026-10-11
---

# Sprint 01 - Capacidade de auditar dependências

## Objetivo

Criar uma verificação repetível para alertas npm e capturar o baseline visual anterior à migração.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-01.1 | Harness da auditoria | nenhuma |

## Critério de saída

O auditor falha fechado e existem 16 capturas v3 persistentes cobrindo rotas e diálogos em dois viewports.

## Riscos conhecidos

- O formato JSON do npm audit pode mudar entre versões principais do npm.
