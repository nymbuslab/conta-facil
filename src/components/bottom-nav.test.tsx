import { createMemoryHistory, createRootRoute, createRouter, RouterProvider } from '@tanstack/react-router'
import { render, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { BottomNav } from './bottom-nav'

function renderBottomNavAt(path: string) {
  const rootRoute = createRootRoute({ component: BottomNav })
  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: [path] }),
  })
  return render(<RouterProvider router={router} />)
}

describe('BottomNav', () => {
  it('mostra os 4 rotulos de navegacao', async () => {
    const { getByText } = renderBottomNavAt('/')
    await waitFor(() => {
      expect(getByText('Início')).toBeInTheDocument()
      expect(getByText('Parcelas')).toBeInTheDocument()
      expect(getByText('Caixinhas')).toBeInTheDocument()
      expect(getByText('Perfil')).toBeInTheDocument()
    })
  })

  it('marca o item Início como ativo quando o pathname e /', async () => {
    const { getByText } = renderBottomNavAt('/')
    await waitFor(() => {
      expect(getByText('Início').closest('a')).toHaveAttribute('aria-current', 'page')
      expect(getByText('Caixinhas').closest('a')).not.toHaveAttribute('aria-current', 'page')
    })
  })

  it('marca o item Caixinhas como ativo quando o pathname e /caixinhas', async () => {
    const { getByText } = renderBottomNavAt('/caixinhas')
    await waitFor(() => {
      expect(getByText('Caixinhas').closest('a')).toHaveAttribute('aria-current', 'page')
      expect(getByText('Início').closest('a')).not.toHaveAttribute('aria-current', 'page')
    })
  })
})
