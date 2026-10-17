import { CalendarClock } from 'lucide-react'
import { Link } from '@tanstack/react-router'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { estaVencida } from '@/lib/datas'
import { formatarData, formatarMoeda } from '@/lib/formatters'
import type { Despesa } from '@/types/lancamento'

export function CardContasVencendo({ itens }: { itens: Despesa[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-semibold text-foreground">Contas vencendo</CardTitle>
        {itens.length > 0 && (
          <Link
            to="/extrato"
            search={{ aba: 'despesa' }}
            aria-label="Ver mais contas vencendo"
            className="text-sm font-medium text-primary hover:underline"
          >
            Ver mais
          </Link>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {itens.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma despesa vencendo nos próximos dias.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {itens.map((despesa) => {
              const vencida = estaVencida(despesa.vencimento)

              return (
                <li key={despesa.id} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-foreground">{despesa.descricao}</p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <CalendarClock className="size-3 shrink-0 text-destructive" aria-hidden="true" />
                      <span className="sr-only">Vencimento</span>
                      {formatarData(despesa.vencimento)}
                      {vencida && <span className="ml-1 font-medium text-destructive">Vencido</span>}
                    </p>
                  </div>
                  <span className="whitespace-nowrap font-display text-sm font-medium text-destructive">
                    {formatarMoeda(despesa.valor)}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
