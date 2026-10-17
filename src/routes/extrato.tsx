import { createRoute } from '@tanstack/react-router'

import { EstadoCarregandoExtrato, EstadoErro } from '@/components/estado-dados'
import { ExtratoLista } from '@/components/extrato-lista'
import { FiltrosLancamentos } from '@/components/filtros-lancamentos'
import { RegistrarFab } from '@/components/registrar-fab'
import { SaldoCard } from '@/components/saldo-card'
import { formatarMoeda } from '@/lib/formatters'
import { useLancamentos } from '@/state/lancamentos-context'
import { Route as rootRoute } from '@/routes/__root'

export interface BuscaExtrato {
  aba: 'receita' | 'despesa'
}

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/extrato',
  validateSearch: (busca: Record<string, unknown>): BuscaExtrato => ({
    aba: busca.aba === 'despesa' ? 'despesa' : 'receita',
  }),
  component: TelaExtrato,
})

export function TelaExtrato() {
  const { aba } = Route.useSearch()
  const {
    receitas,
    despesas,
    saldoReceita,
    saldoDespesa,
    totalPago,
    carregando,
    erro,
    recarregar,
    filtros,
    definirFiltros,
    temMaisReceitas,
    temMaisDespesas,
    carregandoMais,
    erroCarregarMais,
    carregarMaisReceitas,
    carregarMaisDespesas,
  } = useLancamentos()

  const semDados = receitas.length === 0 && despesas.length === 0

  return (
    <div className="mx-auto min-h-svh max-w-xl px-4 pb-36">
      {carregando && semDados ? (
        <EstadoCarregandoExtrato />
      ) : erro && semDados ? (
        <EstadoErro tentarNovamente={recarregar} />
      ) : (
        <>
          <div className="mt-6 grid grid-cols-3 gap-3">
            <SaldoCard titulo="Receita" valor={saldoReceita} />
            <SaldoCard titulo="Despesa" valor={saldoDespesa} />
            <SaldoCard
              titulo="Total Pago"
              valor={totalPago}
              subtitulo={`Falta ${formatarMoeda(saldoDespesa - totalPago)}`}
            />
          </div>

          <div className="mt-6 flex flex-col gap-4">
            <FiltrosLancamentos
              mes={filtros.mes}
              busca={filtros.busca}
              onChange={definirFiltros}
            />
            <ExtratoLista
              receitas={receitas}
              despesas={despesas}
              abaInicial={aba}
              temMaisReceitas={temMaisReceitas}
              temMaisDespesas={temMaisDespesas}
              carregandoMais={carregandoMais}
              erroCarregarMais={erroCarregarMais}
              onCarregarMaisReceitas={() => void carregarMaisReceitas()}
              onCarregarMaisDespesas={() => void carregarMaisDespesas()}
            />
          </div>

          <RegistrarFab />
        </>
      )}
    </div>
  )
}
