import { createRoute } from '@tanstack/react-router'

import { Header } from '@/components/header'
import { ListaLancamentos } from '@/components/lista-lancamentos'
import { RegistrarFab } from '@/components/registrar-fab'
import { SaldoAcumuladoBar } from '@/components/saldo-acumulado-bar'
import { SaldoCard } from '@/components/saldo-card'
import { LancamentosProvider, useLancamentos } from '@/state/lancamentos-context'
import { Route as rootRoute } from '@/routes/__root'

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => (
    <LancamentosProvider>
      <TelaPrincipal />
    </LancamentosProvider>
  ),
})

function TelaPrincipal() {
  const { receitas, despesas, saldoReceita, saldoDespesa, saldoAcumulado } = useLancamentos()

  return (
    <div className="mx-auto min-h-svh max-w-xl px-4 pb-28">
      <Header />
      <SaldoAcumuladoBar saldo={saldoAcumulado} />

      <div className="grid grid-cols-2 gap-4">
        <SaldoCard titulo="Receita" valor={saldoReceita} />
        <SaldoCard titulo="Despesa" valor={saldoDespesa} />
      </div>

      <div className="mt-6">
        <ListaLancamentos receitas={receitas} despesas={despesas} />
      </div>

      <RegistrarFab />
    </div>
  )
}
