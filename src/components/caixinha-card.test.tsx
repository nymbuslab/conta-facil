import { describe, expect, it } from 'vitest'

import { renderWithProviders } from '@/test/test-utils'

import { CaixinhaCard } from './caixinha-card'

describe('CaixinhaCard', () => {
  it('mostra o nome e o valor guardado', () => {
    const { getByText } = renderWithProviders(
      <CaixinhaCard
        caixinha={{ id: '1', nome: 'Viagem', valorGuardado: 2400, meta: 6000 }}
        onDepositar={() => {}}
        onResgatar={() => {}}
        onExcluir={() => {}}
      />,
    )

    expect(getByText('Viagem')).toBeInTheDocument()
    expect(getByText('R$ 2.400,00')).toBeInTheDocument()
  })

  it('a barra de progresso reflete 40% quando guardado 2400 de meta 6000', () => {
    const { container } = renderWithProviders(
      <CaixinhaCard
        caixinha={{ id: '1', nome: 'Viagem', valorGuardado: 2400, meta: 6000 }}
        onDepositar={() => {}}
        onResgatar={() => {}}
        onExcluir={() => {}}
      />,
    )

    const barra = container.querySelector('[data-progresso]')
    expect(barra).toHaveStyle({ width: '40%' })
  })
})
