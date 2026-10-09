import { createRootRoute, Outlet } from '@tanstack/react-router'

import { BottomNav } from '@/components/bottom-nav'
import { TopoMarca } from '@/components/topo-marca'
import { CaixinhasProvider } from '@/state/caixinhas-context'
import { LancamentosProvider } from '@/state/lancamentos-context'

export const Route = createRootRoute({
  component: () => (
    <LancamentosProvider>
      <CaixinhasProvider>
        <TopoMarca />
        <Outlet />
        <BottomNav />
      </CaixinhasProvider>
    </LancamentosProvider>
  ),
})
