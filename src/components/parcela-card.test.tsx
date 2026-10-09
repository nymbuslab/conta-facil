import { describe, expect, it } from 'vitest'

import { renderWithProviders } from '@/test/test-utils'

import { ParcelaCard } from './parcela-card'

describe('ParcelaCard', () => {
  it('mostra descricao, badge, total, pago e falta', () => {
    const { getByText } = renderWithProviders(
      <ParcelaCard
        descricao="Notebook"
        totalParcelas={12}
        parcelasPagas={3}
        valorTotal={1200}
        valorPago={300}
        valorFalta={900}
      />,
    )

    expect(getByText('Notebook')).toBeInTheDocument()
    expect(getByText('3/12')).toBeInTheDocument()
    expect(getByText('R$ 1.200,00')).toBeInTheDocument()
    expect(getByText('R$ 300,00')).toBeInTheDocument()
    expect(getByText('R$ 900,00')).toBeInTheDocument()
  })
})
