import { createMemoryHistory, createRootRoute, createRoute, createRouter, RouterProvider } from '@tanstack/react-router'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { CardContasVencendo } from './card-contas-vencendo'
import type { Despesa } from '@/types/lancamento'

function renderizar(itens: Despesa[]) {
  const rootRoute = createRootRoute({ component: () => <CardContasVencendo itens={itens} /> })
  const extratoRoute = createRoute({ getParentRoute: () => rootRoute, path: '/extrato', component: () => <p>Pagina Extrato</p> })
  const router = createRouter({
    routeTree: rootRoute.addChildren([extratoRoute]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  return render(<RouterProvider router={router} />)
}

const despesa = (id: string, descricao: string, vencimento: string): Despesa => ({
  id, tipo: 'despesa', descricao, valor: 100, vencimento, paga: false,
  parcelamentoId: null, parcelaAtual: null, totalParcelas: null,
})

describe('CardContasVencendo', () => {
  it('mostra estado vazio sem link ver mais quando nao ha despesas', async () => {
    renderizar([])

    expect(await screen.findByText('Nenhuma despesa vencendo nos próximos dias.')).toBeInTheDocument()
    expect(screen.queryByText('Ver mais')).not.toBeInTheDocument()
  })

  it('lista as despesas recebidas com valor em vermelho', async () => {
    renderizar([despesa('d1', 'Luz', '2026-10-19'), despesa('d2', 'Água', '2026-10-20')])

    expect(await screen.findByText('Luz')).toBeInTheDocument()
    expect(screen.getByText('Água')).toBeInTheDocument()
    expect(screen.getByText('Ver mais')).toBeInTheDocument()
  })

  it('o link ver mais leva ao Extrato na aba despesas', async () => {
    renderizar([despesa('d1', 'Luz', '2026-10-19')])

    const link = await screen.findByText('Ver mais')
    expect(link.closest('a')).toHaveAttribute('href', '/extrato?aba=despesa')
  })
})
