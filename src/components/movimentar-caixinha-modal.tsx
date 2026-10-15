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
import { cn } from '@/lib/utils'
import { useCaixinhas } from '@/state/caixinhas-context'
import {
  depositarCaixinhaSchema,
  movimentarCaixinhaSchema,
  type Caixinha,
  type DepositarCaixinhaFormValues,
} from '@/types/caixinha'

interface MovimentarCaixinhaModalProps {
  caixinha: Caixinha | null
  tipo: 'depositar' | 'resgatar'
  onOpenChange: (open: boolean) => void
  /** Chamado so quando a movimentacao e confirmada com sucesso. A tela de caixinhas usa isso
   * para recarregar o saldo do mes apos um deposito "de_fora" (a receita vinculada muda
   * saldoReceita, que o contexto de caixinhas nao conhece). */
  onSucesso?: (info: { tipo: 'depositar' | 'resgatar'; origem?: DepositarCaixinhaFormValues['origem'] }) => void
}

const OPCOES_ORIGEM = [
  { valor: 'saldo_atual' as const, titulo: 'Saldo atual', legenda: 'Já estava no seu saldo do mês' },
  { valor: 'de_fora' as const, titulo: 'Dinheiro de fora', legenda: 'Entrou agora, de outro banco ou em espécie' },
]

const valoresPadrao: DepositarCaixinhaFormValues = { valor: '', origem: 'saldo_atual' }

export function MovimentarCaixinhaModal({ caixinha, tipo, onOpenChange, onSucesso }: MovimentarCaixinhaModalProps) {
  const { depositar, resgatar } = useCaixinhas()
  const [erro, setErro] = useState<string | null>(null)
  const form = useForm<DepositarCaixinhaFormValues>({
    resolver: zodResolver(tipo === 'depositar' ? depositarCaixinhaSchema : movimentarCaixinhaSchema),
    defaultValues: valoresPadrao,
  })

  async function onSubmit(dados: DepositarCaixinhaFormValues) {
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
    onSucesso?.(tipo === 'depositar' ? { tipo, origem: dados.origem } : { tipo })
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
            {tipo === 'depositar' && (
              <FormField
                control={form.control}
                name="origem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>De onde veio esse dinheiro?</FormLabel>
                    <FormControl>
                      <div role="radiogroup" aria-label="De onde veio esse dinheiro?" className="space-y-2">
                        {OPCOES_ORIGEM.map((opcao) => {
                          const selecionada = field.value === opcao.valor
                          return (
                            <label
                              key={opcao.valor}
                              className={cn(
                                'flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors',
                                selecionada ? 'border-primary bg-primary/5' : 'border-input',
                              )}
                            >
                              <input
                                type="radio"
                                name={field.name}
                                value={opcao.valor}
                                checked={selecionada}
                                onChange={() => field.onChange(opcao.valor)}
                                className="mt-1 h-4 w-4 accent-primary"
                              />
                              <span>
                                <span className="block text-sm font-medium">{opcao.titulo}</span>
                                <span className="block text-xs text-muted-foreground">{opcao.legenda}</span>
                              </span>
                            </label>
                          )
                        })}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {erro && <p className="text-sm font-medium text-destructive">{erro}</p>}
            <DialogFooter>
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Confirmando...' : 'Confirmar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
