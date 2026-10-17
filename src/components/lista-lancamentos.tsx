import { useMemo, useState } from 'react'

import { BotaoCarregarMais } from '@/components/botao-carregar-mais'
import { ConfirmarPagamentoDialog } from '@/components/confirmar-pagamento-dialog'
import { DataTable } from '@/components/data-table'
import { mensagemErroApi } from '@/lib/api-client'
import { colunasReceita, criarColunasDespesa } from '@/lib/colunas-lancamento'
import { useLancamentos } from '@/state/lancamentos-context'
import type { Despesa, Receita } from '@/types/lancamento'

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
