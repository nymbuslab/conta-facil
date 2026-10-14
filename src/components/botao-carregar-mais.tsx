import { Button } from '@/components/ui/button'

interface BotaoCarregarMaisProps {
  carregando: boolean
  onClick: () => void
}

/** Botao de "Carregar mais" usado nas listas paginadas. Enquanto busca a proxima pagina fica
 * desabilitado e anuncia o progresso, evitando toque duplo e dando sinal de que algo acontece. */
export function BotaoCarregarMais({ carregando, onClick }: BotaoCarregarMaisProps) {
  return (
    <div className="flex justify-center pt-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onClick}
        disabled={carregando}
        aria-busy={carregando}
      >
        {carregando ? 'Carregando...' : 'Carregar mais'}
      </Button>
    </div>
  )
}
