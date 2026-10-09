import { createRoute } from '@tanstack/react-router'

import { ParcelaCard } from '@/components/parcela-card'
import { agruparParcelamentos } from '@/lib/parcelamento'
import { useLancamentos } from '@/state/lancamentos-context'
import { Route as rootRoute } from '@/routes/__root'

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/parcelas',
  component: TelaParcelas,
})

export function TelaParcelas() {
  const { despesas } = useLancamentos()
  const grupos = agruparParcelamentos(despesas)

  return (
    <div className="mx-auto min-h-svh max-w-xl px-4 pb-36">
      <header className="py-6 text-center">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          Parcelas
        </h1>
      </header>

      {grupos.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border py-6 text-center text-sm text-muted-foreground">
          Nenhuma compra parcelada ainda.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {grupos.map((grupo) => (
            <ParcelaCard
              key={grupo.parcelamentoId}
              descricao={grupo.descricao}
              totalParcelas={grupo.totalParcelas}
              parcelasPagas={grupo.parcelasPagas}
              valorTotal={grupo.valorTotal}
              valorPago={grupo.valorPago}
              valorFalta={grupo.valorFalta}
            />
          ))}
        </div>
      )}
    </div>
  )
}
