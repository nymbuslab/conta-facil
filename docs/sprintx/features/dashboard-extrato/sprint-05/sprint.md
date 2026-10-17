---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: dashboard-extrato
sprint_id: sprint-05
titulo: Extrato - nova tela
status: concluido
criterio_saida: Extrato tem busca, navegacao de mes, abas Receita/Despesas e o FAB de registrar, tudo migrado do Inicio antigo
fases: [F-05.1, F-05.2]
riscos: [ListaLancamentos muda de secoes empilhadas para abas - componente novo, nao reaproveitamento direto]
atualizado_em: 2026-10-17
---

# Sprint 05 — Extrato: nova tela

## Objetivo

Dar à rota `/extrato` (scaffolded na sprint-01) a composição completa: busca, navegador de mês
(`FiltrosLancamentos`, reaproveitado sem alteração), abas Receita/Despesas no lugar das seções
empilhadas de hoje, e o `RegistrarFab` migrado do Início antigo.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-05.1 | Lista com abas e composição | nenhuma |
| F-05.2 | Skeleton | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

`npm run test -- --run` passa com `extrato.test.tsx` cobrindo busca, navegação de mês, alternância
de abas e abertura do modal de registrar pelo FAB.

## Riscos conhecidos

- `ListaLancamentos` (`base/componentes-reutilizaveis.md`) empilha Receita/Despesa hoje; o
  Extrato precisa de abas (D-05, D-14) — não é um reaproveitamento direto do componente, e sim
  um componente novo (`ExtratoLista`) que reusa as colunas e o `DataTable` já existentes.
