import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
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
import { mensagemErroApi } from '@/lib/api-client'
import { formatarData, formatarMoeda } from '@/lib/formatters'
import { useLancamentos } from '@/state/lancamentos-context'
import {
  despesaFormSchema,
  receitaFormSchema,
  type DespesaFormValues,
  type ReceitaFormValues,
} from '@/types/lancamento'
import type { Lancamento } from '@/types/lancamento'

type Alcance = 'somente' | 'futuras'
type Tela = 'menu' | 'pagar' | 'alcance' | 'editar' | 'excluir'

interface AcoesLancamentoDialogProps {
  lancamento: Lancamento | null
  onOpenChange: (open: boolean) => void
}

/** Diálogo único que abre ao clicar numa linha de lançamento: substitui o antigo
 * ConfirmarPagamentoDialog, oferecendo marcar como paga (quando aplicável), editar e excluir
 * no mesmo lugar (D-06). */
export function AcoesLancamentoDialog({ lancamento, onOpenChange }: AcoesLancamentoDialogProps) {
  const { marcarComoPaga, editarReceita, editarDespesa, excluirLancamento } = useLancamentos()
  const [tela, setTela] = useState<Tela>('menu')
  const [acaoPendente, setAcaoPendente] = useState<'editar' | 'excluir' | null>(null)
  const [alcance, setAlcance] = useState<Alcance>('somente')
  const [processando, setProcessando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (lancamento) {
      setTela('menu')
      setAcaoPendente(null)
      setAlcance('somente')
      setErro(null)
    }
  }, [lancamento?.id])

  function fechar() {
    if (processando) return
    onOpenChange(false)
  }

  function escolher(acao: 'editar' | 'excluir') {
    setErro(null)
    if (lancamento?.tipo === 'despesa' && lancamento.parcelamentoId) {
      setAcaoPendente(acao)
      setTela('alcance')
      return
    }
    setTela(acao)
  }

  function confirmarAlcance(escolhido: Alcance) {
    setAlcance(escolhido)
    if (acaoPendente) setTela(acaoPendente)
  }

  async function confirmarPagamento() {
    if (!lancamento) return
    setErro(null)
    setProcessando(true)
    try {
      await marcarComoPaga(lancamento.id)
      onOpenChange(false)
    } catch (falha) {
      setErro(mensagemErroApi(falha, 'Não foi possível marcar como paga'))
    } finally {
      setProcessando(false)
    }
  }

  async function confirmarExclusao() {
    if (!lancamento) return
    setErro(null)
    setProcessando(true)
    try {
      await excluirLancamento(lancamento.id, lancamento.tipo, alcance)
      onOpenChange(false)
    } catch (falha) {
      setErro(mensagemErroApi(falha, 'Não foi possível excluir'))
    } finally {
      setProcessando(false)
    }
  }

  async function salvarEdicao(dados: ReceitaFormValues | DespesaFormValues) {
    if (!lancamento) return
    setErro(null)
    try {
      if (lancamento.tipo === 'receita') {
        await editarReceita(lancamento.id, dados as ReceitaFormValues)
      } else {
        await editarDespesa(lancamento.id, { ...(dados as DespesaFormValues), alcance })
      }
      onOpenChange(false)
    } catch (falha) {
      setErro(mensagemErroApi(falha, 'Não foi possível salvar a edição'))
      throw falha
    }
  }

  return (
    <Dialog open={lancamento !== null} onOpenChange={(open) => !open && fechar()}>
      <DialogContent className="sm:max-w-sm">
        {lancamento && tela === 'menu' && (
          <TelaMenu
            lancamento={lancamento}
            erro={erro}
            onPagar={() => setTela('pagar')}
            onEditar={() => escolher('editar')}
            onExcluir={() => escolher('excluir')}
            onFechar={fechar}
          />
        )}
        {lancamento && tela === 'alcance' && (
          <TelaAlcance
            lancamento={lancamento}
            acao={acaoPendente}
            onEscolher={confirmarAlcance}
            onVoltar={() => setTela('menu')}
          />
        )}
        {lancamento && tela === 'pagar' && (
          <TelaPagar
            lancamento={lancamento}
            erro={erro}
            processando={processando}
            onCancelar={() => setTela('menu')}
            onConfirmar={confirmarPagamento}
          />
        )}
        {lancamento && tela === 'editar' && (
          <TelaEditar lancamento={lancamento} erro={erro} onCancelar={() => setTela('menu')} onSalvar={salvarEdicao} />
        )}
        {lancamento && tela === 'excluir' && (
          <TelaExcluir
            lancamento={lancamento}
            erro={erro}
            processando={processando}
            onCancelar={() => setTela('menu')}
            onConfirmar={confirmarExclusao}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function TelaMenu({
  lancamento,
  erro,
  onPagar,
  onEditar,
  onExcluir,
  onFechar,
}: {
  lancamento: Lancamento
  erro: string | null
  onPagar: () => void
  onEditar: () => void
  onExcluir: () => void
  onFechar: () => void
}) {
  const podeMarcarComoPaga = lancamento.tipo === 'despesa' && !lancamento.paga
  const despesaJaPaga = lancamento.tipo === 'despesa' && lancamento.paga

  return (
    <>
      <DialogHeader>
        <DialogTitle>{lancamento.descricao}</DialogTitle>
      </DialogHeader>
      <p className="text-sm text-muted-foreground">
        {lancamento.tipo === 'receita'
          ? `Entrada em ${formatarData(lancamento.dataEmissao)} · ${formatarMoeda(lancamento.valor)}`
          : `Venc. ${formatarData(lancamento.vencimento)} · ${formatarMoeda(lancamento.valor)}`}
      </p>
      {despesaJaPaga && (
        <p className="text-sm text-muted-foreground">
          Essa despesa já foi paga. Editar ou excluir muda o card Total Pago.
        </p>
      )}
      {erro && <p className="text-sm text-destructive">{erro}</p>}
      <div className="flex flex-col gap-2">
        {podeMarcarComoPaga && (
          <Button type="button" onClick={onPagar}>
            Marcar como paga
          </Button>
        )}
        <Button type="button" variant="secondary" onClick={onEditar}>
          Editar
        </Button>
        <Button type="button" variant="destructive" onClick={onExcluir}>
          Excluir
        </Button>
        <Button type="button" variant="outline" onClick={onFechar}>
          Cancelar
        </Button>
      </div>
    </>
  )
}

function TelaAlcance({
  lancamento,
  acao,
  onEscolher,
  onVoltar,
}: {
  lancamento: Lancamento
  acao: 'editar' | 'excluir' | null
  onEscolher: (alcance: Alcance) => void
  onVoltar: () => void
}) {
  const verbo = acao === 'excluir' ? 'Excluir' : 'Editar'
  return (
    <>
      <DialogHeader>
        <DialogTitle>{verbo} só esta parcela ou esta e as futuras?</DialogTitle>
      </DialogHeader>
      <p className="text-sm text-muted-foreground">
        {lancamento.tipo === 'despesa' && lancamento.parcelaAtual && lancamento.totalParcelas
          ? `Parcela ${lancamento.parcelaAtual} de ${lancamento.totalParcelas}.`
          : null}
      </p>
      <div className="flex flex-col gap-2">
        <Button type="button" variant="secondary" onClick={() => onEscolher('somente')}>
          Só esta parcela
        </Button>
        <Button type="button" variant="secondary" onClick={() => onEscolher('futuras')}>
          Esta e as futuras
        </Button>
        <Button type="button" variant="outline" onClick={onVoltar}>
          Voltar
        </Button>
      </div>
    </>
  )
}

function TelaPagar({
  lancamento,
  erro,
  processando,
  onCancelar,
  onConfirmar,
}: {
  lancamento: Lancamento
  erro: string | null
  processando: boolean
  onCancelar: () => void
  onConfirmar: () => void
}) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Deseja marcar como paga?</DialogTitle>
      </DialogHeader>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{lancamento.descricao}</p>
        {lancamento.tipo === 'despesa' && (
          <p className="text-sm text-muted-foreground">
            Venc. {formatarData(lancamento.vencimento)} · {formatarMoeda(lancamento.valor)}
          </p>
        )}
      </div>
      {erro && <p className="text-sm text-destructive">{erro}</p>}
      <DialogFooter className="gap-2 sm:gap-2">
        <Button variant="outline" onClick={onCancelar} className="flex-1" disabled={processando}>
          Cancelar
        </Button>
        <Button onClick={onConfirmar} className="flex-1" disabled={processando}>
          {processando ? 'Marcando...' : 'Marcar como paga'}
        </Button>
      </DialogFooter>
    </>
  )
}

function TelaExcluir({
  lancamento,
  erro,
  processando,
  onCancelar,
  onConfirmar,
}: {
  lancamento: Lancamento
  erro: string | null
  processando: boolean
  onCancelar: () => void
  onConfirmar: () => void
}) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Excluir "{lancamento.descricao}"?</DialogTitle>
      </DialogHeader>
      <p className="text-sm text-muted-foreground">Essa ação não pode ser desfeita.</p>
      {erro && <p className="text-sm text-destructive">{erro}</p>}
      <DialogFooter className="gap-2 sm:gap-2">
        <Button variant="outline" onClick={onCancelar} className="flex-1" disabled={processando}>
          Cancelar
        </Button>
        <Button variant="destructive" onClick={onConfirmar} className="flex-1" disabled={processando}>
          {processando ? 'Excluindo...' : 'Excluir'}
        </Button>
      </DialogFooter>
    </>
  )
}

