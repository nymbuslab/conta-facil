import { formatarMesAno } from '@/lib/datas'
import { useAuth } from '@/state/auth-context'

export function Header() {
  const { usuario } = useAuth()

  if (!usuario) return null

  return (
    <header className="py-6">
      <p className="text-sm text-muted-foreground">{usuario.nome}</p>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
        {formatarMesAno()}
      </h1>
    </header>
  )
}
