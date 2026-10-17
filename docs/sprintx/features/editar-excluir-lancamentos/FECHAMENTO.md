---
expx_schema: 1
expx_tool: sprintx
kind: fechamento
trabalho_id: editar-excluir-lancamentos
titulo: Editar e excluir lancamentos
tipo_trabalho: feature
fechado_em: 2026-10-17
modulo_afetado: [functions, state, components, routes, test, lib]
arquivos_alterados: [src/test/api-client-mocks.ts, src/test/api-client-mocks.test.ts, src/lib/api-client.ts, src/lib/api-client.test.ts, src/functions/api/lancamentos.ts, src/functions/api/lancamentos.test.ts, src/test/lancamentos-setup.ts, src/state/lancamentos-context.tsx, src/state/lancamentos-context.test.tsx, src/components/acoes-lancamento-dialog.tsx, src/components/acoes-lancamento-dialog.test.tsx, src/components/extrato-lista.tsx, src/components/lista-lancamentos.tsx, src/components/extrato-lista.test.tsx, src/components/lista-lancamentos.test.tsx, src/lib/colunas-lancamento.tsx, src/components/fluxos-assincronos.test.tsx, src/components/acessibilidade.test.tsx, src/routes/parcelas.test.tsx]
palavras_chave: [lancamentos, editar, excluir, extrato, parcelamento, caixinha, idempotencia, dialogo]
resumo: Receita e despesa agora podem ser editadas e excluídas direto do diálogo de ações do Extrato, com idempotência ponta a ponta, escolha de alcance em parcelamento e bloqueio de receita vinculada a caixinha.
decisao_principal: "D-06: um único diálogo (AcoesLancamentoDialog) reúne marcar como paga, editar e excluir por trás de um menu, em vez de três entradas separadas na linha — mantém o Extrato simples sem perder as três ações."
risco_residual: As rotas PATCH/DELETE /lancamentos/:id do Sprint 02 (backend) ainda não foram implantadas em production — só existem na Function local e na branch test; e a verificação visual real em navegador (sprint-04) foi pulada duas vezes por timeout da ferramenta de automação, coberta só pela suíte automatizada.
testes_adicionados: 35
---

# Fechamento — editar-excluir-lancamentos

> Registro do que este trabalho entregou, em que módulo e em que arquivos. É o que torna a
> feature encontrável depois: por arquivo, por módulo e por palavra-chave.
> Os três campos de indexação são cópia fiel do `ORQUESTRADOR.md` no momento do fechamento.

## O que foi entregue

Clicar numa linha de receita ou despesa no Extrato (e na tela Parcelas) abre um diálogo com
menu de ações — marcar como paga (quando aplicável), editar e excluir — em vez de só a
confirmação de pagamento. Edição e exclusão são idempotentes como a criação, perguntam o
alcance quando a linha pertence a um parcelamento, mostram aviso quando a despesa já foi paga,
e bloqueiam a edição/exclusão de receita vinculada a um depósito "de fora" em caixinha. A tela
Parcelas reflete o resultado nos agregados sem precisar de nova navegação.

## Decisão principal

D-06: um único diálogo (`AcoesLancamentoDialog`) reúne marcar como paga, editar e excluir por
trás de um menu — evita poluir a linha do Extrato com botões extras e reaproveita o diálogo que
já existia para confirmação de pagamento.

## Risco residual

As rotas `PATCH`/`DELETE /lancamentos/:id` (Sprint 02, backend) foram implementadas e testadas
contra a branch `test` real, mas **não foram implantadas em `production`** nesta entrega — falta
rodar `npx neon deploy --env .env.local` contra a branch `production` quando o usuário autorizar.
Até lá, o frontend em produção chamaria essas rotas e receberia 404. Além disso, a verificação
visual em navegador real do Sprint 04 (UI do diálogo) foi pulada duas vezes por timeout
repetido da ferramenta de automação do navegador; a cobertura dessa camada ficou só com a
suíte automatizada (Testing Library), sem captura de tela real em desktop/mobile.

## Onde isto mexeu

- **Módulos:** functions, state, components, routes, test, lib
- **Arquivos:** `src/test/api-client-mocks.ts`, `src/test/api-client-mocks.test.ts`,
  `src/lib/api-client.ts`, `src/lib/api-client.test.ts`, `src/functions/api/lancamentos.ts`,
  `src/functions/api/lancamentos.test.ts`, `src/test/lancamentos-setup.ts`,
  `src/state/lancamentos-context.tsx`, `src/state/lancamentos-context.test.tsx`,
  `src/components/acoes-lancamento-dialog.tsx`, `src/components/acoes-lancamento-dialog.test.tsx`,
  `src/components/extrato-lista.tsx`, `src/components/lista-lancamentos.tsx`,
  `src/components/extrato-lista.test.tsx`, `src/components/lista-lancamentos.test.tsx`,
  `src/lib/colunas-lancamento.tsx`, `src/components/fluxos-assincronos.test.tsx`,
  `src/components/acessibilidade.test.tsx`, `src/routes/parcelas.test.tsx`
- **Testes adicionados:** 35
