import type { Despesa } from '@/types/lancamento'

export interface GrupoParcelamento {
  parcelamentoId: string
  descricao: string
  totalParcelas: number
  parcelasPagas: number
  valorTotal: number
  valorPago: number
  valorFalta: number
}

export function agruparParcelamentos(despesas: Despesa[]): GrupoParcelamento[] {
  const grupos = new Map<string, Despesa[]>()

  for (const despesa of despesas) {
    if (!despesa.parcelamentoId) continue
    const grupo = grupos.get(despesa.parcelamentoId) ?? []
    grupo.push(despesa)
    grupos.set(despesa.parcelamentoId, grupo)
  }

  return Array.from(grupos.entries()).map(([parcelamentoId, parcelas]) => {
    const valorTotal = parcelas.reduce((soma, p) => soma + p.valor, 0)
    const valorPago = parcelas.filter((p) => p.paga).reduce((soma, p) => soma + p.valor, 0)

    return {
      parcelamentoId,
      descricao: parcelas[0].descricao,
      totalParcelas: parcelas[0].totalParcelas ?? parcelas.length,
      parcelasPagas: parcelas.filter((p) => p.paga).length,
      valorTotal: Math.round(valorTotal * 100) / 100,
      valorPago: Math.round(valorPago * 100) / 100,
      valorFalta: Math.round((valorTotal - valorPago) * 100) / 100,
    }
  })
}
