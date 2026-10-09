import { Info } from 'lucide-react'

import { formatarMoeda } from '@/lib/formatters'

export function SaldoAcumuladoBar({ saldo }: { saldo: number }) {
  const positivo = saldo >= 0

  return (
    <div className="mb-4 rounded-lg border border-border bg-card px-4 py-3">
      <div className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <span>Sobra prevista</span>
        <Info className="size-3.5" aria-hidden="true" />
      </div>
      <p
        className={`font-display text-2xl font-bold ${positivo ? 'text-success' : 'text-destructive'}`}
      >
        {formatarMoeda(saldo)}
      </p>
      <p className="text-xs text-muted-foreground">Entradas menos saídas e guardado</p>
    </div>
  )
}
