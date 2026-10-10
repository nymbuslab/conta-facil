# Contextos de estado atuais (lançamentos e caixinhas)

## Contrato de entrada

- `LancamentosProvider` (`src/state/lancamentos-context.tsx:66-148`) nasce com
  `lancamentosIniciais` (mock, `src/lib/mock-data.ts`) em `useState`. Expõe `adicionarReceita`,
  `adicionarDespesa` e `marcarComoPaga`, todas síncronas e sem retorno de erro — só fazem
  `return` silencioso quando `parseValorMonetario` devolve `null`.
- `CaixinhasProvider` (`src/state/caixinhas-context.tsx:30-104`) nasce com array vazio. Expõe
  `criarCaixinha`, `depositar`, `resgatar`, `excluirCaixinha` — as duas últimas retornam
  `{ sucesso: boolean, erro?: string }` em vez de lançar exceção.
- Os dois contextos são montados em `src/routes/__root.tsx:9-17`, envolvendo toda a árvore de
  rotas — `LancamentosProvider` por fora, `CaixinhasProvider` por dentro.

## Contrato de saída

- `useLancamentos()` devolve `{ lancamentos, receitas, despesas, saldoReceita, saldoDespesa,
  adicionarReceita, adicionarDespesa, marcarComoPaga }` (`lancamentos-context.tsx:8-17`).
- `useCaixinhas()` devolve `{ caixinhas, totalGuardado, criarCaixinha, depositar, resgatar,
  excluirCaixinha }` (`caixinhas-context.tsx:11-18`).
- Schemas zod de validação de formulário (fonte da verdade dos campos obrigatórios):
  `receitaFormSchema`, `despesaFormSchema` em `src/types/lancamento.ts:34-71`;
  `criarCaixinhaSchema`, `movimentarCaixinhaSchema` em `src/types/caixinha.ts:15-22`.
- Tipos de domínio: `Receita { id, tipo: 'receita', dataEmissao, descricao, valor }`,
  `Despesa { id, tipo: 'despesa', descricao, valor, vencimento, paga, parcelamentoId,
  parcelaAtual, totalParcelas }` (`types/lancamento.ts:78-96`); `Caixinha { id, nome,
  valorGuardado, meta }` (`types/caixinha.ts:27-32`).

## Limites e cotas

- `id` é gerado no cliente via `Math.random().toString(36).slice(2, 10)` — não é um UUID nem
  vem de sequência de banco; qualquer schema Postgres precisa decidir a estratégia de chave
  primária (reaproveitar esse formato, trocar por `uuid`/serial, etc.).
- Valores monetários são armazenados como `number` em reais (não centavos) no estado React, com
  arredondamento manual (`arredondar`, `Math.round(valor * 100) / 100`) a cada operação — uma
  tabela Postgres provavelmente quer `integer` em centavos ou `numeric`, o que muda o contrato
  de entrada/saída se a migração não for cuidadosa.

## Erros conhecidos e tratamento

- `adicionarReceita`/`adicionarDespesa` falham silenciosamente (`return` sem efeito) quando o
  valor não parseia — não há canal de erro visível para quem chama a função além do que o
  formulário já validou antes de chamar.
- `depositar`/`resgatar` são os únicos dois métodos do app inteiro com retorno de erro
  estruturado (`ResultadoMovimentacao`) — é o padrão mais próximo de "contrato de erro" que
  existe hoje no código, caso a integração precise de um formato consistente para erros de API.

## Riscos para a nossa implementação

- Qualquer migração para Neon precisa decidir se `useLancamentos`/`useCaixinhas` continuam com a
  MESMA assinatura (trocando só a implementação interna de `useState` para chamadas à API) ou se
  os componentes que os consomem também mudam — a primeira opção é a que o `CLAUDE.md` já
  registrou como objetivo ("mantendo a mesma interface de mutação já usada pelos componentes",
  `ROADMAP.md`).
- `src/state/lancamentos-context.tsx` expõe hoje um campo interno (ver assinatura em
  `lancamentos-context.tsx:12-13`, `saldoReceita`/`saldoDespesa`) que o `FECHAMENTO.md` da
  feature `navegacao-inferior` já registrou como dívida técnica (saldo sem descontar Caixinhas,
  não usado por nenhuma tela) — vale decidir na F2 se essa limpeza entra no escopo desta feature
  ou continua em Próximos Passos separada.
- As mutações são 100% síncronas hoje; qualquer chamada real a Postgres/Data API introduz
  latência e possibilidade de falha de rede que o contrato atual (void, sem Promise) não modela.

## Fonte

`src/state/lancamentos-context.tsx`, `src/state/caixinhas-context.tsx`,
`src/types/lancamento.ts`, `src/types/caixinha.ts`, `src/routes/__root.tsx` — acessado em
2026-10-10.
`docs/sprintx/features/navegacao-inferior/FECHAMENTO.md` — acessado em 2026-10-10.
