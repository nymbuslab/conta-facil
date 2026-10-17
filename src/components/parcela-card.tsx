import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { formatarMoeda } from '@/lib/formatters'

interface ParcelaCardProps {
  descricao: string
  totalParcelas: number
  parcelasPagas: number
  valorTotal: number
  valorPago: number
  valorFalta: number
}

export function ParcelaCard({
  descricao,
  totalParcelas,
  parcelasPagas,
  valorTotal,
  valorPago,
  valorFalta,
}: ParcelaCardProps) {
  const percentual =
    parcelasPagas >= totalParcelas
      ? 100
      : Math.min(99, Math.round((parcelasPagas / totalParcelas) * 100))

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{descricao}</span>
        <Badge variant="secondary">
          {parcelasPagas}/{totalParcelas}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="font-display text-xl font-semibold text-foreground">
          {formatarMoeda(valorTotal)}
        </p>

        <div className="flex items-center justify-between text-sm">
          <span className="text-success">Pago <span>{formatarMoeda(valorPago)}</span></span>
          <span className="text-muted-foreground">
            Falta <span>{formatarMoeda(valorFalta)}</span>
          </span>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-success" style={{ width: `${percentual}%` }} />
        </div>
      </CardContent>
    </Card>
  )
}
