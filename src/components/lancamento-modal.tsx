import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'

import { CampoValor } from '@/components/campo-valor'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useLancamentos } from '@/state/lancamentos-context'
import {
  despesaFormSchema,
  receitaFormSchema,
  type DespesaFormValues,
  type ReceitaFormValues,
  type TipoLancamento,
} from '@/types/lancamento'

interface LancamentoModalProps {
  tipo: TipoLancamento | null
  onOpenChange: (open: boolean) => void
}

const valoresPadraoReceita: ReceitaFormValues = {
  dataEmissao: '',
  descricao: '',
  valor: '',
}

const valoresPadraoDespesa: DespesaFormValues = {
  descricao: '',
  valor: '',
  vencimento: '',
  parcelado: false,
  quantidadeParcelas: undefined,
}

export function LancamentoModal({ tipo, onOpenChange }: LancamentoModalProps) {
  return (
    <Dialog open={tipo !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {tipo === 'receita' && <FormularioReceita onOpenChange={onOpenChange} />}
        {tipo === 'despesa' && <FormularioDespesa onOpenChange={onOpenChange} />}
      </DialogContent>
    </Dialog>
  )
}

function FormularioReceita({ onOpenChange }: { onOpenChange: (open: boolean) => void }) {
  const { adicionarReceita } = useLancamentos()
  const form = useForm<ReceitaFormValues>({
    resolver: zodResolver(receitaFormSchema),
    defaultValues: valoresPadraoReceita,
  })

  function onSubmit(dados: ReceitaFormValues) {
    adicionarReceita(dados)
    form.reset(valoresPadraoReceita)
    onOpenChange(false)
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Nova receita</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="dataEmissao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de entrada</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="descricao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Salário mensal" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
          <DialogFooter>
            <Button type="submit" className="w-full">
              Registrar receita
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  )
}

function FormularioDespesa({ onOpenChange }: { onOpenChange: (open: boolean) => void }) {
  const { adicionarDespesa } = useLancamentos()
  const form = useForm<DespesaFormValues>({
    resolver: zodResolver(despesaFormSchema),
    defaultValues: valoresPadraoDespesa,
  })
  const parcelado = useWatch({ control: form.control, name: 'parcelado' })

  function onSubmit(dados: DespesaFormValues) {
    adicionarDespesa(dados)
    form.reset(valoresPadraoDespesa)
    onOpenChange(false)
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Nova despesa</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="descricao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Aluguel" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="parcelado"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-2 space-y-0">
                <FormControl>
                  <Checkbox
                    id="parcelado"
                    checked={field.value}
                    onCheckedChange={(marcado) => {
                      field.onChange(marcado)
                      if (!marcado) form.setValue('quantidadeParcelas', undefined)
                    }}
                  />
                </FormControl>
                <FormLabel htmlFor="parcelado" className="cursor-pointer">
                  Parcelado?
                </FormLabel>
              </FormItem>
            )}
          />
          {parcelado && (
            <FormField
              control={form.control}
              name="quantidadeParcelas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantidade de parcelas</FormLabel>
                  <FormControl>
                    <Input type="number" min="2" step="1" placeholder="Ex: 3" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <FormField
            control={form.control}
            name="valor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{parcelado ? 'Valor total da dívida' : 'Valor'}</FormLabel>
                <FormControl>
                  <CampoValor {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="vencimento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vencimento</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button type="submit" className="w-full">
              Registrar despesa
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  )
}
