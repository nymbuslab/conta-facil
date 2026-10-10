import { ArrowDownRight, ArrowUpRight, PiggyBank } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatarMoeda } from '@/lib/formatters'

interface SaldoCardProps {
  titulo: 'Receita' | 'Despesa' | 'Guardado'
  valor: number
}

const ESTILO_POR_TITULO = {
  Receita: { Icone: ArrowUpRight, cor: 'text-success' },
  Despesa: { Icone: ArrowDownRight, cor: 'text-destructive' },
  Guardado: { Icone: PiggyBank, cor: 'text-primary' },
} as const

export function SaldoCard({ titulo, valor }: SaldoCardProps) {
  const { Icone, cor } = ESTILO_POR_TITULO[titulo]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-1.5">
        <CardTitle className="truncate text-xs font-medium text-muted-foreground">{titulo}</CardTitle>
        <Icone className={`size-3.5 shrink-0 ${cor}`} aria-hidden="true" />
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <p className={`break-words font-display text-sm font-semibold sm:text-xl ${cor}`}>
          {formatarMoeda(valor)}
        </p>
      </CardContent>
    </Card>
  )
}
