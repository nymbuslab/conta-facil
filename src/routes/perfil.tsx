import { useState } from 'react'
import { createRoute, useNavigate } from '@tanstack/react-router'
import { CircleUserRound } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Route as rootRoute } from '@/routes/__root'
import { useAuth } from '@/state/auth-context'

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/perfil',
  component: TelaPerfil,
})

export function TelaPerfil() {
  const { usuario, sair } = useAuth()
  const navigate = useNavigate()
  const [saindo, setSaindo] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  if (!usuario) return null

  async function aoSair() {
    setErro(null)
    setSaindo(true)
    try {
      await sair()
      await navigate({ to: '/login' })
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Não foi possível sair')
      setSaindo(false)
    }
  }

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
          <p className="font-display text-lg font-semibold text-foreground">{usuario.nome}</p>
          <p className="text-sm text-muted-foreground">{usuario.email}</p>
        </CardContent>
      </Card>

      {erro && <p className="mt-4 text-center text-sm text-destructive">{erro}</p>}

      <Button
        variant="outline"
        className="mt-6 w-full"
        disabled={saindo}
        onClick={aoSair}
      >
        {saindo ? 'Saindo...' : 'Sair da conta'}
      </Button>
    </div>
  )
}
