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
  dataEmissao: '',
  descricao: '',
  valor: '',
  vencimento: '',
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
                <FormLabel>Data de emissão</FormLabel>
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
            name="dataEmissao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de emissão</FormLabel>
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
                  <Input placeholder="Ex: Aluguel" {...field} />
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
