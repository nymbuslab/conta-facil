import { describe, expect, it } from 'vitest'

import { formatarMesAno } from '@/lib/datas'
import { perfilMock } from '@/lib/perfil-mock'
import { renderWithProviders } from '@/test/test-utils'

import { Header } from './header'

describe('Header', () => {
  it('mostra o nome do perfil e o mês vigente por extenso', () => {
    const { getByText } = renderWithProviders(<Header />)
    expect(getByText(perfilMock.nome)).toBeInTheDocument()
    expect(getByText(formatarMesAno())).toBeInTheDocument()
  })
})
