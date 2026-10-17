import { createMemoryHistory, createRootRoute, createRoute, createRouter, RouterProvider } from '@tanstack/react-router'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { CardUltimosLancamentos } from './card-ultimos-lancamentos'
import type { Lancamento } from '@/types/lancamento'

function renderizar(itens: Lancamento[]) {
  const rootRoute = createRootRoute({ component: () => <CardUltimosLancamentos itens={itens} /> })
  const extratoRoute = createRoute({ getParentRoute: () => rootRoute, path: '/extrato', component: () => <p>Pagina Extrato</p> })
  const router = createRouter({
    routeTree: rootRoute.addChildren([extratoRoute]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  return render(<RouterProvider router={router} />)
}

const receita: Lancamento = {
  id: 'r1', tipo: 'receita', descricao: 'Salário', valor: 50, dataEmissao: '2026-10-17',
}
const despesa: Lancamento = {
  id: 'd1', tipo: 'despesa', descricao: 'Internet', valor: 0.9, vencimento: '2026-10-20',
  paga: false, pagoEm: null, parcelamentoId: null, parcelaAtual: null, totalParcelas: null,
}

describe('CardUltimosLancamentos', () => {
  it('mostra estado vazio sem link ver mais quando nao ha lancamentos', async () => {
    renderizar([])

    expect(await screen.findByText('Nenhum lançamento registrado ainda.')).toBeInTheDocument()
    expect(screen.queryByText('Ver mais')).not.toBeInTheDocument()
  })

  it('lista receita e despesa coloridas pelo sinal', async () => {
    renderizar([receita, despesa])

    const linhaReceita = await screen.findByText('Salário')
    const linhaDespesa = screen.getByText('Internet')
    expect(linhaReceita).toBeInTheDocument()
    expect(linhaDespesa).toBeInTheDocument()
    expect(screen.getByText('R$ 50,00')).toHaveClass('text-success')
    expect(screen.getByText('R$ 0,90')).toHaveClass('text-destructive')
    expect(screen.getByText('Ver mais')).toBeInTheDocument()
  })
})
