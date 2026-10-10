import { createRouter } from '@tanstack/react-router'

import { Route as cadastroRoute } from '@/routes/cadastro'
import { Route as caixinhasRoute } from '@/routes/caixinhas'
import { Route as indexRoute } from '@/routes/index'
import { Route as loginRoute } from '@/routes/login'
import { Route as parcelasRoute } from '@/routes/parcelas'
import { Route as perfilRoute } from '@/routes/perfil'
import { Route as rootRoute } from '@/routes/__root'

export const routeTree = rootRoute.addChildren([
  indexRoute,
  parcelasRoute,
  caixinhasRoute,
  perfilRoute,
  loginRoute,
  cadastroRoute,
])

export const router = createRouter({ routeTree, context: {} })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
