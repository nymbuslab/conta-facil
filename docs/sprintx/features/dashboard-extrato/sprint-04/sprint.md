---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: dashboard-extrato
sprint_id: sprint-04
titulo: Dashboard - cards novos no Inicio
status: concluido
criterio_saida: Inicio mostra os 4 cards, Contas vencendo e Ultimos lancamentos, sem FAB nem navegacao de mes
fases: [F-04.1, F-04.2]
riscos: [Header mostra o mes do relogio e nao o filtros.mes - ver base/tela-inicio-atual.md, risco que esta sprint nao piora nem resolve]
atualizado_em: 2026-10-17
---

# Sprint 04 — Dashboard: cards novos no Início

## Objetivo

Transformar `index.tsx` num dashboard puro: manter os 4 cards de resumo, adicionar "Contas
vencendo" e "Últimos lançamentos" (consumindo os endpoints da sprint-02), e remover
`FiltrosLancamentos`/`ListaLancamentos`/`RegistrarFab`, que migram para o Extrato na sprint-05.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-04.1 | Dados no contexto | nenhuma |
| F-04.2 | Cards e composição | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

`npm run test -- --run` passa com `index.test.tsx` cobrindo os dois cards novos e a ausência do
FAB/filtros no dashboard.

## Riscos conhecidos

- O `Header` (`src/components/header.tsx`) mostra o mês do relógio via `formatarMesAno()`, não o
  mês navegável — como o dashboard agora trava no mês vigente (D-08), isso deixa de ser uma
  inconsistência: o relógio e o dashboard sempre concordam.
