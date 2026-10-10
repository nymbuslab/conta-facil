import type { ReactNode } from 'react'
import { createRootRouteWithContext, Navigate, Outlet, useRouterState } from '@tanstack/react-router'

import { BottomNav } from '@/components/bottom-nav'
import { TopoMarca } from '@/components/topo-marca'
import type { ApiClient } from '@/lib/api-client'
import { AuthProvider, useAuth, type ClienteAuth } from '@/state/auth-context'
import { CaixinhasProvider } from '@/state/caixinhas-context'
import { LancamentosProvider } from '@/state/lancamentos-context'

export type ContextoRoteador = {
  clienteAuth?: ClienteAuth
  clienteLancamentos?: ApiClient
  clienteCaixinhas?: ApiClient
}

function ConteudoRaiz() {
  const { status } = useAuth()
  const caminho = useRouterState({ select: (state) => state.location.pathname })
  const rotaPublica = caminho === '/login' || caminho === '/cadastro'

  if (status === 'carregando') {
    return (
      <>
        <TopoMarca />
        <main className="flex min-h-[calc(100dvh-48px)] items-center justify-center px-4">
          <p role="status" className="text-sm text-muted-foreground">
            Carregando sua conta...
          </p>
        </main>
      </>
    )
  }

  if (status === 'anonimo' && !rotaPublica) {
    return <Navigate to="/login" replace />
  }

  if (status === 'autenticado' && rotaPublica) {
    return <Navigate to="/" replace />
  }

  return (
    <>
      <TopoMarca />
      <Outlet />
      {status === 'autenticado' ? <BottomNav /> : null}
    </>
  )
}

/** Remonta os providers de dados inteiros a cada troca de usuario (incluindo
 * anonimo <-> autenticado). Sem isso, uma mutacao ou recarga em voo iniciada pela sessao
 * anterior poderia aplicar setState sobre o estado exibido para o usuario que entrou depois —
 * remontar faz qualquer setState tardio da instancia antiga cair num componente ja
 * desmontado, que o React simplesmente ignora. */
function ProvedoresDeDados({
  clienteLancamentos,
  clienteCaixinhas,
  children,
}: {
  clienteLancamentos?: ApiClient
  clienteCaixinhas?: ApiClient
  children: ReactNode
}) {
  const { usuario } = useAuth()
  const chaveUsuario = usuario?.id ?? 'anonimo'

  return (
    <LancamentosProvider key={chaveUsuario} cliente={clienteLancamentos}>
      <CaixinhasProvider key={chaveUsuario} cliente={clienteCaixinhas}>
        {children}
      </CaixinhasProvider>
    </LancamentosProvider>
  )
}

function LayoutRaiz() {
  const { clienteAuth, clienteLancamentos, clienteCaixinhas } = Route.useRouteContext()

  return (
    <AuthProvider cliente={clienteAuth}>
      <ProvedoresDeDados clienteLancamentos={clienteLancamentos} clienteCaixinhas={clienteCaixinhas}>
        <ConteudoRaiz />
      </ProvedoresDeDados>
    </AuthProvider>
  )
}

export const Route = createRootRouteWithContext<ContextoRoteador>()({
  component: LayoutRaiz,
})
