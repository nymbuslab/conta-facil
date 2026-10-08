import { formatarMoeda } from '@/lib/formatters'

export function SaldoAcumuladoBar({ saldo }: { saldo: number }) {
  const positivo = saldo >= 0

  return (
    <div className="mb-4 flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
      <span className="text-sm text-muted-foreground">Saldo acumulado</span>
      <span
        className={`font-display text-base font-semibold ${
          positivo ? 'text-success' : 'text-destructive'
        }`}
      >
        {positivo ? '+' : ''}
        {formatarMoeda(saldo)}
      </span>
    </div>
  )
}
