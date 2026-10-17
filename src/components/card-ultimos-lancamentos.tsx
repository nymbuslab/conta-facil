import { Link } from '@tanstack/react-router'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatarMoeda } from '@/lib/formatters'
import type { Lancamento } from '@/types/lancamento'

export function CardUltimosLancamentos({ itens }: { itens: Lancamento[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-foreground">Últimos lançamentos</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {itens.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum lançamento registrado ainda.</p>
        ) : (
          <>
            <ul className="flex flex-col gap-2">
              {itens.map((lancamento) => (
                <li key={lancamento.id} className="flex items-center justify-between gap-2">
                  <p className="min-w-0 truncate text-sm text-foreground">{lancamento.descricao}</p>
                  <span
                    className={`whitespace-nowrap font-display text-sm font-medium ${
                      lancamento.tipo === 'receita' ? 'text-success' : 'text-destructive'
                    }`}
                  >
                    {formatarMoeda(lancamento.valor)}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              to="/extrato"
              search={{ aba: 'receita' }}
              aria-label="Ver mais lançamentos"
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
