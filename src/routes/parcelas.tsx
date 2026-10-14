import { useEffect } from 'react'
import { createRoute } from '@tanstack/react-router'

import { BotaoCarregarMais } from '@/components/botao-carregar-mais'
import { ParcelaCard } from '@/components/parcela-card'
import { EstadoCarregandoParcelas, EstadoErro } from '@/components/estado-dados'
import { useLancamentos } from '@/state/lancamentos-context'
import { Route as rootRoute } from '@/routes/__root'

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/parcelas',
  component: TelaParcelas,
})

export function TelaParcelas() {
  const {
    parcelamentos,
    carregandoParcelamentos,
    erroParcelamentos,
    temMaisParcelamentos,
    carregandoMaisParcelamentos,
    carregarParcelamentos,
    carregarMaisParcelamentos,
    versaoParcelamentos,
  } = useLancamentos()

  // Carrega ao entrar e recarrega quando um parcelamento e criado ou pago em outra tela.
  useEffect(() => {
    void carregarParcelamentos()
  }, [carregarParcelamentos, versaoParcelamentos])

  return (
    <div className="mx-auto min-h-svh max-w-xl px-4 pb-36">
      <header className="py-6 text-center">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          Parcelas
        </h1>
      </header>

      {carregandoParcelamentos && parcelamentos.length === 0 ? (
        <EstadoCarregandoParcelas />
      ) : erroParcelamentos && parcelamentos.length === 0 ? (
        <EstadoErro tentarNovamente={carregarParcelamentos} />
      ) : parcelamentos.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border py-6 text-center text-sm text-muted-foreground">
          Nenhuma compra parcelada ainda.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {parcelamentos.map((grupo) => (
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

          {temMaisParcelamentos && (
            <BotaoCarregarMais
              carregando={carregandoMaisParcelamentos}
              onClick={() => void carregarMaisParcelamentos()}
            />
          )}

          {erroParcelamentos && (
            <p role="alert" className="text-center text-sm text-destructive">
              {erroParcelamentos}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
