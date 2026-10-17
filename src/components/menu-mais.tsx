import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { CircleUser, Home, LogOut, Receipt, Wallet } from 'lucide-react'

import { SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useAuth } from '@/state/auth-context'

const ITENS = [
  { to: '/', label: 'Início', Icone: Home },
  { to: '/extrato', label: 'Extrato', Icone: Receipt },
  { to: '/parcelas', label: 'Parcelas', Icone: Receipt },
  { to: '/caixinhas', label: 'Caixinhas', Icone: Wallet },
  { to: '/perfil', label: 'Perfil', Icone: CircleUser },
] as const

export function MenuMais({ onNavegar }: { onNavegar: () => void }) {
  const { sair } = useAuth()
  const navigate = useNavigate()
  const [saindo, setSaindo] = useState(false)

  async function aoSair() {
    setSaindo(true)
    try {
      await sair()
      onNavegar()
      await navigate({ to: '/login' })
    } finally {
      setSaindo(false)
    }
  }

  return (
    <>
      <SheetHeader>
        <SheetTitle>Mais</SheetTitle>
      </SheetHeader>

      <nav className="flex flex-col gap-1">
        {ITENS.map(({ to, label, Icone }) => (
          <Link
            key={to}
            to={to}
            onClick={onNavegar}
            className="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm text-foreground hover:bg-secondary [&.active]:bg-secondary [&.active]:font-medium"
            activeOptions={{ exact: to === '/' }}
          >
            <Icone className="size-5 text-muted-foreground" aria-hidden="true" />
            {label}
          </Link>
        ))}

        <button
          type="button"
          onClick={() => void aoSair()}
          disabled={saindo}
          className="flex min-h-11 items-center gap-3 rounded-md px-3 text-left text-sm text-destructive hover:bg-secondary disabled:opacity-50"
        >
          <LogOut className="size-5" aria-hidden="true" />
          {saindo ? 'Saindo...' : 'Sair'}
        </button>
      </nav>
    </>
  )
}
