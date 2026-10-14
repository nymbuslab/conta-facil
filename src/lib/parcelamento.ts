/** Resumo de um parcelamento entregue pela Function (GET /lancamentos/parcelamentos). */
export interface GrupoParcelamento {
  parcelamentoId: string
  descricao: string
  totalParcelas: number
  parcelasPagas: number
  valorTotal: number
  valorPago: number
  valorFalta: number
}
