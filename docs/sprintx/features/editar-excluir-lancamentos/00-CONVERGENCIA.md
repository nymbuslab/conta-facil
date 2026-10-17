---
expx_schema: 1
expx_tool: sprintx
kind: convergencia
trabalho_id: editar-excluir-lancamentos
atualizado_em: 2026-10-17
rodada: 2
voltas_maximas: 2
resultado: convergido
decisoes_conferidas: 10
achados: []
---

# Convergência — editar-excluir-lancamentos

> Gravado pela F6 no Passo 2.5. O frontmatter traz só os achados da rodada atual; a prosa abaixo acumula o histórico de todas as rodadas, a mais recente por último.

## Rodada 1 — 2026-10-17

Decisões conferidas: 10 (D-01 a D-10). Tasks com critério de aceite reconferido: 17.

| id | tipo_lacuna | severidade | origem | evidência | destino |
|---|---|---|---|---|---|
| C-01 | parcial | MÉDIA | D-02 | `acoes-lancamento-dialog.tsx`: bloqueio funcional de "Marcar como paga" existe, mas falta o texto de aviso que D-02 promete | T-05.01 |
| C-02 | nao_pedido | BAIXA | — | `ORQUESTRADOR.md`: frontmatter desatualizado (`estagio: f4`, `status: nao_iniciado`) em relação às 17 tasks já concluídas | só registro — corrigido no fechamento (Passo 3.1), sem task |

Resultado: tasks_acrescentadas: sprint-05 com 1 task (T-05.01).

Demais decisões (D-01, D-03 a D-10) conferidas sem achado — detalhe completo no relatório do
agente `auditor-convergencia` desta rodada, resumo: alcance de parcelamento (D-03), bloqueio de
caixinha nas duas camadas (D-04), campos do formulário de edição (D-05), diálogo único (D-06),
texto de exclusão (D-07), idempotência ponta a ponta (D-08), ausência deliberada de auditoria
(D-09) e reflexo na tela Parcelas (D-10) todos confirmados no código.

## Rodada 2 — 2026-10-17

Decisões reconferidas: 1 (D-02, foco pontual no achado C-01). Tasks com critério de aceite
reconferido: 1 (T-05.01).

| id | tipo_lacuna | severidade | origem | evidência | destino |
|---|---|---|---|---|---|
| — | — | — | — | Nenhum achado. | — |

C-01 confirmado resolvido: `acoes-lancamento-dialog.tsx` (linhas 182, 194-198) mostra "Essa
despesa já foi paga. Editar ou excluir muda o card Total Pago." quando `lancamento.tipo ===
'despesa' && lancamento.paga`; `acoes-lancamento-dialog.test.tsx` (linhas 96-115) cobre o texto
em si (não só o nome do teste) e os dois casos negativos (despesa pendente, receita). Sem
regressão em `podeMarcarComoPaga` nem nos botões Editar/Excluir.

Resultado: convergido.
