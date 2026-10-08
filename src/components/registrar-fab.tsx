import { useState } from 'react'
import { ArrowDownRight, ArrowUpRight, Plus, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { LancamentoModal } from '@/components/lancamento-modal'
import type { TipoLancamento } from '@/types/lancamento'

export function RegistrarFab() {
  const [aberto, setAberto] = useState(false)
  const [tipoModal, setTipoModal] = useState<TipoLancamento | null>(null)

  function abrirModal(tipo: TipoLancamento) {
    setTipoModal(tipo)
    setAberto(false)
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 flex flex-col items-end gap-2">
        {aberto && (
          <div className="flex flex-col items-end gap-2 animate-speed-dial-in">
            <Button
              variant="secondary"
              className="gap-2 shadow-sm"
              onClick={() => abrirModal('receita')}
            >
              <ArrowUpRight className="size-4 text-success" />
              Receita
            </Button>
            <Button
              variant="secondary"
              className="gap-2 shadow-sm"
              onClick={() => abrirModal('despesa')}
            >
              <ArrowDownRight className="size-4 text-destructive" />
              Despesa
            </Button>
          </div>
        )}

        <Button
          size="icon"
          className="size-14 rounded-full shadow-md"
          onClick={() => setAberto((valor) => !valor)}
          aria-expanded={aberto}
          aria-label={aberto ? 'Fechar registrar lançamento' : 'Registrar lançamento'}
        >
          {aberto ? <X className="size-5" /> : <Plus className="size-5" />}
        </Button>
      </div>

      <LancamentoModal tipo={tipoModal} onOpenChange={(open) => !open && setTipoModal(null)} />
    </>
  )
}
