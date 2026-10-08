import { ArrowDownRight, ArrowUpRight } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatarMoeda } from '@/lib/formatters'

interface SaldoCardProps {
  titulo: 'Receita' | 'Despesa'
  valor: number
}

export function SaldoCard({ titulo, valor }: SaldoCardProps) {
  const isReceita = titulo === 'Receita'
  const Icone = isReceita ? ArrowUpRight : ArrowDownRight
  const corTexto = isReceita ? 'text-success' : 'text-destructive'

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{titulo}</CardTitle>
        <Icone className={`size-4 ${corTexto}`} aria-hidden="true" />
      </CardHeader>
      <CardContent>
        <p className={`font-display text-2xl font-semibold ${corTexto}`}>
          {formatarMoeda(valor)}
        </p>
      </CardContent>
    </Card>
  )
}
