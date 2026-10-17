# Estrutura de parcelamento

## Contrato de entrada

Não existe tabela própria de "parcelamento" — um parcelamento é só um grupo de linhas em
`lancamentos` que compartilham o mesmo `parcelamentoId` (uuid gerado em
`src/functions/api/lancamentos.ts:389`, dentro de `prepararLancamentos`). Cada parcela carrega
`parcelaAtual` (1-based) e `totalParcelas` (igual em todas as linhas do grupo,
`lancamentos.ts:391-400`). O valor de cada parcela é o mesmo informado pelo usuário (não é o
total dividido — decisão já documentada em `CLAUDE.md`, "Parcelamento").

## Contrato de saída

`GET /lancamentos/parcelamentos` agrega por `parcelamentoId`
(`lancamentos.ts:209-234`): `descricao` = `min(descricao)`, `totalParcelas` = `max(totalParcelas)`,
`parcelasPagas` = `count(*) filter (where paga)`, `valorTotal`/`valorPago` = `sum(valor [filter paga])`.
Tudo calculado on-the-fly a cada consulta — não há valor "guardado" que precise ser mantido em
sincronia manualmente.

## Limites e cotas

`quantidadeParcelas` entre 2 e 360 (`src/types/lancamento.ts:48-58`, validação zod no form; o
schema do backend em `lancamentos.ts:38` espelha o mesmo range).

## Erros conhecidos e tratamento

NÃO DOCUMENTADO (não há rota hoje que edite/exclua uma parcela isolada).

## Riscos para a nossa implementação

- `totalParcelas` é um inteiro **copiado** em cada linha, não calculado — excluir uma parcela
  do meio do grupo deixa as linhas irmãs com `totalParcelas` desatualizado (ex.: 3 parcelas,
  exclui a 2ª, as outras duas continuam dizendo "de 3"), a menos que a exclusão também
  atualize as irmãs.
- Decisão em aberto para a F2: editar/excluir atua só na parcela clicada, ou precisa oferecer
  "aplicar a todas as parcelas futuras"? A tela Parcelas trata o grupo como unidade visual; a
  tela Extrato trata cada parcela como linha independente — a feature toca as duas.

## Fonte

`src/functions/api/lancamentos.ts:209-234,361-401`, `src/types/lancamento.ts:40-58`,
`CLAUDE.md` (seção "Parcelamento") — lidos em 2026-10-17.
