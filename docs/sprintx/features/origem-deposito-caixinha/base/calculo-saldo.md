# Cálculo do saldo acumulado

## Contrato de entrada

`src/hooks/use-saldo-acumulado.ts:10` — `useSaldoAcumulado(saldoReceita: number, saldoDespesa:
number)`. Lê `totalGuardado` direto de `useCaixinhas()` (`src/state/caixinhas-context.tsx`), não
recebe por parâmetro.

```ts
export function useSaldoAcumulado(saldoReceita: number, saldoDespesa: number) {
  const { totalGuardado } = useCaixinhas()
  const saldoAcumulado = arredondar(saldoReceita - saldoDespesa - totalGuardado)
  return { saldoReceita, saldoDespesa, totalGuardado, saldoAcumulado }
}
```

`saldoReceita` e `saldoDespesa` vêm agregados do servidor, já filtrados pelo mês vigente
(`/lancamentos/resumo`, NÃO DOCUMENTADO nesta ingestão — ver `PROGRESSO.md`/`CLAUDE.md` do
projeto). `totalGuardado` é um saldo corrido (não filtrado por mês) — comentário do próprio
código confirma: *"desconta o total guardado nas caixinhas, que é um saldo corrido e não entra no
filtro de período"* (`use-saldo-acumulado.ts:7-9`).

## Contrato de saída

`{ saldoReceita, saldoDespesa, totalGuardado, saldoAcumulado }` — `saldoAcumulado` é o número
mostrado como saldo do mês na tela Início (`src/routes/index.tsx`, consumidor confirmado por
`grep`, conteúdo não lido nesta ingestão).

## Limites e cotas

NÃO DOCUMENTADO.

## Erros conhecidos e tratamento

Não há tratamento de erro aqui — é cálculo puro sobre números já carregados; falha de rede é
tratada antes, no contexto.

## Riscos para a nossa implementação

Este é o ponto exato que a feature precisa mudar: hoje `totalGuardado` é tratado como um bloco
único, sempre subtraído. Se a decisão da F2 for diferenciar por origem do depósito, este hook (ou
o `totalGuardado` que ele consome) precisa de uma segunda grandeza — por exemplo "quanto do total
guardado veio do saldo controlado" — para continuar correto. Teste existente que trava o
comportamento atual: `src/hooks/use-saldo-acumulado.test.tsx` (deposita R$ 500 numa caixinha nova
e espera o saldo cair exatamente R$ 500) — qualquer mudança de comportamento por padrão quebra
esse teste de propósito, e ele precisa ser atualizado junto com a decisão de produto.

## Fonte

`src/hooks/use-saldo-acumulado.ts`, `src/hooks/use-saldo-acumulado.test.tsx` (lidos
integralmente) — acessado em 2026-10-15
