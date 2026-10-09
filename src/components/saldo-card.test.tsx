import { describe, expect, it } from 'vitest'

import { renderWithProviders } from '@/test/test-utils'

import { SaldoCard } from './saldo-card'

describe('SaldoCard — Guardado', () => {
  it('mostra o titulo Guardado e o valor formatado', () => {
    const { getByText } = renderWithProviders(<SaldoCard titulo="Guardado" valor={1500} />)
    expect(getByText('Guardado')).toBeInTheDocument()
    expect(getByText('R$ 1.500,00')).toBeInTheDocument()
  })
})
