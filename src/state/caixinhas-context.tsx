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

import { criarApiClient, mensagemErroApi, type ApiClient } from '@/lib/api-client'
import { parseValorMonetario } from '@/lib/formatters'
import { montarUrl } from '@/lib/paginacao'
import type {
  Caixinha,
  CriarCaixinhaFormValues,
  DepositarCaixinhaFormValues,
  MovimentarCaixinhaFormValues,
} from '@/types/caixinha'

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
  temMais: boolean
  carregandoMais: boolean
  erroCarregarMais: string | null
  carregarMais: () => Promise<void>
  recarregar: () => Promise<void>
  criarCaixinha: (dados: CriarCaixinhaFormValues) => Promise<void>
  depositar: (id: string, dados: DepositarCaixinhaFormValues) => Promise<ResultadoMovimentacao>
  resgatar: (id: string, dados: MovimentarCaixinhaFormValues) => Promise<ResultadoMovimentacao>
  excluirCaixinha: (id: string) => Promise<void>
}

type CaixinhaApi = {
  id: string
  nome: string
  valorGuardado: number
  meta: number
}

interface PaginaCaixinhasApi {
  itens: CaixinhaApi[]
  proximoCursor: string | null
  totalGuardado: number
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
  const [totalGuardado, setTotalGuardado] = useState(0)
  const [cursor, setCursor] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [carregandoMais, setCarregandoMais] = useState(false)
  const [erroCarregarMais, setErroCarregarMais] = useState<string | null>(null)

  /** Descarta respostas de uma sessao/usuario que ja nao e o atual: ver mesma nota em
   * lancamentos-context.tsx. */
  const geracaoAtualRef = useRef(0)
  const cursorRef = useRef<string | null>(null)
  const carregandoMaisRef = useRef(false)

  const carregarPrimeiraPagina = useCallback(async () => {
    const minhaGeracao = ++geracaoAtualRef.current
    setCarregando(true)
    setErro(null)
    setErroCarregarMais(null)
    try {
      const pagina = await clienteAtual.get<PaginaCaixinhasApi>('/caixinhas')
      if (geracaoAtualRef.current !== minhaGeracao) return
      setCaixinhas(pagina.itens.map(paraCaixinha))
      setTotalGuardado(arredondar(pagina.totalGuardado / 100))
      cursorRef.current = pagina.proximoCursor
      setCursor(pagina.proximoCursor)
    } catch (falha) {
      if (geracaoAtualRef.current !== minhaGeracao) return
      setErro(mensagemErroApi(falha, 'Nao foi possivel carregar as caixinhas'))
    } finally {
      if (geracaoAtualRef.current === minhaGeracao) setCarregando(false)
    }
  }, [clienteAtual])

  const recarregar = carregarPrimeiraPagina

  const carregarMais = useCallback(async () => {
    const cursorAtual = cursorRef.current
    if (!cursorAtual || carregandoMaisRef.current) return

    const minhaGeracao = geracaoAtualRef.current
    carregandoMaisRef.current = true
    setCarregandoMais(true)
    setErroCarregarMais(null)
    try {
      const pagina = await clienteAtual.get<PaginaCaixinhasApi>(
        montarUrl('/caixinhas', { cursor: cursorAtual }),
      )
      if (geracaoAtualRef.current !== minhaGeracao) return
      setCaixinhas((atuais) => [...atuais, ...pagina.itens.map(paraCaixinha)])
      setTotalGuardado(arredondar(pagina.totalGuardado / 100))
      cursorRef.current = pagina.proximoCursor
      setCursor(pagina.proximoCursor)
    } catch (falha) {
      if (geracaoAtualRef.current !== minhaGeracao) return
      setErroCarregarMais(mensagemErroApi(falha, 'Não foi possível carregar mais'))
    } finally {
      carregandoMaisRef.current = false
      if (geracaoAtualRef.current === minhaGeracao) setCarregandoMais(false)
    }
  }, [clienteAtual])

