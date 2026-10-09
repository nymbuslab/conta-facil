import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatarMoeda } from '@/lib/formatters'
import type { Despesa } from '@/types/lancamento'

interface ConfirmarPagamentoDialogProps {
  despesa: Despesa | null
  onCancelar: () => void
  onConfirmar: (id: string) => void
}

export function ConfirmarPagamentoDialog({
  despesa,
  onCancelar,
  onConfirmar,
}: ConfirmarPagamentoDialogProps) {
  return (
    <Dialog open={despesa !== null} onOpenChange={(open) => !open && onCancelar()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Deseja marcar como paga?</DialogTitle>
        </DialogHeader>
        {despesa && (
          <p className="text-sm text-muted-foreground">
            <span>{despesa.descricao}</span> · <span>{formatarMoeda(despesa.valor)}</span>
          </p>
        )}
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={onCancelar} className="flex-1">
            Cancelar
          </Button>
          <Button
            onClick={() => despesa && onConfirmar(despesa.id)}
            className="flex-1"
          >
            Marcar como paga
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
