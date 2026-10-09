import { useCaixinhas } from '@/state/caixinhas-context'
import type { Despesa, Receita } from '@/types/lancamento'

function arredondar(valor: number) {
  return Math.round(valor * 100) / 100
}

/** Soma receitas e despesas recebidas (já filtradas pelo chamador, ex: mês vigente) e desconta
 * o total guardado nas caixinhas, que é um saldo corrido e não entra no filtro de período. */
export function useSaldoAcumulado(receitas: Receita[], despesas: Despesa[]) {
  const { totalGuardado } = useCaixinhas()

  const saldoReceita = arredondar(receitas.reduce((soma, r) => soma + r.valor, 0))
  const saldoDespesa = arredondar(despesas.reduce((soma, d) => soma + d.valor, 0))
  const saldoAcumulado = arredondar(saldoReceita - saldoDespesa - totalGuardado)

  return { saldoReceita, saldoDespesa, totalGuardado, saldoAcumulado }
}
