---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: navegacao-inferior
sprint_id: sprint-03
titulo: Parcelamento de despesas
status: concluido
criterio_saida: Criar uma despesa parcelada gera N despesas mensais, marcar uma despesa como paga funciona a partir da Inicio, e a aba Parcelas mostra um card com progresso por compra
fases: [F-03.1, F-03.2]
riscos: []
atualizado_em: 2026-10-08
---

# Sprint 03 — Parcelamento de despesas

## Objetivo

Implementar o fluxo completo de compras parceladas: o checkbox "Parcelado?" no modal de Despesa, a geração automática das parcelas como despesas normais, a marcação manual de "paga" a partir da tela Início, e o card de acompanhamento na aba Parcelas.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-03.1 | Modelo de dados e estado | nenhuma |
| F-03.2 | Formulário, pagamento e aba Parcelas | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

Criar uma despesa com "Parcelado?" marcado e 12 parcelas de um total de R$1.200,00 gera 12 despesas mensais; clicar numa despesa na Início abre o popup de confirmação e marcá-la como paga reflete no card correspondente da aba Parcelas (Pago/Falta e barra de progresso).

## Riscos conhecidos

Nenhum risco registrado.
