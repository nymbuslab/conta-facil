---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: dashboard-extrato
sprint_id: sprint-02
titulo: Backend - duas consultas novas
status: concluido
criterio_saida: GET /lancamentos/vencendo e GET /lancamentos/recentes respondem corretamente contra a branch test real
fases: [F-02.1, F-02.2]
riscos: [As duas rotas compartilham lancamentos.ts, entao as tasks de implementacao sao sequenciais por arquivo]
atualizado_em: 2026-10-17
---

# Sprint 02 — Backend: duas consultas novas

## Objetivo

Implementar os dois endpoints que a base identificou como ausentes (`contrato-lancamentos.md`):
`GET /lancamentos/vencendo` (despesas não pagas vencendo numa janela de dias, ordenadas por
vencimento) e `GET /lancamentos/recentes` (receita e despesa misturadas, mais recentes primeiro).

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-02.1 | Repositório e rotas | nenhuma |
| F-02.2 | Integração real na branch test | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

`npm run test:integration:lancamentos` passa cobrindo os dois endpoints novos contra a branch
Neon `test` real, com isolamento por usuário confirmado.

## Riscos conhecidos

- Nenhuma migration nova — os dois endpoints são apenas consultas sobre `lancamentos`
  (`base/contrato-lancamentos.md`), mas o índice existente (`drizzle/0002_paginacao_indices.sql`)
  cobre `(user_id, criado_em, id)`, não `vencimento` — sem índice dedicado, `/lancamentos/vencendo`
  faz sequential scan filtrado por `vencimento`; aceitável no volume atual do projeto (um usuário
  real hoje), sem decisão de índice novo pedida pelo usuário.
