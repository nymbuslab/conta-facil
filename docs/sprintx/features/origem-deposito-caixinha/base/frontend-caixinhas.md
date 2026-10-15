# Frontend — contexto, modal e tipos de caixinha

## Contrato de entrada

- `src/types/caixinha.ts:20-22` — `movimentarCaixinhaSchema = z.object({ valor: valorSchema })`,
  formulário com um único campo de valor monetário em texto (`CampoValor`), validado por
  `parseValorMonetario` (`src/lib/formatters`, NÃO DOCUMENTADO nesta ingestão).
- `src/components/movimentar-caixinha-modal.tsx:22-26` — `MovimentarCaixinhaModalProps`:
  `{ caixinha: Caixinha | null, tipo: 'depositar' | 'resgatar', onOpenChange }`. Um único modal
  serve os dois fluxos (depósito e resgate), diferenciados pelo prop `tipo`. Não há campo de
  origem do valor no formulário atual.
- `src/state/caixinhas-context.tsx:176-206` — `movimentar(id, dados, tipo)` chama
  `clienteAtual.postIdempotente(`/caixinhas/${id}/${tipo}`, { valor: ... })` e, no sucesso,
  ajusta `totalGuardado` local pelo delta (`caixinha.valorGuardado - anterior.valorGuardado`,
  `caixinhas-context.tsx:190`) — mantém o estado local em sincronia sem recarregar a lista
  inteira.

## Contrato de saída

- `useCaixinhas()` expõe `totalGuardado: number` (já convertido de centavos para reais,
  `caixinhas-context.tsx:106`), consumido por `useSaldoAcumulado` (ver
  `base/calculo-saldo.md`) e pela tela de caixinhas.
- `depositar`/`resgatar` devolvem `ResultadoMovimentacao = { sucesso: boolean, erro?: string }`
  (`caixinhas-context.tsx:19-22`), consumido pelo modal para mostrar erro inline.

## Limites e cotas

NÃO DOCUMENTADO.

## Erros conhecidos e tratamento

`mensagemErroApi` (`src/lib/api-client.ts`, NÃO DOCUMENTADO em detalhe nesta ingestão) mapeia
falhas de rede/sessão para mensagem amigável; erro de validação do servidor (ex.: saldo
insuficiente) aparece como `resultado.erro` no modal (`movimentar-caixinha-modal.tsx:43-46`).

## Riscos para a nossa implementação

- O modal (`movimentar-caixinha-modal.tsx`) é compartilhado entre depositar e resgatar. Se a
  escolha de origem ("saldo atual" vs. "dinheiro de fora") só fizer sentido para depósito, o
  formulário precisa condicionar o campo novo a `tipo === 'depositar'`.
- `ajustarTotal` no contexto (`caixinhas-context.tsx:160-163`) hoje assume que **todo** delta de
  `valorGuardado` deve refletir em `totalGuardado`, que por sua vez é sempre descontado do saldo
  do mês (`useSaldoAcumulado`). Se a origem do depósito mudar esse comportamento, o ajuste de
  `totalGuardado` (ou a forma como `useSaldoAcumulado` o consome) precisa diferenciar os dois
  casos — não é só UI, é o estado que mantém os dois números em sincronia sem recarregar.

## Fonte

`src/state/caixinhas-context.tsx`, `src/components/movimentar-caixinha-modal.tsx`,
`src/types/caixinha.ts` (lidos integralmente) — acessado em 2026-10-15
