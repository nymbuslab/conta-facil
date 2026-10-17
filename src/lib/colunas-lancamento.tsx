import { ArrowDownRight, ArrowUpRight, CalendarCheck, CalendarClock, Coins } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'

import { estaVencida } from '@/lib/datas'
import { formatarData, formatarMoeda } from '@/lib/formatters'
import { cn } from '@/lib/utils'
import type { Despesa, Lancamento, Receita } from '@/types/lancamento'

/** Colunas de receita e despesa compartilhadas entre ListaLancamentos (mantida só para os
 * testes de fluxos-assincronos e acessibilidade) e ExtratoLista — fonte única, para uma
 * mudança de rótulo ou de critério não divergir entre os dois lugares. */
export const colunasReceita: ColumnDef<Receita, unknown>[] = [
  {
    accessorKey: 'descricao',
    header: 'Descrição',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <ArrowUpRight className="size-4 shrink-0 text-success" aria-hidden="true" />
        <div className="min-w-0 max-w-[7.5rem] sm:max-w-xs">
          <p className="truncate">{row.original.descricao}</p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarCheck className="size-3 shrink-0 text-success" aria-hidden="true" />
            <span className="sr-only">Data de entrada</span>
            {formatarData(row.original.dataEmissao)}
          </p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'valor',
    header: 'Valor',
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap font-display font-medium text-success">
        {formatarMoeda(getValue<number>())}
      </span>
    ),
  },
]

/** Nome acessivel da linha clicavel (receita ou despesa, paga ou nao) — abre o menu de acoes
 * (marcar como paga quando aplicavel, editar, excluir). */
export function rotuloLinhaLancamento(lancamento: Lancamento): string {
  return `Abrir ações de "${lancamento.descricao}"`
}

export const colunasDespesa: ColumnDef<Despesa, unknown>[] = [
  {
    accessorKey: 'descricao',
    header: 'Descrição',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <ArrowDownRight className="size-4 shrink-0 text-destructive" aria-hidden="true" />
        <div className="min-w-0 max-w-[7.5rem] sm:max-w-xs">
          <p className="truncate">{row.original.descricao}</p>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CalendarClock className="size-3 shrink-0 text-destructive" aria-hidden="true" />
              <span className="sr-only">Vencimento</span>
              {formatarData(row.original.vencimento)}
            </span>
            {row.original.paga && (
              <span className="flex items-center gap-1 text-success">
                <Coins className="size-3 shrink-0" aria-hidden="true" />
                <span className="sr-only">Pago em</span>
                {formatarData(row.original.pagoEm ?? row.original.vencimento)}
              </span>
            )}
          </p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'valor',
    header: 'Valor',
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap font-display font-medium text-destructive">
        {formatarMoeda(getValue<number>())}
      </span>
    ),
  },
  {
    accessorKey: 'paga',
    header: 'Status',
    cell: ({ getValue, row }) => {
      if (getValue<boolean>()) {
        return <span className="text-xs font-medium text-success">Pago</span>
      }

      const vencida = estaVencida(row.original.vencimento)
      const rotulo = vencida ? 'Vencido' : 'A vencer'

      return (
        <span className={cn('text-xs font-medium', vencida ? 'text-destructive' : 'text-foreground')}>
          {rotulo}
        </span>
      )
    },
  },
]
