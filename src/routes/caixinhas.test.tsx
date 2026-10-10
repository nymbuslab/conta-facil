import { act, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { ApiClient } from '@/lib/api-client'
import { criarClienteCaixinhasTeste } from '@/test/api-client-mocks'
import { renderWithProviders } from '@/test/test-utils'
import { useCaixinhas } from '@/state/caixinhas-context'

import { TelaCaixinhas } from './caixinhas'

function Harness() {
  const { criarCaixinha } = useCaixinhas()
  return (
    <>
      <button
        onClick={() => {
          criarCaixinha({ nome: 'Viagem', meta: '6.000,00' })
          criarCaixinha({ nome: 'Carro', meta: '20.000,00' })
        }}
      >
        criar caixinhas
      </button>
      <TelaCaixinhas />
    </>
  )
}

describe('TelaCaixinhas', () => {
  it('mostra um card por caixinha com nome e progresso', async () => {
    const { getByText, getByRole } = renderWithProviders(<Harness />)

    act(() => {
      getByRole('button', { name: 'criar caixinhas' }).click()
    })

    await waitFor(() => {
      expect(getByText('Viagem')).toBeInTheDocument()
      expect(getByText('Carro')).toBeInTheDocument()
    })
  })

  it('mostra um botao de Nova caixinha que abre o modal de criacao', async () => {
    const { getByRole, findByLabelText } = renderWithProviders(<Harness />)

    await waitFor(() => expect(getByRole('button', { name: 'Nova caixinha' })).toBeEnabled())
    act(() => {
      getByRole('button', { name: 'Nova caixinha' }).click()
    })

    expect(await findByLabelText('Nome')).toBeInTheDocument()
  })

  it('clicar em excluir abre a confirmacao e so remove o card apos confirmar', async () => {
    const { getByText, getByRole, queryByText, findByRole } = renderWithProviders(<Harness />)

    act(() => {
      getByRole('button', { name: 'criar caixinhas' }).click()
    })
    await waitFor(() => expect(getByText('Viagem')).toBeInTheDocument())

    act(() => {
      getByRole('button', { name: 'Excluir caixinha Viagem' }).click()
    })

    expect(await findByRole('heading', { name: 'Excluir caixinha?' })).toBeInTheDocument()

    act(() => {
      getByRole('button', { name: 'Excluir' }).click()
    })

    await waitFor(() => {
      expect(queryByText('Viagem')).not.toBeInTheDocument()
    })
  })

  it('cancelar a exclusao mantem o card', async () => {
    const { getByText, getByRole, findByRole, queryByRole } = renderWithProviders(<Harness />)

    act(() => {
      getByRole('button', { name: 'criar caixinhas' }).click()
    })
    await waitFor(() => expect(getByText('Viagem')).toBeInTheDocument())

    act(() => {
      getByRole('button', { name: 'Excluir caixinha Viagem' }).click()
    })
    expect(await findByRole('heading', { name: 'Excluir caixinha?' })).toBeInTheDocument()

    act(() => {
      getByRole('button', { name: 'Cancelar' }).click()
    })

    await waitFor(() => {
      expect(queryByRole('heading', { name: 'Excluir caixinha?' })).not.toBeInTheDocument()
    })
    expect(getByText('Viagem')).toBeInTheDocument()
  })
})

describe('TelaCaixinhas - estados remotos', () => {
  it('nao mostra o vazio antes da consulta terminar', () => {
    const cliente = {
      ...criarClienteCaixinhasTeste(),
      get: vi.fn(() => new Promise(() => {})),
    } as unknown as ApiClient
    const { getByRole, queryByText } = renderWithProviders(<TelaCaixinhas />, {
      clienteCaixinhas: cliente,
    })

    expect(getByRole('status', { name: 'Carregando dados' })).toBeInTheDocument()
    expect(queryByText('Nenhuma caixinha ainda.')).not.toBeInTheDocument()
  })
})
