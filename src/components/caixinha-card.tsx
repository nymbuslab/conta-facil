import { Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { formatarMoeda } from '@/lib/formatters'
import type { Caixinha } from '@/types/caixinha'

interface CaixinhaCardProps {
  caixinha: Caixinha
  onDepositar: (caixinha: Caixinha) => void
  onResgatar: (caixinha: Caixinha) => void
  onExcluir: (caixinha: Caixinha) => void
}

export function CaixinhaCard({ caixinha, onDepositar, onResgatar, onExcluir }: CaixinhaCardProps) {
  const percentual =
    caixinha.meta <= 0
      ? 0
      : caixinha.valorGuardado >= caixinha.meta
        ? 100
        : Math.min(99, Math.round((caixinha.valorGuardado / caixinha.meta) * 100))

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <span className="text-sm font-medium text-foreground">{caixinha.nome}</span>
        <button
          type="button"
          onClick={() => onExcluir(caixinha)}
          aria-label={`Excluir caixinha ${caixinha.nome}`}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="font-display text-xl font-semibold text-foreground">
          {formatarMoeda(caixinha.valorGuardado)}{' '}
          <span className="text-sm font-normal text-muted-foreground">
            / {formatarMoeda(caixinha.meta)}
          </span>
        </p>

        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            data-progresso
            className="h-full rounded-full bg-success"
            style={{ width: `${percentual}%` }}
          />
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => onDepositar(caixinha)}>
            Depositar
          </Button>
          <Button variant="outline" size="sm" className="flex-1" onClick={() => onResgatar(caixinha)}>
            Resgatar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