  useEffect(() => {
    if (status !== 'autenticado') {
      geracaoAtualRef.current += 1
      setCaixinhas([])
      setTotalGuardado(0)
      cursorRef.current = null
      setCursor(null)
      setErro(null)
      setErroCarregarMais(null)
      setCarregando(status === 'carregando')
      return
    }
    void carregarPrimeiraPagina()
  }, [carregarPrimeiraPagina, status, usuario?.id])

  function ajustarTotal(delta: number) {
    if (delta === 0) return
    setTotalGuardado((atual) => arredondar(atual + delta))
  }

  async function criarCaixinha(dados: CriarCaixinhaFormValues) {
    const meta = parseValorMonetario(dados.meta)
    if (meta === null) return
    const criada = await clienteAtual.post<CaixinhaApi>('/caixinhas', {
      nome: dados.nome,
      meta: Math.round(meta * 100),
    })
    // Caixinha nova entra com valorGuardado zero: o total guardado nao muda.
    setCaixinhas((atuais) => [...atuais, paraCaixinha(criada)])
  }

  async function movimentar(
    id: string,
    dados: MovimentarCaixinhaFormValues | DepositarCaixinhaFormValues,
    tipo: 'depositar' | 'resgatar',
  ): Promise<ResultadoMovimentacao> {
    const valor = parseValorMonetario(dados.valor)
    if (valor === null) return { sucesso: false, erro: 'Informe um valor valido' }
    try {
      const corpo: { valor: number; origem?: string } = { valor: Math.round(valor * 100) }
      if (tipo === 'depositar' && 'origem' in dados) corpo.origem = dados.origem
      const atualizada = await clienteAtual.postIdempotente<CaixinhaApi>(`/caixinhas/${id}/${tipo}`, corpo)
      const caixinha = paraCaixinha(atualizada)
      const anterior = caixinhas.find((item) => item.id === id)
      setCaixinhas((atuais) => atuais.map((item) => (item.id === id ? caixinha : item)))
      if (anterior) ajustarTotal(caixinha.valorGuardado - anterior.valorGuardado)
      return { sucesso: true }
    } catch (falha) {
      // Erro de mutacao fica so no resultado devolvido ao modal: setErro aqui tomaria o
      // mesmo estado da falha de CARREGAMENTO da pagina e trocaria a lista inteira por
      // EstadoErro mesmo num caso esperado como saldo insuficiente.
      return { sucesso: false, erro: mensagemErroApi(falha, 'Não foi possível concluir a operação') }
    }
  }

  function depositar(id: string, dados: DepositarCaixinhaFormValues) {
    return movimentar(id, dados, 'depositar')
  }

  function resgatar(id: string, dados: MovimentarCaixinhaFormValues) {
    return movimentar(id, dados, 'resgatar')
  }

  async function excluirCaixinha(id: string) {
    // Optimistic: o card some na hora. Em falha, volta na posicao original para a lista
    // nao ficar sem a caixinha que continua existindo no servidor.
    const indice = caixinhas.findIndex((item) => item.id === id)
    const anterior = indice >= 0 ? caixinhas[indice] : undefined
    setCaixinhas((atuais) => atuais.filter((item) => item.id !== id))
    ajustarTotal(-(anterior?.valorGuardado ?? 0))
    try {
      await clienteAtual.delete(`/caixinhas/${id}`)
    } catch (falha) {
      if (anterior) {
        setCaixinhas((atuais) => {
          if (atuais.some((item) => item.id === id)) return atuais
          const copia = [...atuais]
          copia.splice(indice, 0, anterior)
          return copia
        })
        ajustarTotal(anterior.valorGuardado)
      }
      throw falha
    }
  }

  return (
    <CaixinhasContext.Provider value={{
      caixinhas,
      totalGuardado,
      carregando,
      erro,
      temMais: cursor !== null,
      carregandoMais,
      erroCarregarMais,
      carregarMais,
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
