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
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{titulo}</CardTitle>
        <Icone className={`size-4 ${cor}`} aria-hidden="true" />
      </CardHeader>
      <CardContent>
        <p className={`font-display text-2xl font-semibold ${cor}`}>{formatarMoeda(valor)}</p>
      </CardContent>
    </Card>
  )
}
