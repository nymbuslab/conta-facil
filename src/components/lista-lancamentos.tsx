import { useState } from 'react'

import { AcoesLancamentoDialog } from '@/components/acoes-lancamento-dialog'
import { BotaoCarregarMais } from '@/components/botao-carregar-mais'
import { DataTable } from '@/components/data-table'
import { colunasDespesa, colunasReceita, rotuloLinhaLancamento } from '@/lib/colunas-lancamento'
import type { Despesa, Lancamento, Receita } from '@/types/lancamento'

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
  const [lancamentoSelecionado, setLancamentoSelecionado] = useState<Lancamento | null>(null)

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h2 className="mb-2 text-sm font-semibold text-foreground">Receita</h2>
        <DataTable
          columns={colunasReceita}
          data={receitas}
          ariaLabel="Receitas do mês"
          mensagemVazio="Nenhuma receita lançada ainda."
          onRowClick={setLancamentoSelecionado}
          rotuloLinha={rotuloLinhaLancamento}
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
          onRowClick={setLancamentoSelecionado}
          rotuloLinha={rotuloLinhaLancamento}
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

      <AcoesLancamentoDialog
        lancamento={lancamentoSelecionado}
        onOpenChange={(open) => !open && setLancamentoSelecionado(null)}
      />
    </div>
  )
}
