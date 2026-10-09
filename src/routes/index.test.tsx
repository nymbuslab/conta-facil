import { act, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithProviders } from '@/test/test-utils'
import { useCaixinhas } from '@/state/caixinhas-context'

import { TelaPrincipal } from './index'

function Harness() {
  const { criarCaixinha, depositar, caixinhas } = useCaixinhas()
  return (
    <>
      <button
        onClick={() => {
          criarCaixinha({ nome: 'Viagem', meta: '6.000,00' })
        }}
      >
        criar caixinha
      </button>
      <button
        onClick={() => {
          if (caixinhas[0]) depositar(caixinhas[0].id, { valor: '500,00' })
        }}
      >
        depositar 500
      </button>
      <TelaPrincipal />
    </>
  )
}

describe('TelaPrincipal — card Guardado e saldo com Caixinhas', () => {
  it('mostra o card Guardado com o total correto', async () => {
    const { getByText, getByRole } = renderWithProviders(<Harness />)

    act(() => {
      getByRole('button', { name: 'criar caixinha' }).click()
    })
    act(() => {
      getByRole('button', { name: 'depositar 500' }).click()
    })

    await waitFor(() => {
      expect(getByText('Guardado')).toBeInTheDocument()
      expect(getByText('R$ 500,00')).toBeInTheDocument()
    })
  })

  it('o saldo acumulado reflete o valor guardado em caixinhas', async () => {
    const { getByText, getByRole } = renderWithProviders(<Harness />)

    // saldo inicial sem caixinhas: receita 6450 - despesa 3119,5 = 3330,50
    await waitFor(() => expect(getByText('R$ 3.330,50')).toBeInTheDocument())

    act(() => {
      getByRole('button', { name: 'criar caixinha' }).click()
    })
    act(() => {
      getByRole('button', { name: 'depositar 500' }).click()
    })

    await waitFor(() => {
      expect(getByText('R$ 2.830,50')).toBeInTheDocument()
    })
  })
})
