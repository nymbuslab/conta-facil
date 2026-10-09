import { formatarMesAno } from '@/lib/datas'
import { perfilMock } from '@/lib/perfil-mock'

export function Header() {
  return (
    <header className="py-6">
      <p className="text-sm text-muted-foreground">{perfilMock.nome}</p>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
        {formatarMesAno()}
      </h1>
    </header>
  )
}
