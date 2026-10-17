import { useEffect, useMemo, useState } from 'react'

import { BotaoCarregarMais } from '@/components/botao-carregar-mais'
import { ConfirmarPagamentoDialog } from '@/components/confirmar-pagamento-dialog'
import { DataTable } from '@/components/data-table'
import { Button } from '@/components/ui/button'
import { mensagemErroApi } from '@/lib/api-client'
import { colunasReceita, criarColunasDespesa } from '@/lib/colunas-lancamento'
import { useLancamentos } from '@/state/lancamentos-context'
import type { Despesa, Receita } from '@/types/lancamento'

interface ExtratoListaProps {
  receitas: Receita[]
  despesas: Despesa[]
  abaInicial?: 'receita' | 'despesa'
  temMaisReceitas?: boolean
  temMaisDespesas?: boolean
  carregandoMais?: 'receita' | 'despesa' | null
  erroCarregarMais?: string | null
  onCarregarMaisReceitas?: () => void
  onCarregarMaisDespesas?: () => void
}

/** Lista do Extrato: mesmas colunas e o mesmo DataTable de sempre, mas em abas — só uma
 * tabela por vez — no lugar das duas seções empilhadas que a tela antiga usava (D-05, D-14). */
export function ExtratoLista({
  receitas,
  despesas,
  abaInicial = 'receita',
  temMaisReceitas = false,
  temMaisDespesas = false,
  carregandoMais = null,
  erroCarregarMais = null,
  onCarregarMaisReceitas,
  onCarregarMaisDespesas,
}: ExtratoListaProps) {
  const { marcarComoPaga } = useLancamentos()
  const [aba, setAba] = useState<'receita' | 'despesa'>(abaInicial)
  const [despesaSelecionada, setDespesaSelecionada] = useState<Despesa | null>(null)
  const [erroPagamento, setErroPagamento] = useState<string | null>(null)
  const [processando, setProcessando] = useState(false)
  const colunasDespesa = useMemo(() => criarColunasDespesa(setDespesaSelecionada), [])

  // Resincroniza se abaInicial mudar sem a tela remontar: hoje as duas entradas (os cards do
  // dashboard) sempre remontam o componente, mas useState(abaInicial) sozinho ignoraria uma
  // futura navegacao que troque so a busca da rota com o componente ja montado.
  useEffect(() => {
    setAba(abaInicial)
  }, [abaInicial])

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
    <div className="flex flex-col gap-4">
      <div className="flex gap-2" role="tablist" aria-label="Receita ou Despesas">
        <Button
          type="button"
          variant={aba === 'receita' ? 'secondary' : 'ghost'}
          size="sm"
          id="aba-receita"
          role="tab"
          aria-selected={aba === 'receita'}
          aria-controls="painel-receita"
          onClick={() => setAba('receita')}
        >
          Receita
        </Button>
        <Button
          type="button"
          variant={aba === 'despesa' ? 'secondary' : 'ghost'}
          size="sm"
          id="aba-despesa"
          role="tab"
          aria-selected={aba === 'despesa'}
          aria-controls="painel-despesa"
          onClick={() => setAba('despesa')}
        >
          Despesas
        </Button>
      </div>

      {aba === 'receita' ? (
        <section id="painel-receita" role="tabpanel" aria-labelledby="aba-receita">
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
      ) : (
        <section id="painel-despesa" role="tabpanel" aria-labelledby="aba-despesa">
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
      )}

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
