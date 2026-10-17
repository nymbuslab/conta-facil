import type { ColumnDef } from '@tanstack/react-table'

import { estaVencida } from '@/lib/datas'
import { formatarData, formatarMoeda } from '@/lib/formatters'
import { cn } from '@/lib/utils'
import type { Despesa, Receita } from '@/types/lancamento'

/** Colunas de receita e despesa compartilhadas entre ListaLancamentos (mantida só para os
 * testes de fluxos-assincronos e acessibilidade) e ExtratoLista — fonte única, para uma
 * mudança de rótulo ou de critério não divergir entre os dois lugares. */
export const colunasReceita: ColumnDef<Receita, unknown>[] = [
  {
    accessorKey: 'descricao',
    header: 'Descrição',
    cell: ({ row }) => (
      <div className="max-w-[9rem] sm:max-w-xs">
        <p className="truncate">{row.original.descricao}</p>
        <p className="text-xs text-muted-foreground">
          Dt Entrada {formatarData(row.original.dataEmissao)}
        </p>
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

export function criarColunasDespesa(aoSelecionarPendente: (despesa: Despesa) => void): ColumnDef<Despesa, unknown>[] {
  return [
    {
      accessorKey: 'descricao',
      header: 'Descrição',
      cell: ({ row }) => (
        <div className="max-w-[9rem] sm:max-w-xs">
          <p className="truncate">{row.original.descricao}</p>
          <p className="text-xs text-muted-foreground">
            Venc. {formatarData(row.original.vencimento)}
          </p>
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
          <button
            type="button"
            className={cn(
              'rounded-sm text-xs font-medium underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              vencida ? 'text-destructive' : 'text-foreground',
            )}
            aria-label={`${rotulo}, marcar "${row.original.descricao}" como paga`}
            onClick={(evento) => {
              evento.stopPropagation()
              aoSelecionarPendente(row.original)
            }}
          >
            {rotulo}
          </button>
        )
      },
    },
  ]
}
