import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Menu, Receipt, Wallet, Home } from 'lucide-react'

import { MenuMais } from '@/components/menu-mais'
import { Sheet, SheetContent } from '@/components/ui/sheet'

const ITENS = [
  { to: '/', label: 'Início', Icone: Home },
  { to: '/extrato', label: 'Extrato', Icone: Receipt },
  { to: '/parcelas', label: 'Parcelas', Icone: Receipt },
  { to: '/caixinhas', label: 'Caixinhas', Icone: Wallet },
] as const

export function BottomNav() {
  const [aberto, setAberto] = useState(false)

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

        <button
          type="button"
          onClick={() => setAberto(true)}
          className="flex flex-1 flex-col items-center gap-1 py-2 text-xs text-muted-foreground"
          aria-haspopup="true"
          aria-expanded={aberto}
        >
          <Menu className="size-5" aria-hidden="true" />
          Mais
        </button>
      </div>

      <Sheet open={aberto} onOpenChange={setAberto}>
        <SheetContent>
          <MenuMais onNavegar={() => setAberto(false)} />
        </SheetContent>
      </Sheet>
    </nav>
  )
}
