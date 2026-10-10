import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatarMoeda } from '@/lib/formatters'
import type { Caixinha } from '@/types/caixinha'

interface ExcluirCaixinhaDialogProps {
  caixinha: Caixinha | null
  erro?: string | null
  onCancelar: () => void
  onConfirmar: (id: string) => void | Promise<void>
}

export function ExcluirCaixinhaDialog({
  caixinha,
  erro,
  onCancelar,
  onConfirmar,
}: ExcluirCaixinhaDialogProps) {
  return (
    <Dialog open={caixinha !== null} onOpenChange={(open) => !open && onCancelar()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Excluir caixinha?</DialogTitle>
        </DialogHeader>
        {caixinha && (
          <p className="text-sm text-muted-foreground">
            {caixinha.valorGuardado > 0 ? (
              <>
                A caixinha <span className="font-medium text-foreground">{caixinha.nome}</span> tem{' '}
                <span className="font-medium text-foreground">{formatarMoeda(caixinha.valorGuardado)}</span>{' '}
                guardados. Ao excluir, esse valor volta para o saldo disponível.
              </>
            ) : (
              <>
                A caixinha <span className="font-medium text-foreground">{caixinha.nome}</span> será
                excluída.
              </>
            )}
          </p>
        )}
        {erro && <p className="text-sm text-destructive">{erro}</p>}
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={onCancelar} className="flex-1">
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={() => caixinha && onConfirmar(caixinha.id)}
            className="flex-1"
          >
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
