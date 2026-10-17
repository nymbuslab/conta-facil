import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRoute,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { AuthProvider } from '@/state/auth-context'
import { criarClienteAuthTeste } from '@/test/test-utils'

import { MenuMais } from './menu-mais'
import { Sheet, SheetContent } from './ui/sheet'

function montarRouter(aoFechar: () => void, aoSair = vi.fn().mockResolvedValue({ data: {}, error: null })) {
  const cliente = { ...criarClienteAuthTeste(), signOut: aoSair }
  const rootRoute = createRootRoute({
    component: () => (
      <AuthProvider cliente={cliente}>
        <Outlet />
      </AuthProvider>
    ),
  })
  const paginaTexto = (caminho: string, texto: string) =>
    createRoute({ getParentRoute: () => rootRoute, path: caminho, component: () => <p>{texto}</p> })

  const routeTree = rootRoute.addChildren([
    createRoute({
      getParentRoute: () => rootRoute,
      path: '/',
      component: () => (
        <Sheet open onOpenChange={() => {}}>
          <SheetContent>
            <MenuMais onNavegar={aoFechar} />
          </SheetContent>
        </Sheet>
      ),
    }),
    paginaTexto('/extrato', 'Pagina Extrato'),
    paginaTexto('/parcelas', 'Pagina Parcelas'),
    paginaTexto('/caixinhas', 'Pagina Caixinhas'),
    paginaTexto('/perfil', 'Pagina Perfil'),
    paginaTexto('/login', 'Pagina Login'),
  ])

  return createRouter({ routeTree, history: createMemoryHistory({ initialEntries: ['/'] }) })
}

describe('MenuMais', () => {
  it('mostra os links de navegacao e o item Sair', async () => {
    render(<RouterProvider router={montarRouter(vi.fn())} />)

    await waitFor(() => {
      expect(screen.getByText('Início')).toBeInTheDocument()
      expect(screen.getByText('Extrato')).toBeInTheDocument()
      expect(screen.getByText('Parcelas')).toBeInTheDocument()
      expect(screen.getByText('Caixinhas')).toBeInTheDocument()
      expect(screen.getByText('Perfil')).toBeInTheDocument()
      expect(screen.getByText('Sair')).toBeInTheDocument()
    })
  })

  it('clicar em Perfil navega para /perfil e fecha o painel', async () => {
    const aoFechar = vi.fn()
    render(<RouterProvider router={montarRouter(aoFechar)} />)

    fireEvent.click(await screen.findByText('Perfil'))

    await waitFor(() => expect(screen.getByText('Pagina Perfil')).toBeInTheDocument())
    expect(aoFechar).toHaveBeenCalled()
  })

  it('clicar em Sair chama o logout direto, sem navegar antes para /perfil', async () => {
    const aoFechar = vi.fn()
    const aoSair = vi.fn().mockResolvedValue({ data: {}, error: null })
    render(<RouterProvider router={montarRouter(aoFechar, aoSair)} />)

    fireEvent.click(await screen.findByText('Sair'))

    await waitFor(() => expect(screen.getByText('Pagina Login')).toBeInTheDocument())
    expect(aoSair).toHaveBeenCalled()
    expect(aoFechar).toHaveBeenCalled()
    expect(screen.queryByText('Pagina Perfil')).not.toBeInTheDocument()
  })
})
