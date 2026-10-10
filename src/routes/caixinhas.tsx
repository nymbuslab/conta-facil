import { useState } from 'react'
import { createRoute } from '@tanstack/react-router'
import { Plus } from 'lucide-react'

import { CaixinhaCard } from '@/components/caixinha-card'
import { EstadoCarregando, EstadoErro } from '@/components/estado-dados'
import { ExcluirCaixinhaDialog } from '@/components/excluir-caixinha-dialog'
import { MovimentarCaixinhaModal } from '@/components/movimentar-caixinha-modal'
import { NovaCaixinhaModal } from '@/components/nova-caixinha-modal'
import { Button } from '@/components/ui/button'
import { useCaixinhas } from '@/state/caixinhas-context'
import { Route as rootRoute } from '@/routes/__root'
import type { Caixinha } from '@/types/caixinha'

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/caixinhas',
  component: TelaCaixinhas,
})

export function TelaCaixinhas() {
  const { caixinhas, excluirCaixinha, carregando, erro, recarregar } = useCaixinhas()
  const [novaCaixinhaAberta, setNovaCaixinhaAberta] = useState(false)
  const [movimentando, setMovimentando] = useState<{
    caixinha: Caixinha
    tipo: 'depositar' | 'resgatar'
  } | null>(null)
  const [excluindo, setExcluindo] = useState<Caixinha | null>(null)
  const [erroExclusao, setErroExclusao] = useState<string | null>(null)

  async function confirmarExclusao(id: string) {
    setErroExclusao(null)
    try {
      await excluirCaixinha(id)
      setExcluindo(null)
    } catch (falha) {
      setErroExclusao(falha instanceof Error ? falha.message : 'Não foi possível excluir a caixinha')
    }
  }

  return (
    <div className="mx-auto min-h-svh max-w-xl px-4 pb-36">
      <header className="flex items-center justify-between py-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          Caixinhas
        </h1>
        <Button size="sm" disabled={carregando || Boolean(erro)} onClick={() => setNovaCaixinhaAberta(true)}>
          <Plus className="size-4" aria-hidden="true" />
          Nova caixinha
        </Button>
      </header>

      {carregando ? (
        <EstadoCarregando />
      ) : erro ? (
        <EstadoErro tentarNovamente={recarregar} />
      ) : caixinhas.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border py-6 text-center text-sm text-muted-foreground">
          Nenhuma caixinha ainda.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {caixinhas.map((caixinha) => (
            <CaixinhaCard
              key={caixinha.id}
              caixinha={caixinha}
              onDepositar={(c) => setMovimentando({ caixinha: c, tipo: 'depositar' })}
              onResgatar={(c) => setMovimentando({ caixinha: c, tipo: 'resgatar' })}
              onExcluir={(c) => setExcluindo(c)}
            />
          ))}
        </div>
      )}

      <NovaCaixinhaModal open={novaCaixinhaAberta} onOpenChange={setNovaCaixinhaAberta} />
      <MovimentarCaixinhaModal
        caixinha={movimentando?.caixinha ?? null}
        tipo={movimentando?.tipo ?? 'depositar'}
        onOpenChange={(open) => !open && setMovimentando(null)}
      />
      <ExcluirCaixinhaDialog
        caixinha={excluindo}
        erro={erroExclusao}
        onCancelar={() => {
          setExcluindo(null)
          setErroExclusao(null)
        }}
        onConfirmar={confirmarExclusao}
      />
    </div>
  )
}
