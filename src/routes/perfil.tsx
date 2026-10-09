import { createRoute } from '@tanstack/react-router'
import { CircleUserRound } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { perfilMock } from '@/lib/perfil-mock'
import { Route as rootRoute } from '@/routes/__root'

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/perfil',
  component: TelaPerfil,
})

export function TelaPerfil() {
  return (
    <div className="mx-auto min-h-svh max-w-xl px-4 pb-36">
      <header className="py-6 text-center">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          Perfil
        </h1>
      </header>

      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
          <CircleUserRound className="size-16 text-muted-foreground" aria-hidden="true" />
          <p className="font-display text-lg font-semibold text-foreground">{perfilMock.nome}</p>
          <p className="text-sm text-muted-foreground">{perfilMock.email}</p>
        </CardContent>
      </Card>
    </div>
  )
}
