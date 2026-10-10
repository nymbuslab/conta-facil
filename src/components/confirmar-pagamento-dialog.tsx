import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatarData, formatarMoeda } from '@/lib/formatters'
import type { Despesa } from '@/types/lancamento'

interface ConfirmarPagamentoDialogProps {
  despesa: Despesa | null
  erro?: string | null
  onCancelar: () => void
  onConfirmar: (id: string) => void
}

export function ConfirmarPagamentoDialog({
  despesa,
  erro,
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
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">{despesa.descricao}</p>
            <p className="text-sm text-muted-foreground">
              Venc. {formatarData(despesa.vencimento)} · {formatarMoeda(despesa.valor)}
            </p>
          </div>
        )}
        {erro && <p className="text-sm text-destructive">{erro}</p>}
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
