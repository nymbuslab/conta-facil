# Domínio atual de lançamentos — e ausência do conceito "Parcelas"

## Contrato de entrada

`Receita` (`src/types/lancamento.ts`): `id`, `tipo: 'receita'`, `dataEmissao`, `descricao`, `valor`.
`Despesa` (`src/types/lancamento.ts`): mesmos campos de `Receita` + `vencimento` (data de vencimento).

Não existe nenhum campo de parcelamento (ex. `numeroParcela`, `totalParcelas`, `parcelaAtual`) em nenhum dos dois tipos.

## Contrato de saída

`useLancamentos()` (`src/state/lancamentos-context.tsx`) expõe `lancamentos`, `receitas`, `despesas`, `saldoReceita`, `saldoDespesa`, `saldoAcumulado`, `adicionarReceita`, `adicionarDespesa`. Não existe nenhuma função ou seletor relacionado a "parcelas".

## Limites e cotas

NÃO DOCUMENTADO.

## Erros conhecidos e tratamento

NÃO DOCUMENTADO.

## Riscos para a nossa implementação

- Buscado em todo `src/` por "parcela", "Parcela", "relatorio", "Relatório" e "perfil"/"Perfil" (grep literal) — **nenhuma ocorrência encontrada**. O termo "Parcelas" citado pelo usuário para a segunda aba não corresponde a nenhum conceito já modelado no código; o único campo próximo é `vencimento` de `Despesa`, que hoje é só uma data livre, sem relação com parcelamento.
- Sem definição do que a aba "Parcelas" deve mostrar (ex.: lista de despesas com vencimento futuro? despesas agrupadas por mês? um conceito de compra parcelada ainda não existente no modelo de dados?), não há como declarar task de implementação para o conteúdo dela — só para o item de navegação em si.
- O mesmo vale para "Relatórios" e "Perfil": nenhum conteúdo foi especificado pelo usuário até aqui.

## Fonte

`src/types/lancamento.ts` — acessado em 2026-10-08
`src/state/lancamentos-context.tsx` — acessado em 2026-10-08
Busca literal (grep) por `parcela|Parcela|relatorio|Relatório|perfil|Perfil` em `src/` — nenhuma ocorrência — acessado em 2026-10-08
