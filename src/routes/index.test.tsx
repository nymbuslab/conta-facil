import { act, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { ApiClient } from '@/lib/api-client'
import { criarClienteLancamentosTeste } from '@/test/api-client-mocks'
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
      <span data-testid="total-caixinhas">{caixinhas.length}</span>
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
    await waitFor(() => expect(getByText('1', { selector: '[data-testid="total-caixinhas"]' })).toBeInTheDocument())
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
    await waitFor(() => expect(getByText('1', { selector: '[data-testid="total-caixinhas"]' })).toBeInTheDocument())
    act(() => {
      getByRole('button', { name: 'depositar 500' }).click()
    })

    await waitFor(() => {
      expect(getByText('R$ 2.830,50')).toBeInTheDocument()
    })
  })
})

describe('TelaPrincipal - estados remotos', () => {
  it('mostra carregamento enquanto a consulta inicial nao resolve', () => {
    const cliente = {
      ...criarClienteLancamentosTeste(),
      get: vi.fn(() => new Promise(() => {})),
    } as unknown as ApiClient

    const { getByRole, queryByText } = renderWithProviders(<TelaPrincipal />, {
      clienteLancamentos: cliente,
    })

    expect(getByRole('status', { name: 'Carregando dados' })).toBeInTheDocument()
    expect(queryByText('Nenhuma receita lançada ainda.')).not.toBeInTheDocument()
  })

  it('mostra erro e tenta carregar novamente', async () => {
    const get = vi.fn()
      .mockRejectedValueOnce(new Error('Function indisponivel'))
      .mockResolvedValueOnce([])
    const cliente = { ...criarClienteLancamentosTeste(), get } as unknown as ApiClient
    const { findByRole, getByRole, findByText } = renderWithProviders(<TelaPrincipal />, {
      clienteLancamentos: cliente,
    })

    expect(await findByRole('alert')).toHaveTextContent('Não foi possível carregar seus dados.')
    getByRole('button', { name: 'Tentar novamente' }).click()

    expect(await findByText('Nenhuma receita lançada ainda.')).toBeInTheDocument()
    expect(get).toHaveBeenCalledTimes(2)
  })
})
