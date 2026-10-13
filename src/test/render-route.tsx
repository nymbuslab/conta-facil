import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router'
import { render } from '@testing-library/react'

import { routeTree } from '@/router'
import type { ApiClient } from '@/lib/api-client'
import { criarClienteCaixinhasTeste, criarClienteLancamentosTeste } from '@/test/api-client-mocks'
import { criarClienteAuthTeste, usuarioTestePadrao } from '@/test/test-utils'
import type { ClienteAuth } from '@/state/auth-context'

export function renderRoute(
  path: string,
  opcoes: {
    usuario?: typeof usuarioTestePadrao | null
    clienteAuth?: ClienteAuth
    clienteLancamentos?: ApiClient
    clienteCaixinhas?: ApiClient
  } = {},
) {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
    context: {
      clienteAuth: opcoes.clienteAuth ?? criarClienteAuthTeste(
        opcoes.usuario === undefined ? usuarioTestePadrao : opcoes.usuario,
      ),
      clienteLancamentos: opcoes.clienteLancamentos ?? criarClienteLancamentosTeste(),
      clienteCaixinhas: opcoes.clienteCaixinhas ?? criarClienteCaixinhasTeste(),
    },
  })

  const utils = render(<RouterProvider router={router} />)
  return { ...utils, router }
}
