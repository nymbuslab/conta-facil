import { describe, expect, it } from 'vitest'

import { renderWithProviders } from './test-utils'

describe('renderWithProviders', () => {
  it('renderiza um componente simples e permite encontrar seu texto', () => {
    const { getByText } = renderWithProviders(<div>ok</div>)
    expect(getByText('ok')).toBeInTheDocument()
  })
})
