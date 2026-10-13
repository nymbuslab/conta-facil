import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

import { criarApiClient, type ApiClient } from '@/lib/api-client'
import { parseValorMonetario } from '@/lib/formatters'
import type { Despesa, DespesaFormValues, Lancamento, Receita, ReceitaFormValues } from '@/types/lancamento'

import { useAuth } from './auth-context'

interface LancamentosContextValue {
  lancamentos: Lancamento[]
  receitas: Receita[]
  despesas: Despesa[]
  saldoReceita: number
  saldoDespesa: number
  carregando: boolean
  erro: string | null
  recarregar: () => Promise<void>
  adicionarReceita: (dados: ReceitaFormValues) => Promise<void>
  adicionarDespesa: (dados: DespesaFormValues) => Promise<void>
  marcarComoPaga: (id: string) => Promise<void>
}

type LancamentoApi = {
  id: string
  tipo: 'receita' | 'despesa'
  descricao: string
  valor: number
  dataEmissao: string | null
  vencimento: string | null
  paga: boolean
  parcelamentoId: string | null
  parcelaAtual: number | null
  totalParcelas: number | null
}

const LancamentosContext = createContext<LancamentosContextValue | null>(null)

function arredondar(valor: number) {
  return Math.round(valor * 100) / 100
}

function mensagemErro(erro: unknown) {
  return erro instanceof Error ? erro.message : 'Nao foi possivel carregar os lancamentos'
}

function paraLancamento(item: LancamentoApi): Lancamento {
  if (item.tipo === 'receita') {
    return {
      id: item.id,
      tipo: 'receita',
      descricao: item.descricao,
      valor: item.valor / 100,
      dataEmissao: item.dataEmissao ?? '',
    }
  }

  return {
    id: item.id,
    tipo: 'despesa',
    descricao: item.descricao,
    valor: item.valor / 100,
    vencimento: item.vencimento ?? '',
    paga: item.paga,
    parcelamentoId: item.parcelamentoId,
    parcelaAtual: item.parcelaAtual,
    totalParcelas: item.totalParcelas,
  }
}

function ehReceita(lancamento: Lancamento): lancamento is Receita {
  return lancamento.tipo === 'receita'
}

function ehDespesa(lancamento: Lancamento): lancamento is Despesa {
  return lancamento.tipo === 'despesa'
}

export function LancamentosProvider({
  children,
  cliente,
}: {
  children: ReactNode
  cliente?: ApiClient
}) {
  const { obterToken, status, usuario } = useAuth()
  const clienteAtual = useMemo(
    () => cliente ?? criarApiClient({
      baseUrl: import.meta.env.VITE_NEON_FUNCTION_API_BASE_URL ?? '',
      obterToken,
    }),
    [cliente, obterToken],
  )
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  /** Descarta respostas de uma sessao/usuario que ja nao e o atual: sem isso, uma resposta
   * atrasada do usuario anterior poderia sobrescrever os dados do usuario que acabou de
   * entrar (troca de conta no mesmo navegador sem recarregar a pagina). */
  const geracaoAtualRef = useRef(0)

  const recarregar = useCallback(async () => {
    const minhaGeracao = ++geracaoAtualRef.current
    setCarregando(true)
    setErro(null)
    setLancamentos([])
    try {
      const dados = await clienteAtual.get<LancamentoApi[]>('/lancamentos')
      if (geracaoAtualRef.current !== minhaGeracao) return
      setLancamentos(dados.map(paraLancamento))
    } catch (falha) {
      if (geracaoAtualRef.current !== minhaGeracao) return
      setErro(mensagemErro(falha))
    } finally {
      if (geracaoAtualRef.current === minhaGeracao) setCarregando(false)
    }
  }, [clienteAtual])

  useEffect(() => {
    if (status !== 'autenticado') {
      geracaoAtualRef.current += 1
      setLancamentos([])
      setErro(null)
      setCarregando(status === 'carregando')
      return
    }
    void recarregar()
  }, [recarregar, status, usuario?.id])

  const receitas = useMemo(() => lancamentos.filter(ehReceita), [lancamentos])
  const despesas = useMemo(() => lancamentos.filter(ehDespesa), [lancamentos])
  const saldoReceita = useMemo(
    () => arredondar(receitas.reduce((soma, item) => soma + item.valor, 0)),
    [receitas],
  )
  const saldoDespesa = useMemo(
    () => arredondar(despesas.reduce((soma, item) => soma + item.valor, 0)),
    [despesas],
  )

  async function adicionarReceita(dados: ReceitaFormValues) {
    const valor = parseValorMonetario(dados.valor)
    if (valor === null) return
    const criados = await clienteAtual.postIdempotente<LancamentoApi[]>('/lancamentos', {
      tipo: 'receita',
      descricao: dados.descricao,
      valor: Math.round(valor * 100),
      dataEmissao: dados.dataEmissao,
    })
    setLancamentos((atuais) => [...atuais, ...criados.map(paraLancamento)])
  }

  async function adicionarDespesa(dados: DespesaFormValues) {
    const valor = parseValorMonetario(dados.valor)
    if (valor === null) return
    const criados = await clienteAtual.postIdempotente<LancamentoApi[]>('/lancamentos', {
      tipo: 'despesa',
      descricao: dados.descricao,
      valor: Math.round(valor * 100),
      vencimento: dados.vencimento,
      parcelado: dados.parcelado,
      quantidadeParcelas: dados.quantidadeParcelas,
    })
    setLancamentos((atuais) => [...atuais, ...criados.map(paraLancamento)])
  }

  async function marcarComoPaga(id: string) {
    const atualizado = paraLancamento(
      await clienteAtual.patch<LancamentoApi>(`/lancamentos/${id}/pagar`),
    )
    setLancamentos((atuais) => atuais.map((item) => item.id === id ? atualizado : item))
  }

  return (
    <LancamentosContext.Provider value={{
      lancamentos,
      receitas,
      despesas,
      saldoReceita,
      saldoDespesa,
      carregando,
      erro,
      recarregar,
      adicionarReceita,
      adicionarDespesa,
      marcarComoPaga,
    }}>
      {children}
    </LancamentosContext.Provider>
  )
}

export function useLancamentos() {
  const context = useContext(LancamentosContext)
  if (!context) throw new Error('useLancamentos deve ser usado dentro de LancamentosProvider')
  return context
}
