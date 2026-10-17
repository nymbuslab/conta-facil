import { Link } from '@tanstack/react-router'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatarData, formatarMoeda } from '@/lib/formatters'
import type { Despesa } from '@/types/lancamento'

export function CardContasVencendo({ itens }: { itens: Despesa[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-foreground">Contas vencendo</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {itens.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma despesa vencendo nos próximos dias.</p>
        ) : (
          <>
            <ul className="flex flex-col gap-2">
              {itens.map((despesa) => (
                <li key={despesa.id} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-foreground">{despesa.descricao}</p>
                    <p className="text-xs text-muted-foreground">Venc. {formatarData(despesa.vencimento)}</p>
                  </div>
                  <span className="whitespace-nowrap font-display text-sm font-medium text-destructive">
                    {formatarMoeda(despesa.valor)}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              to="/extrato"
              search={{ aba: 'despesa' }}
              aria-label="Ver mais contas vencendo"
              className="text-sm font-medium text-primary hover:underline"
            >
              Ver mais
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  )
}
