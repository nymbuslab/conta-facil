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
import type { Caixinha, CriarCaixinhaFormValues, MovimentarCaixinhaFormValues } from '@/types/caixinha'

import { useAuth } from './auth-context'

interface ResultadoMovimentacao {
  sucesso: boolean
  erro?: string
}

interface CaixinhasContextValue {
  caixinhas: Caixinha[]
  totalGuardado: number
  carregando: boolean
  erro: string | null
  recarregar: () => Promise<void>
  criarCaixinha: (dados: CriarCaixinhaFormValues) => Promise<void>
  depositar: (id: string, dados: MovimentarCaixinhaFormValues) => Promise<ResultadoMovimentacao>
  resgatar: (id: string, dados: MovimentarCaixinhaFormValues) => Promise<ResultadoMovimentacao>
  excluirCaixinha: (id: string) => Promise<void>
}

type CaixinhaApi = {
  id: string
  nome: string
  valorGuardado: number
  meta: number
}

const CaixinhasContext = createContext<CaixinhasContextValue | null>(null)

function arredondar(valor: number) {
  return Math.round(valor * 100) / 100
}

function paraCaixinha(item: CaixinhaApi): Caixinha {
  return {
    id: item.id,
    nome: item.nome,
    valorGuardado: item.valorGuardado / 100,
    meta: item.meta / 100,
  }
}

function mensagemErro(falha: unknown) {
  return falha instanceof Error ? falha.message : 'Nao foi possivel carregar as caixinhas'
}

export function CaixinhasProvider({
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
  const [caixinhas, setCaixinhas] = useState<Caixinha[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  /** Descarta respostas de uma sessao/usuario que ja nao e o atual: ver mesma nota em
   * lancamentos-context.tsx. */
  const geracaoAtualRef = useRef(0)

  const recarregar = useCallback(async () => {
    const minhaGeracao = ++geracaoAtualRef.current
    setCarregando(true)
    setErro(null)
    setCaixinhas([])
    try {
      const dados = await clienteAtual.get<CaixinhaApi[]>('/caixinhas')
      if (geracaoAtualRef.current !== minhaGeracao) return
      setCaixinhas(dados.map(paraCaixinha))
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
      setCaixinhas([])
      setErro(null)
      setCarregando(status === 'carregando')
      return
    }
    void recarregar()
  }, [recarregar, status, usuario?.id])

  const totalGuardado = useMemo(
    () => arredondar(caixinhas.reduce((soma, item) => soma + item.valorGuardado, 0)),
    [caixinhas],
  )

  async function criarCaixinha(dados: CriarCaixinhaFormValues) {
    const meta = parseValorMonetario(dados.meta)
    if (meta === null) return
    const criada = await clienteAtual.post<CaixinhaApi>('/caixinhas', {
      nome: dados.nome,
      meta: Math.round(meta * 100),
    })
    setCaixinhas((atuais) => [...atuais, paraCaixinha(criada)])
  }

  async function movimentar(
    id: string,
    dados: MovimentarCaixinhaFormValues,
    tipo: 'depositar' | 'resgatar',
  ): Promise<ResultadoMovimentacao> {
    const valor = parseValorMonetario(dados.valor)
    if (valor === null) return { sucesso: false, erro: 'Informe um valor valido' }
    try {
      const atualizada = await clienteAtual.postIdempotente<CaixinhaApi>(`/caixinhas/${id}/${tipo}`, {
        valor: Math.round(valor * 100),
      })
      const caixinha = paraCaixinha(atualizada)
      setCaixinhas((atuais) => atuais.map((item) => item.id === id ? caixinha : item))
      return { sucesso: true }
    } catch (falha) {
      // Erro de mutacao fica so no resultado devolvido ao modal: setErro aqui tomaria o
      // mesmo estado da falha de CARREGAMENTO da pagina e trocaria a lista inteira por
      // EstadoErro mesmo num caso esperado como saldo insuficiente.
      return { sucesso: false, erro: mensagemErro(falha) }
    }
  }

  function depositar(id: string, dados: MovimentarCaixinhaFormValues) {
    return movimentar(id, dados, 'depositar')
  }

  function resgatar(id: string, dados: MovimentarCaixinhaFormValues) {
    return movimentar(id, dados, 'resgatar')
  }

  async function excluirCaixinha(id: string) {
    await clienteAtual.delete(`/caixinhas/${id}`)
    setCaixinhas((atuais) => atuais.filter((item) => item.id !== id))
  }

  return (
    <CaixinhasContext.Provider value={{
      caixinhas,
      totalGuardado,
      carregando,
      erro,
      recarregar,
      criarCaixinha,
      depositar,
      resgatar,
      excluirCaixinha,
    }}>
      {children}
    </CaixinhasContext.Provider>
  )
}

export function useCaixinhas() {
  const context = useContext(CaixinhasContext)
  if (!context) throw new Error('useCaixinhas deve ser usado dentro de CaixinhasProvider')
  return context
}
