# Vínculo `caixinha_movimentacoes` ↔ `lancamentos` (risco de desincronia)

## Contrato de entrada

Ao depositar numa caixinha com `origem: 'de_fora'`
(`src/functions/api/caixinhas.ts:132-161`), o repositório:
1. Cria uma receita via `criarLancamentoReceita` (`caixinhas.ts:137`), guardando o `id`
   retornado em `lancamentoId`.
2. Soma `valor` em `caixinhas.valorGuardado` (`caixinhas.ts:141-148`).
3. Insere uma linha em `caixinha_movimentacoes` com `lancamentoId` apontando pra essa receita
   (`caixinhas.ts:151-158`).

Depósito com `origem: 'saldo_atual'` e resgate (`caixinhas.ts:162-189`) não criam lançamento —
`lancamentoId: null`.

## Contrato de saída

Não se aplica (é fluxo interno, não endpoint próprio).

## Limites e cotas

NÃO DOCUMENTADO.

## Erros conhecidos e tratamento

Não existe, hoje, nenhuma consulta que vá de `lancamentos.id` até
`caixinha_movimentacoes.lancamentoId` (busca inversa) — o vínculo só é usado no sentido
caixinha → lançamento, nunca verificado a partir do lançamento.

## Riscos para a nossa implementação

- **Este é o risco central da feature.** Editar o `valor` dessa receita (ou excluí-la) sem
  tocar a `caixinha_movimentacoes`/`caixinhas.valorGuardado` correspondente quebra a premissa
  documentada em `CLAUDE.md` ("Origem do depósito na caixinha": "o depósito `de_fora` tem
  efeito líquido zero no saldo no momento em que acontece, porque a receita e o total guardado
  sobem juntos"). Editar só o lançamento desfaz esse equilíbrio sem avisar ninguém.
- Não há FK no banco (`schema-lancamentos.md`) — nada impede a exclusão no nível de banco;
  qualquer trava precisa ser escrita na aplicação (checar, antes de editar/excluir uma receita,
  se existe `caixinha_movimentacoes` com aquele `lancamentoId`).
- Decisão em aberto para a F2: bloquear edição/exclusão desse tipo de receita, ou permitir e
  propagar a mudança pra caixinha (reverter o depósito)? Qualquer uma das duas é válida, mas
  precisa ser escolhida — não dá pra ignorar.

## Fonte

`src/functions/api/caixinhas.ts:28-203`, `CLAUDE.md` (seção "Origem do depósito na
caixinha") — lidos em 2026-10-17.
