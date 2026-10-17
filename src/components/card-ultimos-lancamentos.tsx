import { ArrowDownRight, ArrowUpRight, CalendarCheck, CalendarClock } from 'lucide-react'
import { Link } from '@tanstack/react-router'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatarData, formatarMoeda } from '@/lib/formatters'
import type { Lancamento } from '@/types/lancamento'

const ESTILO_POR_TIPO = {
  receita: {
    Icone: ArrowUpRight,
    cor: 'text-success',
    IconeData: CalendarCheck,
    rotuloData: 'Data de entrada',
  },
  despesa: {
    Icone: ArrowDownRight,
    cor: 'text-destructive',
    IconeData: CalendarClock,
    rotuloData: 'Vencimento',
  },
} as const

export function CardUltimosLancamentos({ itens }: { itens: Lancamento[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-semibold text-foreground">Últimos lançamentos</CardTitle>
        {itens.length > 0 && (
          <Link
            to="/extrato"
            search={{ aba: itens[0].tipo }}
            aria-label="Ver mais lançamentos"
            className="text-sm font-medium text-primary hover:underline"
          >
            Ver mais
          </Link>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {itens.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum lançamento registrado ainda.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {itens.map((lancamento) => {
              const { Icone, cor, IconeData, rotuloData } = ESTILO_POR_TIPO[lancamento.tipo]
              const data = lancamento.tipo === 'receita' ? lancamento.dataEmissao : lancamento.vencimento

              return (
                <li key={lancamento.id} className="flex items-center gap-3">
                  <Icone className={`size-4 shrink-0 ${cor}`} aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-foreground">{lancamento.descricao}</p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <IconeData className={`size-3 shrink-0 ${cor}`} aria-hidden="true" />
                      <span className="sr-only">{rotuloData}</span>
                      {formatarData(data)}
                    </p>
                  </div>
                  <span className={`whitespace-nowrap font-display text-sm font-medium ${cor}`}>
                    {formatarMoeda(lancamento.valor)}
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
