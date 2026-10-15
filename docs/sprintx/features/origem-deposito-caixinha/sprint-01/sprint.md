---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: origem-deposito-caixinha
sprint_id: sprint-01
titulo: Fundacao de dados e capacidade de teste
status: concluido
criterio_saida: Tabela nova existe na branch test e os mocks/wrappers de teste sabem simular origem e receita vinculada
fases: [F-01.1, F-01.2]
riscos: [Migration gerada pelo drizzle-kit pode divergir do desenho manual deste plano, exige conferencia antes de aplicar]
atualizado_em: 2026-10-15
---

# Sprint 01 — Fundação de dados e capacidade de teste

## Objetivo

Criar a tabela de movimentações por caixinha (schema + migration) e preparar a infraestrutura de
teste (mocks e wrapper combinando os dois contextos) que as sprints seguintes vão precisar para
fazer TDD das regras de negócio.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-01.1 | Schema e migration | F-01.2 |
| F-01.2 | Capacidade de teste | F-01.1 |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

`npm run test:migrate` aplica a migration 0003 na branch `test` sem erro, e
`npm run test -- api-client-mocks` (via os testes que o consomem) prova que o mock de depósito
propaga `origem` e alimenta o estado fake de lançamentos.

## Riscos conhecidos

- A migration gerada por `drizzle-kit generate` pode produzir SQL diferente do desenhado neste
  plano (ordem de enum/tabela/índice) — conferir contra o estilo de `drizzle/0000_init.sql` antes
  de aplicar (`base/padroes-de-teste.md`).
- Nenhum outro risco registrado na base para esta sprint.