function TelaEditar({
  lancamento,
  erro,
  onCancelar,
  onSalvar,
}: {
  lancamento: Lancamento
  erro: string | null
  onCancelar: () => void
  onSalvar: (dados: ReceitaFormValues | DespesaFormValues) => Promise<void>
}) {
  if (lancamento.tipo === 'receita') {
    return <FormularioEditarReceita lancamento={lancamento} erro={erro} onCancelar={onCancelar} onSalvar={onSalvar} />
  }
  return <FormularioEditarDespesa lancamento={lancamento} erro={erro} onCancelar={onCancelar} onSalvar={onSalvar} />
}

function FormularioEditarReceita({
  lancamento,
  erro,
  onCancelar,
  onSalvar,
}: {
  lancamento: Extract<Lancamento, { tipo: 'receita' }>
  erro: string | null
  onCancelar: () => void
  onSalvar: (dados: ReceitaFormValues) => Promise<void>
}) {
  const form = useForm<ReceitaFormValues>({
    resolver: zodResolver(receitaFormSchema),
    defaultValues: {
      descricao: lancamento.descricao,
      valor: formatarMoeda(lancamento.valor).replace(/^R\$\s?/, ''),
      dataEmissao: lancamento.dataEmissao,
    },
  })

  async function onSubmit(dados: ReceitaFormValues) {
    try {
      await onSalvar(dados)
    } catch {
      // erro ja exibido pelo chamador
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Editar receita</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {erro && <p className="text-sm text-destructive">{erro}</p>}
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
                  <Input {...field} />
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
          <DialogFooter className="gap-2 sm:gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onCancelar} disabled={form.formState.isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  )
}

function FormularioEditarDespesa({
  lancamento,
  erro,
  onCancelar,
  onSalvar,
}: {
  lancamento: Extract<Lancamento, { tipo: 'despesa' }>
  erro: string | null
  onCancelar: () => void
  onSalvar: (dados: DespesaFormValues) => Promise<void>
}) {
  const form = useForm<DespesaFormValues>({
    resolver: zodResolver(despesaFormSchema),
    defaultValues: {
      descricao: lancamento.descricao,
      valor: formatarMoeda(lancamento.valor).replace(/^R\$\s?/, ''),
      vencimento: lancamento.vencimento,
      parcelado: false,
      quantidadeParcelas: undefined,
    },
  })

  async function onSubmit(dados: DespesaFormValues) {
    try {
      await onSalvar(dados)
    } catch {
      // erro ja exibido pelo chamador
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Editar despesa</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {erro && <p className="text-sm text-destructive">{erro}</p>}
          <FormField
            control={form.control}
            name="descricao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Input {...field} />
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
          <DialogFooter className="gap-2 sm:gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onCancelar} disabled={form.formState.isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  )
}
