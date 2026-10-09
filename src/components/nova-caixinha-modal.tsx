import { zodResolver } from '@hookform/resolvers/zod'
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
import { Input } from '@/components/ui/input'
import { useCaixinhas } from '@/state/caixinhas-context'
import { criarCaixinhaSchema, type CriarCaixinhaFormValues } from '@/types/caixinha'

interface NovaCaixinhaModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const valoresPadrao: CriarCaixinhaFormValues = {
  nome: '',
  meta: '',
}

export function NovaCaixinhaModal({ open, onOpenChange }: NovaCaixinhaModalProps) {
  const { criarCaixinha } = useCaixinhas()
  const form = useForm<CriarCaixinhaFormValues>({
    resolver: zodResolver(criarCaixinhaSchema),
    defaultValues: valoresPadrao,
  })

  function onSubmit(dados: CriarCaixinhaFormValues) {
    criarCaixinha(dados)
    form.reset(valoresPadrao)
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) form.reset(valoresPadrao)
        onOpenChange(open)
      }}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Nova caixinha</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Viagem" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="meta"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta</FormLabel>
                  <FormControl>
                    <CampoValor {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" className="w-full">
                Criar caixinha
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
