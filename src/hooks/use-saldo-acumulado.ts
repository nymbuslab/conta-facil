import { useCaixinhas } from '@/state/caixinhas-context'

function arredondar(valor: number) {
  return Math.round(valor * 100) / 100
}

/** Combina os totais de receita e despesa do periodo (ja somados pela Function, filtrados pelo
 * mes vigente) e desconta o total guardado nas caixinhas, que e um saldo corrido e nao entra no
 * filtro de periodo. */
export function useSaldoAcumulado(saldoReceita: number, saldoDespesa: number) {
  const { totalGuardado } = useCaixinhas()

  const saldoAcumulado = arredondar(saldoReceita - saldoDespesa - totalGuardado)

  return { saldoReceita, saldoDespesa, totalGuardado, saldoAcumulado }
}
