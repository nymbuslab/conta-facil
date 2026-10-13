import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'

import { ConfirmarPagamentoDialog } from '@/components/confirmar-pagamento-dialog'
import { DataTable } from '@/components/data-table'
import { estaVencida } from '@/lib/datas'
import { formatarData, formatarMoeda } from '@/lib/formatters'
import { useLancamentos } from '@/state/lancamentos-context'
import type { Despesa, Receita } from '@/types/lancamento'

const colunasReceita: ColumnDef<Receita, unknown>[] = [
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

function criarColunasDespesa(aoSelecionarPendente: (despesa: Despesa) => void): ColumnDef<Despesa, unknown>[] {
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
      cell: ({ getValue, row }) =>
        getValue<boolean>() ? (
          <span className="text-xs font-medium text-success">Pago</span>
        ) : (
          <button
            type="button"
            className={
              estaVencida(row.original.vencimento)
                ? 'text-xs font-medium text-destructive underline-offset-2 hover:underline'
                : 'text-xs font-medium text-foreground underline-offset-2 hover:underline'
            }
            onClick={(evento) => {
              evento.stopPropagation()
              aoSelecionarPendente(row.original)
            }}
          >
            {estaVencida(row.original.vencimento) ? 'Vencido' : 'A vencer'}
          </button>
        ),
    },
  ]
}

interface ListaLancamentosProps {
  receitas: Receita[]
  despesas: Despesa[]
}

export function ListaLancamentos({ receitas, despesas }: ListaLancamentosProps) {
  const { marcarComoPaga } = useLancamentos()
  const [despesaSelecionada, setDespesaSelecionada] = useState<Despesa | null>(null)
  const [erroPagamento, setErroPagamento] = useState<string | null>(null)
  const colunasDespesa = useMemo(() => criarColunasDespesa(setDespesaSelecionada), [])

  async function confirmarPagamento(id: string) {
    setErroPagamento(null)
    try {
      await marcarComoPaga(id)
      setDespesaSelecionada(null)
    } catch (falha) {
      setErroPagamento(falha instanceof Error ? falha.message : 'Não foi possível marcar como paga')
    }
  }

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
          onRowClick={setDespesaSelecionada}
          linhaDesabilitada={(despesa) => despesa.paga}
        />
      </section>

      <ConfirmarPagamentoDialog
        despesa={despesaSelecionada}
        erro={erroPagamento}
        onCancelar={() => {
          setDespesaSelecionada(null)
          setErroPagamento(null)
        }}
        onConfirmar={confirmarPagamento}
      />
    </div>
  )
}
