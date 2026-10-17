import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { AuthProvider } from '@/state/auth-context'
import { criarClienteAuthTeste } from '@/test/test-utils'

import { BottomNav } from './bottom-nav'

function renderBottomNavAt(path: string) {
  const rootRoute = createRootRoute({
    component: () => (
      <AuthProvider cliente={criarClienteAuthTeste()}>
        <Outlet />
        <BottomNav />
      </AuthProvider>
    ),
  })
  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: [path] }),
  })
  return render(<RouterProvider router={router} />)
}

describe('BottomNav', () => {
  it('mostra os 5 rotulos de navegacao', async () => {
    renderBottomNavAt('/')
    await waitFor(() => {
      expect(screen.getByText('Início')).toBeInTheDocument()
      expect(screen.getByText('Extrato')).toBeInTheDocument()
      expect(screen.getByText('Parcelas')).toBeInTheDocument()
      expect(screen.getByText('Caixinhas')).toBeInTheDocument()
      expect(screen.getByText('Mais')).toBeInTheDocument()
    })
  })

  it('nao mostra mais o item Perfil na barra inferior', async () => {
    renderBottomNavAt('/')
    await waitFor(() => expect(screen.getByText('Início')).toBeInTheDocument())
    expect(screen.queryByText('Perfil')).not.toBeInTheDocument()
  })

  it('marca o item Início como ativo quando o pathname e /', async () => {
    renderBottomNavAt('/')
    await waitFor(() => {
      expect(screen.getByText('Início').closest('a')).toHaveAttribute('aria-current', 'page')
      expect(screen.getByText('Caixinhas').closest('a')).not.toHaveAttribute('aria-current', 'page')
    })
  })

  it('marca o item Caixinhas como ativo quando o pathname e /caixinhas', async () => {
    renderBottomNavAt('/caixinhas')
    await waitFor(() => {
      expect(screen.getByText('Caixinhas').closest('a')).toHaveAttribute('aria-current', 'page')
      expect(screen.getByText('Início').closest('a')).not.toHaveAttribute('aria-current', 'page')
    })
  })

  it('marca o item Extrato como ativo quando o pathname e /extrato', async () => {
    renderBottomNavAt('/extrato')
    await waitFor(() => {
      expect(screen.getByText('Extrato').closest('a')).toHaveAttribute('aria-current', 'page')
    })
  })

  it('clicar em Mais abre o painel lateral sem navegar', async () => {
    renderBottomNavAt('/')
    await waitFor(() => expect(screen.getByText('Mais')).toBeInTheDocument())

    fireEvent.click(screen.getByText('Mais'))

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Mais' })).toBeInTheDocument())
    expect(screen.getByText('Sair')).toBeInTheDocument()
  })
})
