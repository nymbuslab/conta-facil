# Frontend — `LancamentosProvider` (`src/state/lancamentos-context.tsx`)

## Contrato de entrada

Funções expostas hoje pelo contexto (`LancamentosContextValue`, `lancamentos-context.tsx:45-67`):
`receitas`, `despesas`, `saldoReceita`, `saldoDespesa`, `totalPago`, `adicionarReceita`,
`adicionarDespesa`, `marcarComoPaga`, mais os de paginação/filtro. Não existem `editarReceita`,
`editarDespesa` nem `excluirLancamento`.

- `adicionarReceita`/`adicionarDespesa` (`lancamentos-context.tsx:366-401`): convertem o valor
  digitado (string pt-BR) para centavos, chamam `clienteAtual.postIdempotente('/lancamentos', ...)`,
  atualizam a lista local só se o item bater nos filtros atuais (`bateFiltros`), e chamam
  `sincronizarResumo()` ao final (ignorando erro do resumo — comentário em
  `lancamentos-context.tsx:360-363`: "cosmético, próxima recarga corrige").
- `marcarComoPaga` (`lancamentos-context.tsx:403-425`): **otimista com rollback** — atualiza
  `paga`/`pagoEm` local antes da resposta do servidor, reverte pro estado anterior em caso de
  erro e relança a exceção pro chamador (o diálogo mostra o erro). Também chama
  `invalidarParcelamentos()` ao final, porque os agregados de parcelamento podem mudar.

## Contrato de saída

Toda mutação devolve `Promise<void>` (exceto `adicionarReceita`/`Despesa`, que não devolvem o
criado — quem chama só confia no `await`). Erros são `ApiError` (`src/lib/api-client.ts`),
tratados por quem chama via `mensagemErroApi(falha, 'mensagem padrão')`.

## Limites e cotas

Não se aplica.

## Erros conhecidos e tratamento

`mensagemErroApi` (`src/lib/api-client.ts`) mapeia `401`/`403` para "Sua sessão expirou..." e
`TypeError` (rede) para aviso de conexão — usado em todo `catch` de mutação na UI
(`confirmar-pagamento-dialog.tsx`, `lancamento-modal.tsx`).

## Riscos para a nossa implementação

- Uma função `editarDespesa`/`editarReceita` nova provavelmente precisa do mesmo padrão
  otimista de `marcarComoPaga` (UI responde na hora, reverte em falha) — é o padrão já
  estabelecido pra mutação financeira no projeto (`CLAUDE.md`, "Feedback de operação
  assíncrona").
- `excluirCaixinha` (`src/state/caixinhas-context.tsx:213-...`) é o único precedente de
  **exclusão** otimista no projeto — remove da lista local na hora, some, reverte reinserindo
  na posição original em caso de falha. Um `excluirLancamento` novo deveria seguir o mesmo
  formato, não inventar outro.
- Editar o `valor` de uma receita/despesa muda `saldoReceita`/`saldoDespesa`/`totalPago`
  (calculados via `sincronizarResumo`, que já existe e é reusável) — mas só depois do
  `await`, então há uma janela onde a lista mostra o valor novo e os cards do topo ainda
  mostram o resumo antigo, a menos que a sincronização também seja otimista.

## Fonte

`src/state/lancamentos-context.tsx:45-67,360-425`, `src/state/caixinhas-context.tsx:213-230`,
`src/lib/api-client.ts` — lidos em 2026-10-17.
