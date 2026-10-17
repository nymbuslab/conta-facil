import { useEffect } from 'react'
import { createRoute } from '@tanstack/react-router'

import { CardContasVencendo } from '@/components/card-contas-vencendo'
import { CardUltimosLancamentos } from '@/components/card-ultimos-lancamentos'
import { Header } from '@/components/header'
import { EstadoCarregandoInicio, EstadoErro } from '@/components/estado-dados'
import { SaldoAcumuladoBar } from '@/components/saldo-acumulado-bar'
import { SaldoCard } from '@/components/saldo-card'
import { useSaldoAcumulado } from '@/hooks/use-saldo-acumulado'
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
    saldoReceita,
    saldoDespesa,
    carregando: carregandoLancamentos,
    erro: erroLancamentos,
    recarregar: recarregarLancamentos,
    contasVencendo,
    carregarContasVencendo,
    ultimosLancamentos,
    carregarUltimosLancamentos,
  } = useLancamentos()
  const {
    caixinhas,
    totalGuardado,
    carregando: carregandoCaixinhas,
    erro: erroCaixinhas,
    recarregar: recarregarCaixinhas,
  } = useCaixinhas()

  const { saldoAcumulado } = useSaldoAcumulado(saldoReceita, saldoDespesa)
  const carregando = carregandoLancamentos || carregandoCaixinhas
  const erro = erroLancamentos ?? erroCaixinhas
  // Skeleton so na primeira carga (sem nenhum dado ainda). Numa recarga com dados na tela,
  // mantem o conteudo visivel em vez de trocar tudo por blocos pulsantes.
  const semDados = receitas.length === 0 && despesas.length === 0 && caixinhas.length === 0

  useEffect(() => {
    void carregarContasVencendo()
    void carregarUltimosLancamentos()
  }, [carregarContasVencendo, carregarUltimosLancamentos])

  async function tentarNovamente() {
    await Promise.all([recarregarLancamentos(), recarregarCaixinhas()])
  }

  return (
    <div className="mx-auto min-h-svh max-w-xl px-4 pb-10">
      <Header />
      {carregando && semDados ? (
        <EstadoCarregandoInicio />
      ) : erro && semDados ? (
        <EstadoErro tentarNovamente={tentarNovamente} />
      ) : (
        <>
          <SaldoAcumuladoBar saldo={saldoAcumulado} />

          <div className="grid grid-cols-3 gap-3">
            <SaldoCard titulo="Receita" valor={saldoReceita} />
            <SaldoCard titulo="Despesa" valor={saldoDespesa} />
            <SaldoCard titulo="Guardado" valor={totalGuardado} />
          </div>

          <div className="mt-6 flex flex-col gap-4">
            <CardContasVencendo itens={contasVencendo} />
            <CardUltimosLancamentos itens={ultimosLancamentos} />
          </div>
        </>
      )}
    </div>
  )
}
