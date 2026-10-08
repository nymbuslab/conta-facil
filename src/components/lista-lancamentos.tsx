import type { ColumnDef } from '@tanstack/react-table'

import { DataTable } from '@/components/data-table'
import { formatarData, formatarMoeda } from '@/lib/formatters'
import type { Despesa, Receita } from '@/types/lancamento'

const colunasReceita: ColumnDef<Receita, unknown>[] = [
  {
    accessorKey: 'dataEmissao',
    header: 'Emissão',
    cell: ({ getValue }) => formatarData(getValue<string>()),
  },
  {
    accessorKey: 'descricao',
    header: 'Descrição',
  },
  {
    accessorKey: 'valor',
    header: 'Valor',
    cell: ({ getValue }) => (
      <span className="font-display font-medium text-success">
        {formatarMoeda(getValue<number>())}
      </span>
    ),
  },
]

const colunasDespesa: ColumnDef<Despesa, unknown>[] = [
  {
    accessorKey: 'dataEmissao',
    header: 'Emissão',
    cell: ({ getValue }) => formatarData(getValue<string>()),
  },
  {
    accessorKey: 'descricao',
    header: 'Descrição',
  },
  {
    accessorKey: 'valor',
    header: 'Valor',
    cell: ({ getValue }) => (
      <span className="font-display font-medium text-destructive">
        {formatarMoeda(getValue<number>())}
      </span>
    ),
  },
  {
    accessorKey: 'vencimento',
    header: 'Vencimento',
    cell: ({ getValue }) => formatarData(getValue<string>()),
  },
]

interface ListaLancamentosProps {
  receitas: Receita[]
  despesas: Despesa[]
}

export function ListaLancamentos({ receitas, despesas }: ListaLancamentosProps) {
  return (
    <div className="flex flex-col gap-6">
      <section>
        <h2 className="mb-2 text-sm font-semibold text-foreground">Receita</h2>
        <DataTable
          columns={colunasReceita}
          data={receitas}
          mensagemVazio="Nenhuma receita lançada ainda."
        />
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-foreground">Despesa</h2>
        <DataTable
          columns={colunasDespesa}
          data={despesas}
          mensagemVazio="Nenhuma despesa lançada ainda."
        />
      </section>
    </div>
  )
}
