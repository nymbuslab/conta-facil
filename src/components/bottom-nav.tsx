import { Link } from '@tanstack/react-router'
import { CircleUser, Receipt, Wallet, Home } from 'lucide-react'

const ITENS = [
  { to: '/', label: 'Início', Icone: Home },
  { to: '/parcelas', label: 'Parcelas', Icone: Receipt },
  { to: '/caixinhas', label: 'Caixinhas', Icone: Wallet },
  { to: '/perfil', label: 'Perfil', Icone: CircleUser },
] as const

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-card">
      <div className="mx-auto flex max-w-xl items-stretch justify-around">
        {ITENS.map(({ to, label, Icone }) => (
          <Link
            key={to}
            to={to}
            className="flex flex-1 flex-col items-center gap-1 py-2 text-xs text-muted-foreground [&.active]:text-primary"
            activeOptions={{ exact: to === '/' }}
          >
            <Icone className="size-5" aria-hidden="true" />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
