# UI do Extrato — ponto de integração da feature

## Contrato de entrada

O usuário pediu explicitamente para reaproveitar o diálogo que hoje abre ao clicar numa linha
de despesa: `ConfirmarPagamentoDialog` (`src/components/confirmar-pagamento-dialog.tsx`).
Hoje ele só existe para despesa não paga — `DataTable` em `extrato-lista.tsx:112-119` e
`lista-lancamentos.tsx:71-78` passam `onRowClick={setDespesaSelecionada}` e
`linhaDesabilitada={(despesa) => despesa.paga}` (linha paga não abre nada hoje).

`colunas-lancamento.tsx` (`colunasReceita`, `colunasDespesa`) são as colunas compartilhadas
entre `ExtratoLista` e `ListaLancamentos` — fonte única (comentário em
`colunas-lancamento.tsx:9-11`). Hoje `colunasReceita` não tem nenhuma linha clicável nem
coluna de ação; só `colunasDespesa` tem a coluna "Status" (texto "Vencido"/"A vencer"/"Pago",
sem botão — revertido nesta mesma sessão a pedido do usuário).

`DataTable` (`src/components/data-table.tsx`) expõe `onRowClick`, `linhaDesabilitada` e
`rotuloLinha` (este último adicionado nesta sessão, para o nome acessível da linha clicável).

## Contrato de saída

`ConfirmarPagamentoDialog` recebe `despesa: Despesa | null`, `erro`, `processando`,
`onCancelar`, `onConfirmar(id)` (`confirmar-pagamento-dialog.tsx:12-18`). `LancamentoModal`
(`src/components/lancamento-modal.tsx`) é o modal de **criação** (não edição) — tem os dois
formulários (`FormularioReceita`, `FormularioDespesa`) com `react-hook-form` + `zodResolver`,
usando os schemas `receitaFormSchema`/`despesaFormSchema` de `src/types/lancamento.ts`. É o
padrão de formulário mais próximo do que um "editar" vai precisar.

## Limites e cotas

Não se aplica.

## Erros conhecidos e tratamento

`LancamentoModal` mostra erro de submissão como `<p className="text-sm text-destructive">`
dentro do próprio formulário (`lancamento-modal.tsx:70-72,146-149`) — mesmo padrão que
`ConfirmarPagamentoDialog` já usa.

## Riscos para a nossa implementação

- O usuário quer "um diálogo só" que ofereça pagar (quando aplicável), editar e excluir — hoje
  são dois componentes separados (`ConfirmarPagamentoDialog` e `LancamentoModal`). Juntar os
  dois nessa feature é decisão de UI que a F2 precisa fechar: um diálogo com estado interno
  (ex.: lista de ações → ação escolhida) ou três diálogos que se alternam a partir do mesmo
  clique na linha.
- Hoje só despesa tem linha clicável (`linhaDesabilitada`/`onRowClick` só em `colunasDespesa`
  + `DataTable` de despesa). Se editar/excluir também vale para receita, falta abrir esse
  mesmo mecanismo na tabela de receita (`extrato-lista.tsx:97-102`,
  `lista-lancamentos.tsx:55-60` hoje não passam `onRowClick`).
- Despesa paga está com `linhaDesabilitada: true` — se editar/excluir também valem pra
  despesa paga, essa trava não pode mais desabilitar a linha inteira, só o botão "marcar como
  paga" dentro do diálogo (que não faz sentido pra algo já pago).

## Fonte

`src/components/confirmar-pagamento-dialog.tsx`, `src/components/lancamento-modal.tsx`,
`src/components/extrato-lista.tsx:95-127`, `src/components/lista-lancamentos.tsx:51-85`,
`src/components/data-table.tsx`, `src/lib/colunas-lancamento.tsx` — lidos em 2026-10-17.
