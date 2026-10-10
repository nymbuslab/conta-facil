import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { CampoValor } from '@/components/campo-valor'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useCaixinhas } from '@/state/caixinhas-context'
import {
  movimentarCaixinhaSchema,
  type Caixinha,
  type MovimentarCaixinhaFormValues,
} from '@/types/caixinha'

interface MovimentarCaixinhaModalProps {
  caixinha: Caixinha | null
  tipo: 'depositar' | 'resgatar'
  onOpenChange: (open: boolean) => void
}

const valoresPadrao: MovimentarCaixinhaFormValues = { valor: '' }

export function MovimentarCaixinhaModal({ caixinha, tipo, onOpenChange }: MovimentarCaixinhaModalProps) {
  const { depositar, resgatar } = useCaixinhas()
  const [erro, setErro] = useState<string | null>(null)
  const form = useForm<MovimentarCaixinhaFormValues>({
    resolver: zodResolver(movimentarCaixinhaSchema),
    defaultValues: valoresPadrao,
  })

  async function onSubmit(dados: MovimentarCaixinhaFormValues) {
    if (!caixinha) return
    const acao = tipo === 'depositar' ? depositar : resgatar
    const resultado = await acao(caixinha.id, dados)

    if (!resultado.sucesso) {
      setErro(resultado.erro ?? 'Não foi possível concluir a operação')
      return
    }

    setErro(null)
    form.reset(valoresPadrao)
    onOpenChange(false)
  }

  return (
    <Dialog
      open={caixinha !== null}
      onOpenChange={(open) => {
        if (!open) {
          setErro(null)
          form.reset(valoresPadrao)
        }
        onOpenChange(open)
      }}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{tipo === 'depositar' ? 'Depositar' : 'Resgatar'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="valor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor</FormLabel>
                  <FormControl>
                    <CampoValor {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {erro && <p className="text-sm font-medium text-destructive">{erro}</p>}
            <DialogFooter>
              <Button type="submit" className="w-full">
                Confirmar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
