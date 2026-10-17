import { act, render, waitFor, type RenderOptions } from '@testing-library/react'
import { createMemoryHistory, createRootRoute, createRouter, RouterProvider } from '@tanstack/react-router'
import type { ReactElement } from 'react'
import { describe, expect, it, vi } from 'vitest'

import type { ApiClient } from '@/lib/api-client'
import { criarClienteCaixinhasTeste, criarClienteLancamentosTeste } from '@/test/api-client-mocks'
import { criarClienteAuthTeste } from '@/test/test-utils'
import { AuthProvider } from '@/state/auth-context'
import { CaixinhasProvider } from '@/state/caixinhas-context'
import { LancamentosProvider } from '@/state/lancamentos-context'
import { useCaixinhas } from '@/state/caixinhas-context'

import { TelaPrincipal } from './index'

/** Mesma composicao de renderWithProviders, com um router minimo por cima: os cards do
 * dashboard usam <Link> (para "Ver mais"), que exige contexto de roteador para renderizar —
 * so este arquivo precisa dele, por isso fica local em vez de mudar o helper compartilhado. */
function renderDashboard(
  ui: ReactElement,
  options: RenderOptions & { clienteLancamentos?: ApiClient; clienteCaixinhas?: ApiClient } = {},
) {
  const { clienteLancamentos, clienteCaixinhas, ...renderOptions } = options
  const rootRoute = createRootRoute({
    component: () => (
      <AuthProvider cliente={criarClienteAuthTeste()}>
        <LancamentosProvider cliente={clienteLancamentos ?? criarClienteLancamentosTeste()}>
          <CaixinhasProvider cliente={clienteCaixinhas ?? criarClienteCaixinhasTeste()}>{ui}</CaixinhasProvider>
        </LancamentosProvider>
      </AuthProvider>
    ),
  })
  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  return render(<RouterProvider router={router} />, renderOptions)
}

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
          if (caixinhas[0]) depositar(caixinhas[0].id, { valor: '500,00', origem: 'saldo_atual' })
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
    const { getByText, getByRole, findByRole } = renderDashboard(<Harness />)

    const botaoCriar = await findByRole('button', { name: 'criar caixinha' })
    act(() => {
      botaoCriar.click()
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
    const { getByText, getByRole } = renderDashboard(<Harness />)

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

describe('TelaPrincipal — dashboard', () => {
  it('mostra os cards de resumo, os dois cards novos, o FAB de registrar, mas sem busca', async () => {
    const { getByText, getByRole, queryByLabelText } = renderDashboard(<TelaPrincipal />)

    await waitFor(() => {
      expect(getByText('Receita')).toBeInTheDocument()
      expect(getByText('Despesa')).toBeInTheDocument()
      expect(getByText('Guardado')).toBeInTheDocument()
      expect(getByText('Contas vencendo')).toBeInTheDocument()
      expect(getByText('Últimos lançamentos')).toBeInTheDocument()
    })

    expect(getByRole('button', { name: /Registrar lançamento/i })).toBeInTheDocument()
    expect(queryByLabelText('Buscar lançamentos')).not.toBeInTheDocument()
  })

  it('dispara o carregamento de contas vencendo e ultimos lancamentos no mount', async () => {
    const cliente = criarClienteLancamentosTeste()
    const get = vi.spyOn(cliente, 'get')

    renderDashboard(<TelaPrincipal />, { clienteLancamentos: cliente })

    await waitFor(() => {
      expect(get).toHaveBeenCalledWith(expect.stringContaining('/lancamentos/vencendo'))
      expect(get).toHaveBeenCalledWith(expect.stringContaining('/lancamentos/recentes'))
    })
  })
})

describe('TelaPrincipal - estados remotos', () => {
  it('mostra carregamento enquanto a consulta inicial nao resolve', async () => {
    const cliente = {
      ...criarClienteLancamentosTeste(),
      get: vi.fn(() => new Promise(() => {})),
    } as unknown as ApiClient

    const { findByRole, queryByText } = renderDashboard(<TelaPrincipal />, {
      clienteLancamentos: cliente,
    })

    expect(await findByRole('status', { name: 'Carregando dados' })).toBeInTheDocument()
    expect(queryByText('Contas vencendo')).not.toBeInTheDocument()
  })

  it('mostra erro e tenta carregar novamente', async () => {
    const base = criarClienteLancamentosTeste()
    let falhouPrincipal = false
    const get = vi.fn(async (caminho: string) => {
      const ehListaPrincipal = !caminho.startsWith('/lancamentos/vencendo') && !caminho.startsWith('/lancamentos/recentes')
      if (ehListaPrincipal && !falhouPrincipal) {
        falhouPrincipal = true
        throw new Error('Function indisponivel')
      }
      return base.get(caminho)
    })
    const cliente = { ...base, get } as unknown as ApiClient
    const { findByRole, getByRole, findByText } = renderDashboard(<TelaPrincipal />, {
      clienteLancamentos: cliente,
    })

    expect(await findByRole('alert')).toHaveTextContent('Não foi possível carregar seus dados.')
    getByRole('button', { name: 'Tentar novamente' }).click()

    expect(await findByText('Contas vencendo')).toBeInTheDocument()
  })
})
