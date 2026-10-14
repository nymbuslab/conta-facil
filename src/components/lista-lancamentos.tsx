import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'

import { BotaoCarregarMais } from '@/components/botao-carregar-mais'
import { ConfirmarPagamentoDialog } from '@/components/confirmar-pagamento-dialog'
import { DataTable } from '@/components/data-table'
import { mensagemErroApi } from '@/lib/api-client'
import { estaVencida } from '@/lib/datas'
import { formatarData, formatarMoeda } from '@/lib/formatters'
import { cn } from '@/lib/utils'
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

interface ListaLancamentosProps {
  receitas: Receita[]
  despesas: Despesa[]
  temMaisReceitas?: boolean
  temMaisDespesas?: boolean
  carregandoMais?: 'receita' | 'despesa' | null
  erroCarregarMais?: string | null
  onCarregarMaisReceitas?: () => void
  onCarregarMaisDespesas?: () => void
}

export function ListaLancamentos({
  receitas,
  despesas,
  temMaisReceitas = false,
  temMaisDespesas = false,
  carregandoMais = null,
  erroCarregarMais = null,
  onCarregarMaisReceitas,
  onCarregarMaisDespesas,
}: ListaLancamentosProps) {
  const { marcarComoPaga } = useLancamentos()
  const [despesaSelecionada, setDespesaSelecionada] = useState<Despesa | null>(null)
  const [erroPagamento, setErroPagamento] = useState<string | null>(null)
  const [processando, setProcessando] = useState(false)
  const colunasDespesa = useMemo(() => criarColunasDespesa(setDespesaSelecionada), [])

  async function confirmarPagamento(id: string) {
    setErroPagamento(null)
    setProcessando(true)
    try {
      await marcarComoPaga(id)
      setDespesaSelecionada(null)
    } catch (falha) {
      setErroPagamento(mensagemErroApi(falha, 'Não foi possível marcar como paga'))
    } finally {
      setProcessando(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h2 className="mb-2 text-sm font-semibold text-foreground">Receita</h2>
        <DataTable
          columns={colunasReceita}
          data={receitas}
          ariaLabel="Receitas do mês"
          mensagemVazio="Nenhuma receita lançada ainda."
        />
        {temMaisReceitas && (
          <BotaoCarregarMais
            carregando={carregandoMais === 'receita'}
            onClick={() => onCarregarMaisReceitas?.()}
          />
        )}
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-foreground">Despesa</h2>
        <DataTable
          columns={colunasDespesa}
          data={despesas}
          ariaLabel="Despesas do mês"
          mensagemVazio="Nenhuma despesa lançada ainda."
          onRowClick={setDespesaSelecionada}
          linhaDesabilitada={(despesa) => despesa.paga}
        />
        {temMaisDespesas && (
          <BotaoCarregarMais
            carregando={carregandoMais === 'despesa'}
            onClick={() => onCarregarMaisDespesas?.()}
          />
        )}
      </section>

      {erroCarregarMais && (
        <p role="alert" className="text-center text-sm text-destructive">
          {erroCarregarMais}
        </p>
      )}

      <ConfirmarPagamentoDialog
        despesa={despesaSelecionada}
        erro={erroPagamento}
        processando={processando}
        onCancelar={() => {
          setDespesaSelecionada(null)
          setErroPagamento(null)
        }}
        onConfirmar={confirmarPagamento}
      />
    </div>
  )
}
