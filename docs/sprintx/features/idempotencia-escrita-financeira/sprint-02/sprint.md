---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: idempotencia-escrita-financeira
sprint_id: sprint-02
titulo: Idempotencia ponta a ponta
status: concluido
criterio_saida: Repeticoes sequenciais e concorrentes alteram cada operacao financeira uma unica vez na branch Neon de teste
fases: [F-02.1, F-02.2, F-02.3]
riscos: [Migration precisa rodar somente na branch Neon de teste, Resposta persistida precisa manter isolamento por usuario]
atualizado_em: 2026-10-11
---

# Sprint 02 - Idempotência ponta a ponta

## Objetivo

Adicionar persistência transacional, integrar os três endpoints financeiros e fazer o cliente repetir falhas transitórias com a mesma chave.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-02.1 | Persistência | nenhuma |
| F-02.2 | API financeira | nenhuma |
| F-02.3 | Cliente e integração | nenhuma |

## Critério de saída

Repetições sequenciais e concorrentes alteram cada operação financeira uma única vez na branch Neon de teste.

## Riscos conhecidos

- A migration deve rodar somente na branch Neon de teste.
- A resposta persistida precisa manter isolamento por usuário.
