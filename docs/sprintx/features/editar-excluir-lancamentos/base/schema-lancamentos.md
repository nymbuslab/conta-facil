# Schema da tabela `lancamentos`

## Contrato de entrada

Tabela `lancamentos` definida em `src/db/schema.ts:19-45`. Colunas relevantes:
- `id` uuid, PK, `defaultRandom()`.
- `userId` uuid, not null.
- `tipo` enum `tipo_lancamento` (`'receita' | 'despesa'`), not null.
- `descricao` text, not null.
- `valor` integer, not null, em centavos (`check lancamentos_valor_positivo: valor > 0`).
- `dataEmissao` date (`mode: 'string'`), nullable.
- `vencimento` date (`mode: 'string'`), nullable.
- `paga` boolean, not null, default `false`.
- `pagoEm` date (`mode: 'string'`), nullable — coluna nova, adicionada nesta sessão
  (`drizzle/0004_pago_em.sql:1`), já aplicada em `production` e na branch `test`.
- `parcelamentoId` uuid, nullable — agrupa parcelas de um mesmo parcelamento (ver
  `parcelamento-estrutura.md`).
- `parcelaAtual` integer, nullable.
- `totalParcelas` integer, nullable.
- `criadoEm` / `atualizadoEm` timestamptz, not null, `defaultNow()`.

Nenhuma coluna desta tabela declara `.references()` no Drizzle — **não há foreign key real no
banco** entre `lancamentos` e `caixinha_movimentacoes` nem entre as próprias linhas de um
parcelamento. `parcelamentoId`/`lancamentoId` são uuids soltos; a consistência é só de
aplicação (`src/db/schema.ts` inteiro, nenhuma tabela usa `.references()`).

## Contrato de saída

Não se aplica (é definição de schema, não endpoint).

## Limites e cotas

NÃO DOCUMENTADO (não há limite de tamanho de descrição ou de valor além do check
`valor > 0`, `src/db/schema.ts:39`).

## Erros conhecidos e tratamento

Constraint `lancamentos_campos_por_tipo` (`src/db/schema.ts:40-43`): `receita` exige
`dataEmissao` preenchida e `vencimento` nulo; `despesa` exige o inverso. Qualquer update que
tente, por exemplo, trocar o tipo de um lançamento ou preencher os dois campos de data ao
mesmo tempo quebra essa constraint no banco (erro Postgres, não validação da aplicação).

## Riscos para a nossa implementação

- Editar `valor`, `vencimento`/`dataEmissao` de uma linha que também é referenciada por
  `caixinha_movimentacoes.lancamentoId` (ver `caixinha-movimentacoes-risco.md`) ou que faz
  parte de um parcelamento (ver `parcelamento-estrutura.md`) não tem nenhuma proteção do
  banco — a responsabilidade de manter a consistência é só da aplicação.
- Excluir uma linha com `pago_em`/`paga: true` não recalcula automaticamente nada que dependa
  dela (ex.: card "Total Pago" do Extrato, que soma via agregação a cada consulta — então uma
  exclusão por si só já reflete corretamente ali; o risco é só em `caixinha_movimentacoes`).

## Fonte

`src/db/schema.ts:19-45` e `drizzle/0004_pago_em.sql:1` — lido em 2026-10-17.
