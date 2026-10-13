---
expx_schema: 1
expx_tool: sprintx
kind: convergencia
trabalho_id: seguranca-dependencias
atualizado_em: 2026-10-12
rodada: 2
voltas_maximas: 2
resultado: convergido
decisoes_conferidas: 4
achados: []
---

# Convergência — seguranca-dependencias

## Rodada 1 — 2026-10-12

O auditor independente confirmou a árvore com zero alertas altos ou críticos e quatro moderados documentados, mas abriu dois achados:

| id | tipo_lacuna | severidade | evidência | destino |
|---|---|---|---|---|
| C-01 | parcial | ALTA | o teste validava nomes no fonte, mas não provava as utilities no CSS final | T-03.01 |
| C-02 | contradiz | ALTA | a tabela visual não registrava medidas por par e a primeira medição posterior não usava o DOM original | T-03.02 |

**Resultado da rodada 1:** `tasks_acrescentadas`. Foi aberta a `sprint-03`.

## Rodada 2 — 2026-10-12

- C-01 foi resolvido com build programático do Vite e inspeção das utilities e variantes emitidas no CSS final.
- C-02 foi resolvido comparando duas aplicações isoladas: o commit `1ee45a9`, com DOM e Tailwind 3 originais, e a árvore atual com Tailwind 4. Os mesmos mocks, viewports e tempo de estabilização produziram delta geométrico zero e fingerprints iguais nos 16 pares.
- A tentativa intermediária `flex flex-col gap-2`, que deslocava formulários em 5 a 15 px, foi rejeitada. O seletor `[&>*+*]:mt-2` recompõe exatamente o espaçamento do Tailwind 3.
- As 16 imagens v4 foram recapturadas depois da correção.

Não houve novo achado ALTO ou MÉDIO. Permanece somente o endurecimento BAIXO de remover usuário e dados descartáveis da fixture visual.

**Resultado da rodada 2:** `convergido`. Nenhuma sprint nova.
