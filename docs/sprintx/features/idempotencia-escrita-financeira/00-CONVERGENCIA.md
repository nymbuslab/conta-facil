---
expx_schema: 1
expx_tool: sprintx
kind: convergencia
trabalho_id: idempotencia-escrita-financeira
atualizado_em: 2026-10-12
rodada: 1
voltas_maximas: 2
resultado: convergido
decisoes_conferidas: 8
achados: []
---

# Convergência — idempotencia-escrita-financeira

## Rodada 1 — 2026-10-12

As decisões D-01 a D-08 e as tasks T-01.01, T-02.01 a T-02.07 foram reconferidas por auditor independente contra schema, migration, executor, rotas, cliente HTTP, contextos e testes.

Evidências principais:

- unicidade composta por usuário e chave, hash canônico e lock transacional;
- mutação financeira e registro de resposta na mesma transação;
- replay sem novo efeito e `409` para reutilização incompatível;
- uma única repetição para rede, `502`, `503` e `504`, com método, corpo e chave preservados;
- concorrência, parcelamento, saldo, rollback e isolamento entre usuários exercitados no Postgres de teste;
- migration e integração idempotente repetidas com sucesso em 2026-10-12; nenhuma escrita em produção.

Não houve achado ALTO ou MÉDIO. Três endurecimentos BAIXOS não bloqueiam o aceite e seguem para o backlog vivo: validar a identidade real da conexão além de `NEON_BRANCH`, remover usuários descartáveis do Neon Auth e emitir o log de execução somente depois da confirmação do commit.

**Resultado da rodada 1:** `convergido`. Nenhuma sprint nova.
