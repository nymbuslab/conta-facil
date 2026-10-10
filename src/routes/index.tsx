import { useMemo } from 'react'
import { createRoute } from '@tanstack/react-router'

import { Header } from '@/components/header'
import { EstadoCarregando, EstadoErro } from '@/components/estado-dados'
import { ListaLancamentos } from '@/components/lista-lancamentos'
import { RegistrarFab } from '@/components/registrar-fab'
import { SaldoAcumuladoBar } from '@/components/saldo-acumulado-bar'
import { SaldoCard } from '@/components/saldo-card'
import { useSaldoAcumulado } from '@/hooks/use-saldo-acumulado'
import { ehMesVigente } from '@/lib/datas'
import { useCaixinhas } from '@/state/caixinhas-context'
import { useLancamentos } from '@/state/lancamentos-context'
import { Route as rootRoute } from '@/routes/__root'

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: TelaPrincipal,
})

export function TelaPrincipal() {
  const {
    receitas,
    despesas,
    carregando: carregandoLancamentos,
    erro: erroLancamentos,
    recarregar: recarregarLancamentos,
  } = useLancamentos()
  const {
    totalGuardado,
    carregando: carregandoCaixinhas,
    erro: erroCaixinhas,
    recarregar: recarregarCaixinhas,
  } = useCaixinhas()

  const receitasDoMes = useMemo(() => receitas.filter((r) => ehMesVigente(r.dataEmissao)), [receitas])
  const despesasDoMes = useMemo(() => despesas.filter((d) => ehMesVigente(d.vencimento)), [despesas])

  const { saldoReceita, saldoDespesa, saldoAcumulado } = useSaldoAcumulado(receitasDoMes, despesasDoMes)
  const carregando = carregandoLancamentos || carregandoCaixinhas
  const erro = erroLancamentos ?? erroCaixinhas

  async function tentarNovamente() {
    await Promise.all([recarregarLancamentos(), recarregarCaixinhas()])
  }

  return (
    <div className="mx-auto min-h-svh max-w-xl px-4 pb-36">
      <Header />
      {carregando ? (
        <EstadoCarregando />
      ) : erro ? (
        <EstadoErro tentarNovamente={tentarNovamente} />
      ) : (
        <>
          <SaldoAcumuladoBar saldo={saldoAcumulado} />

          <div className="grid grid-cols-3 gap-3">
            <SaldoCard titulo="Receita" valor={saldoReceita} />
            <SaldoCard titulo="Despesa" valor={saldoDespesa} />
            <SaldoCard titulo="Guardado" valor={totalGuardado} />
          </div>

          <div className="mt-6">
            <ListaLancamentos receitas={receitasDoMes} despesas={despesasDoMes} />
          </div>

          <RegistrarFab />
        </>
      )}
    </div>
  )
}
