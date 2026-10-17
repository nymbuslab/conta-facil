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
import { mesAtual } from '@/lib/datas'
import { parseValorMonetario } from '@/lib/formatters'
import { montarUrl } from '@/lib/paginacao'
import type { GrupoParcelamento } from '@/lib/parcelamento'
import type { Despesa, DespesaFormValues, Lancamento, Receita, ReceitaFormValues } from '@/types/lancamento'

import { useAuth } from './auth-context'

export interface FiltrosLancamentos {
  mes: string
  busca: string
}

interface PaginaApi<T> {
  itens: T[]
  proximoCursor: string | null
}

interface ResumoApi {
  receitas: number
  despesas: number
  despesasPagas: number
}

interface GrupoParcelamentoApi {
  parcelamentoId: string
  descricao: string
  totalParcelas: number
  parcelasPagas: number
  valorTotal: number
  valorPago: number
}

interface LancamentosContextValue {
  receitas: Receita[]
  despesas: Despesa[]
  saldoReceita: number
  saldoDespesa: number
  totalPago: number
  carregando: boolean
  erro: string | null
  filtros: FiltrosLancamentos
  definirFiltros: (parcial: Partial<FiltrosLancamentos>) => void
  temMaisReceitas: boolean
  temMaisDespesas: boolean
  carregandoMais: 'receita' | 'despesa' | null
  erroCarregarMais: string | null
  carregarMaisReceitas: () => Promise<void>
  carregarMaisDespesas: () => Promise<void>
  recarregar: () => Promise<void>
  adicionarReceita: (dados: ReceitaFormValues) => Promise<void>
  adicionarDespesa: (dados: DespesaFormValues) => Promise<void>
  marcarComoPaga: (id: string) => Promise<void>
  editarReceita: (id: string, dados: ReceitaFormValues) => Promise<void>
  editarDespesa: (id: string, dados: DespesaFormValues & { alcance?: 'somente' | 'futuras' }) => Promise<void>
  excluirLancamento: (id: string, tipo: 'receita' | 'despesa', alcance?: 'somente' | 'futuras') => Promise<void>
  parcelamentos: GrupoParcelamento[]
  carregandoParcelamentos: boolean
  erroParcelamentos: string | null
  temMaisParcelamentos: boolean
  carregandoMaisParcelamentos: boolean
  /** Muda quando uma despesa parcelada e criada ou paga: a tela Parcelas observa este numero
   * para recarregar os agregados mesmo se ja estiver montada. */
  versaoParcelamentos: number
  carregarParcelamentos: () => Promise<void>
  carregarMaisParcelamentos: () => Promise<void>
  contasVencendo: Despesa[]
  carregandoContasVencendo: boolean
  erroContasVencendo: string | null
  carregarContasVencendo: () => Promise<void>
  ultimosLancamentos: Lancamento[]
  carregandoUltimosLancamentos: boolean
  erroUltimosLancamentos: string | null
  carregarUltimosLancamentos: () => Promise<void>
}

type LancamentoApi = {
  id: string
  tipo: 'receita' | 'despesa'
  descricao: string
  valor: number
  dataEmissao: string | null
  vencimento: string | null
  paga: boolean
  pagoEm: string | null
  parcelamentoId: string | null
  parcelaAtual: number | null
  totalParcelas: number | null
}

type Cursors = { receita: string | null; despesa: string | null }

const LancamentosContext = createContext<LancamentosContextValue | null>(null)

function arredondar(valor: number) {
  return Math.round(valor * 100) / 100
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
    pagoEm: item.pagoEm,
    parcelamentoId: item.parcelamentoId,
    parcelaAtual: item.parcelaAtual,
    totalParcelas: item.totalParcelas,
  }
}

function paraGrupo(item: GrupoParcelamentoApi): GrupoParcelamento {
  const valorTotal = arredondar(item.valorTotal / 100)
  const valorPago = arredondar(item.valorPago / 100)
  return {
    parcelamentoId: item.parcelamentoId,
    descricao: item.descricao,
    totalParcelas: item.totalParcelas,
    parcelasPagas: item.parcelasPagas,
    valorTotal,
    valorPago,
    valorFalta: arredondar(valorTotal - valorPago),
  }
}

function ehReceita(lancamento: Lancamento): lancamento is Receita {
  return lancamento.tipo === 'receita'
}

function ehDespesa(lancamento: Lancamento): lancamento is Despesa {
  return lancamento.tipo === 'despesa'
}

/** Decide se um lançamento recém-criado entra na lista já visível: só quando casa o mês e a
 * busca atuais — assim a linha aparece de imediato sem misturar algo fora do filtro. */
function bateFiltros(item: Lancamento, filtros: FiltrosLancamentos) {
  const data = item.tipo === 'receita' ? item.dataEmissao : item.vencimento
  if (data.slice(0, 7) !== filtros.mes) return false
  const busca = filtros.busca.trim().toLowerCase()
  return busca === '' || item.descricao.toLowerCase().includes(busca)
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

  const [receitas, setReceitas] = useState<Receita[]>([])
  const [despesas, setDespesas] = useState<Despesa[]>([])
  const [resumo, setResumo] = useState<ResumoApi>({ receitas: 0, despesas: 0, despesasPagas: 0 })
  const [cursors, setCursors] = useState<Cursors>({ receita: null, despesa: null })
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [carregandoMais, setCarregandoMais] = useState<'receita' | 'despesa' | null>(null)
  const [erroCarregarMais, setErroCarregarMais] = useState<string | null>(null)
  const [filtros, setFiltros] = useState<FiltrosLancamentos>(() => ({ mes: mesAtual(), busca: '' }))
  const [parcelamentos, setParcelamentos] = useState<GrupoParcelamento[]>([])
  const [carregandoParcelamentos, setCarregandoParcelamentos] = useState(true)
  const [erroParcelamentos, setErroParcelamentos] = useState<string | null>(null)
  const [cursorParcelamentos, setCursorParcelamentos] = useState<string | null>(null)
  const [carregandoMaisParcelamentos, setCarregandoMaisParcelamentos] = useState(false)
  const [versaoParcelamentos, setVersaoParcelamentos] = useState(0)
  const [contasVencendo, setContasVencendo] = useState<Despesa[]>([])
  const [carregandoContasVencendo, setCarregandoContasVencendo] = useState(false)
  const [erroContasVencendo, setErroContasVencendo] = useState<string | null>(null)
  const [ultimosLancamentos, setUltimosLancamentos] = useState<Lancamento[]>([])
  const [carregandoUltimosLancamentos, setCarregandoUltimosLancamentos] = useState(false)
  const [erroUltimosLancamentos, setErroUltimosLancamentos] = useState<string | null>(null)

  /** Descarta respostas de uma sessao/usuario/filtro que ja nao e o atual: sem isso, uma
   * resposta atrasada poderia sobrescrever os dados vigentes (troca de conta ou de filtro). */
  const geracaoAtualRef = useRef(0)
  /** Muda so quando a sessao deixa de ser autenticada: os agregados de parcelamento nao
   * dependem do filtro de mes/busca, entao uma troca de filtro nao pode descartar a resposta
   * deles (o carregamento da tela Parcelas comecaria antes da sessao assentar). */
  const sessaoAtualRef = useRef(0)
  const estaveisAutenticadoRef = useRef(false)
  const filtrosRef = useRef(filtros)
  const cursorsRef = useRef(cursors)
  const cursorParcelamentosRef = useRef<string | null>(null)
  const carregandoMaisRef = useRef(false)
  const carregandoParcelamentosRef = useRef(false)
  const carregandoMaisParcelamentosRef = useRef(false)

  const invalidarParcelamentos = useCallback(() => {
    setVersaoParcelamentos((atual) => atual + 1)
  }, [])

  useEffect(() => {
    filtrosRef.current = filtros
  }, [filtros])

  const carregarPrimeiraPagina = useCallback(
    async (filtrosAtuais: FiltrosLancamentos, limpar: boolean) => {
      if (limpar) {
        setReceitas([])
        setDespesas([])
        setResumo({ receitas: 0, despesas: 0, despesasPagas: 0 })
        cursorsRef.current = { receita: null, despesa: null }
        setCursors(cursorsRef.current)
      }

      const minhaGeracao = ++geracaoAtualRef.current
      setCarregando(true)
      setErro(null)
      setErroCarregarMais(null)

      try {
        const [paginaReceitas, paginaDespesas, resumoAtual] = await Promise.all([
          clienteAtual.get<PaginaApi<LancamentoApi>>(montarUrl('/lancamentos', {
            tipo: 'receita', mes: filtrosAtuais.mes, busca: filtrosAtuais.busca,
          })),
          clienteAtual.get<PaginaApi<LancamentoApi>>(montarUrl('/lancamentos', {
            tipo: 'despesa', mes: filtrosAtuais.mes, busca: filtrosAtuais.busca,
          })),
          clienteAtual.get<ResumoApi>(montarUrl('/lancamentos/resumo', { mes: filtrosAtuais.mes })),
        ])
        if (geracaoAtualRef.current !== minhaGeracao) return

        setReceitas(paginaReceitas.itens.map(paraLancamento).filter(ehReceita))
        setDespesas(paginaDespesas.itens.map(paraLancamento).filter(ehDespesa))
        const proximosCursors = {
          receita: paginaReceitas.proximoCursor,
          despesa: paginaDespesas.proximoCursor,
        }
        cursorsRef.current = proximosCursors
        setCursors(proximosCursors)
        setResumo(resumoAtual)
      } catch (falha) {
        if (geracaoAtualRef.current !== minhaGeracao) return
        setErro(mensagemErroApi(falha, 'Nao foi possivel carregar os lancamentos'))
      } finally {
        if (geracaoAtualRef.current === minhaGeracao) setCarregando(false)
      }
    },
    [clienteAtual],
  )

  const recarregar = useCallback(
    () => carregarPrimeiraPagina(filtrosRef.current, false),
    [carregarPrimeiraPagina],
  )

  const definirFiltros = useCallback(
    (parcial: Partial<FiltrosLancamentos>) => {
      const atuais = filtrosRef.current
      const proximos = { ...atuais, ...parcial }
      if (proximos.mes === atuais.mes && proximos.busca === atuais.busca) return
      filtrosRef.current = proximos
      setFiltros(proximos)
      void carregarPrimeiraPagina(proximos, true)
    },
    [carregarPrimeiraPagina],
  )

  useEffect(() => {
    if (status !== 'autenticado') {
      if (estaveisAutenticadoRef.current) sessaoAtualRef.current += 1
      estaveisAutenticadoRef.current = false
      geracaoAtualRef.current += 1
      setReceitas([])
      setDespesas([])
      setResumo({ receitas: 0, despesas: 0, despesasPagas: 0 })
      cursorsRef.current = { receita: null, despesa: null }
      setCursors(cursorsRef.current)
      setErro(null)
      setErroCarregarMais(null)
      setCarregando(status === 'carregando')
      setParcelamentos([])
      cursorParcelamentosRef.current = null
      setCursorParcelamentos(null)
      return
    }
    estaveisAutenticadoRef.current = true
    void carregarPrimeiraPagina(filtrosRef.current, true)
  }, [carregarPrimeiraPagina, status, usuario?.id])

  const carregarMais = useCallback(
    async (tipo: 'receita' | 'despesa') => {
      const cursor = cursorsRef.current[tipo]
      if (!cursor || carregandoMaisRef.current) return

      const minhaGeracao = geracaoAtualRef.current
      carregandoMaisRef.current = true
      setCarregandoMais(tipo)
      setErroCarregarMais(null)

      try {
        const pagina = await clienteAtual.get<PaginaApi<LancamentoApi>>(montarUrl('/lancamentos', {
          tipo,
          mes: filtrosRef.current.mes,
          busca: filtrosRef.current.busca,
          cursor,
        }))
        if (geracaoAtualRef.current !== minhaGeracao) return

        const convertidos = pagina.itens.map(paraLancamento)
        if (tipo === 'receita') setReceitas((atuais) => [...atuais, ...convertidos.filter(ehReceita)])
        else setDespesas((atuais) => [...atuais, ...convertidos.filter(ehDespesa)])

        setCursors((atuais) => {
          const proximos = tipo === 'receita'
            ? { ...atuais, receita: pagina.proximoCursor }
            : { ...atuais, despesa: pagina.proximoCursor }
          cursorsRef.current = proximos
          return proximos
        })
      } catch (falha) {
        if (geracaoAtualRef.current !== minhaGeracao) return
        setErroCarregarMais(mensagemErroApi(falha, 'Não foi possível carregar mais'))
      } finally {
        carregandoMaisRef.current = false
        if (geracaoAtualRef.current === minhaGeracao) setCarregandoMais(null)
      }
    },
    [clienteAtual],
  )

  const carregarMaisReceitas = useCallback(() => carregarMais('receita'), [carregarMais])
  const carregarMaisDespesas = useCallback(() => carregarMais('despesa'), [carregarMais])

  async function sincronizarResumo() {
    try {
      const resumoAtual = await clienteAtual.get<ResumoApi>(
        montarUrl('/lancamentos/resumo', { mes: filtrosRef.current.mes }),
      )
      setResumo(resumoAtual)
    } catch {
      // Resumo desatualizado e cosmetico: a proxima recarga corrige sem quebrar a criacao,
      // que ja foi confirmada pelo servidor.
    }
  }

  async function adicionarReceita(dados: ReceitaFormValues) {
    const valor = parseValorMonetario(dados.valor)
    if (valor === null) return
    const criados = await clienteAtual.postIdempotente<LancamentoApi[]>('/lancamentos', {
      tipo: 'receita',
      descricao: dados.descricao,
      valor: Math.round(valor * 100),
      dataEmissao: dados.dataEmissao,
    })
    const convertidos = criados.map(paraLancamento).filter(ehReceita)
    setReceitas((atuais) => [
      ...atuais,
      ...convertidos.filter((item) => bateFiltros(item, filtrosRef.current)),
    ])
    await sincronizarResumo()
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
    const convertidos = criados.map(paraLancamento).filter(ehDespesa)
    setDespesas((atuais) => [
      ...atuais,
      ...convertidos.filter((item) => bateFiltros(item, filtrosRef.current)),
    ])
    if (dados.parcelado) invalidarParcelamentos()
    await sincronizarResumo()
  }

  async function marcarComoPaga(id: string) {
    // Optimistic: a linha mostra "Pago" na hora. Em falha, volta ao valor anterior e o
    // erro sobe para quem chamou (o dialogo).
    const anterior = despesas.find((item) => item.id === id)
    const hoje = new Date().toISOString().slice(0, 10)
    setDespesas((atuais) =>
      atuais.map((item) => (item.id === id ? { ...item, paga: true, pagoEm: hoje } : item)),
    )
    try {
      const convertido = paraLancamento(await clienteAtual.patch<LancamentoApi>(`/lancamentos/${id}/pagar`))
      if (ehDespesa(convertido)) {
        setDespesas((atuais) => atuais.map((item) => (item.id === id ? convertido : item)))
      }
      // Os agregados de parcelamento (pagas/pago) mudam em qualquer mes: a tela Parcelas
      // recarrega ao ver a nova versao.
      invalidarParcelamentos()
    } catch (falha) {
      if (anterior) {
        setDespesas((atuais) => atuais.map((item) => (item.id === id ? anterior : item)))
      }
      throw falha
    }
  }

  async function editarReceita(id: string, dados: ReceitaFormValues) {
    const valor = parseValorMonetario(dados.valor)
    if (valor === null) return
    const anterior = receitas.find((item) => item.id === id)
    if (!anterior) return
    // Optimistic: a linha reflete os dados novos na hora. Em falha, volta ao valor anterior,
    // mesmo padrao de marcarComoPaga/excluirCaixinha.
    setReceitas((atuais) =>
      atuais.map((item) => (item.id === id ? { ...item, descricao: dados.descricao, valor, dataEmissao: dados.dataEmissao } : item)),
    )
    try {
      await clienteAtual.patchIdempotente(`/lancamentos/${id}`, {
        tipo: 'receita',
        descricao: dados.descricao,
        valor: Math.round(valor * 100),
        dataEmissao: dados.dataEmissao,
      })
      await sincronizarResumo()
    } catch (falha) {
      setReceitas((atuais) => atuais.map((item) => (item.id === id ? anterior : item)))
      throw falha
    }
  }

  async function editarDespesa(id: string, dados: DespesaFormValues & { alcance?: 'somente' | 'futuras' }) {
    const valor = parseValorMonetario(dados.valor)
    if (valor === null) return
    const anterior = despesas.find((item) => item.id === id)
    if (!anterior) return
    // Optimistic so na linha clicada: com alcance 'futuras' as parcelas irmas so atualizam
    // quando a resposta do servidor chega, porque o filtro exato (nao pagas, indice >= atual)
    // e decidido no banco, nao duplicado aqui.
    setDespesas((atuais) =>
      atuais.map((item) => (item.id === id ? { ...item, descricao: dados.descricao, valor, vencimento: dados.vencimento } : item)),
    )
    try {
      const resposta = await clienteAtual.patchIdempotente<LancamentoApi[]>(`/lancamentos/${id}`, {
        tipo: 'despesa',
        descricao: dados.descricao,
        valor: Math.round(valor * 100),
        vencimento: dados.vencimento,
        alcance: dados.alcance,
      })
      const convertidos = resposta.map(paraLancamento).filter(ehDespesa)
      setDespesas((atuais) =>
        atuais.map((item) => convertidos.find((convertido) => convertido.id === item.id) ?? item),
      )
      if (dados.alcance || anterior.parcelamentoId) invalidarParcelamentos()
      await sincronizarResumo()
    } catch (falha) {
      setDespesas((atuais) => atuais.map((item) => (item.id === id ? anterior : item)))
      throw falha
    }
  }

  async function excluirLancamento(id: string, tipo: 'receita' | 'despesa', alcance?: 'somente' | 'futuras') {
    // Optimistic: a linha some na hora. Em falha, volta para a lista, mesmo padrao de
    // excluirCaixinha (src/state/caixinhas-context.tsx).
    if (tipo === 'receita') {
      const anterior = receitas.find((item) => item.id === id)
      if (!anterior) return
      setReceitas((atuais) => atuais.filter((item) => item.id !== id))
      try {
        const query = alcance === 'futuras' ? '?alcance=futuras' : ''
        await clienteAtual.deleteIdempotente(`/lancamentos/${id}${query}`)
        await sincronizarResumo()
      } catch (falha) {
        setReceitas((atuais) => (atuais.some((item) => item.id === id) ? atuais : [...atuais, anterior]))
        throw falha
      }
      return
    }

    const anterior = despesas.find((item) => item.id === id)
    if (!anterior) return
    setDespesas((atuais) => atuais.filter((item) => item.id !== id))
    try {
      const query = alcance === 'futuras' ? '?alcance=futuras' : ''
      const resposta = await clienteAtual.deleteIdempotente<{ idsExcluidos: string[] }>(`/lancamentos/${id}${query}`)
      setDespesas((atuais) => atuais.filter((item) => !resposta.idsExcluidos.includes(item.id)))
      invalidarParcelamentos()
      await sincronizarResumo()
    } catch (falha) {
      setDespesas((atuais) => (atuais.some((item) => item.id === id) ? atuais : [...atuais, anterior]))
      throw falha
    }
  }

  const carregarParcelamentos = useCallback(async () => {
    if (carregandoParcelamentosRef.current) return

    const minhaSessao = sessaoAtualRef.current
    carregandoParcelamentosRef.current = true
    setCarregandoParcelamentos(true)
    setErroParcelamentos(null)

    try {
      const pagina = await clienteAtual.get<PaginaApi<GrupoParcelamentoApi>>(
        montarUrl('/lancamentos/parcelamentos', {}),
      )
      if (sessaoAtualRef.current !== minhaSessao) return
      setParcelamentos(pagina.itens.map(paraGrupo))
      cursorParcelamentosRef.current = pagina.proximoCursor
      setCursorParcelamentos(pagina.proximoCursor)
    } catch (falha) {
      if (sessaoAtualRef.current !== minhaSessao) return
      setErroParcelamentos(mensagemErroApi(falha, 'Não foi possível carregar os parcelamentos'))
    } finally {
      carregandoParcelamentosRef.current = false
      if (sessaoAtualRef.current === minhaSessao) setCarregandoParcelamentos(false)
    }
  }, [clienteAtual])

  const carregarMaisParcelamentos = useCallback(async () => {
    const cursor = cursorParcelamentosRef.current
    if (!cursor || carregandoMaisParcelamentosRef.current) return

    const minhaSessao = sessaoAtualRef.current
    carregandoMaisParcelamentosRef.current = true
    setCarregandoMaisParcelamentos(true)
    setErroParcelamentos(null)

    try {
      const pagina = await clienteAtual.get<PaginaApi<GrupoParcelamentoApi>>(
        montarUrl('/lancamentos/parcelamentos', { cursor }),
      )
      if (sessaoAtualRef.current !== minhaSessao) return
      setParcelamentos((atuais) => [...atuais, ...pagina.itens.map(paraGrupo)])
      cursorParcelamentosRef.current = pagina.proximoCursor
      setCursorParcelamentos(pagina.proximoCursor)
    } catch (falha) {
      if (sessaoAtualRef.current !== minhaSessao) return
      setErroParcelamentos(mensagemErroApi(falha, 'Não foi possível carregar mais parcelamentos'))
    } finally {
      carregandoMaisParcelamentosRef.current = false
      if (sessaoAtualRef.current === minhaSessao) setCarregandoMaisParcelamentos(false)
    }
  }, [clienteAtual])

  const carregarContasVencendo = useCallback(async () => {
    setCarregandoContasVencendo(true)
    setErroContasVencendo(null)
    try {
      const resposta = await clienteAtual.get<{ itens: LancamentoApi[] }>('/lancamentos/vencendo')
      setContasVencendo(resposta.itens.map(paraLancamento).filter(ehDespesa))
    } catch (falha) {
      setErroContasVencendo(mensagemErroApi(falha, 'Não foi possível carregar as contas vencendo'))
    } finally {
      setCarregandoContasVencendo(false)
    }
  }, [clienteAtual])

  const carregarUltimosLancamentos = useCallback(async () => {
    setCarregandoUltimosLancamentos(true)
    setErroUltimosLancamentos(null)
    try {
      const resposta = await clienteAtual.get<{ itens: LancamentoApi[] }>('/lancamentos/recentes')
      setUltimosLancamentos(resposta.itens.map(paraLancamento))
    } catch (falha) {
      setErroUltimosLancamentos(mensagemErroApi(falha, 'Não foi possível carregar os últimos lançamentos'))
    } finally {
      setCarregandoUltimosLancamentos(false)
    }
  }, [clienteAtual])

  return (
    <LancamentosContext.Provider value={{
      receitas,
      despesas,
      saldoReceita: arredondar(resumo.receitas / 100),
      saldoDespesa: arredondar(resumo.despesas / 100),
      totalPago: arredondar((resumo.despesasPagas ?? 0) / 100),
      carregando,
      erro,
      filtros,
      definirFiltros,
      temMaisReceitas: cursors.receita !== null,
      temMaisDespesas: cursors.despesa !== null,
      carregandoMais,
      erroCarregarMais,
      carregarMaisReceitas,
      carregarMaisDespesas,
      recarregar,
      adicionarReceita,
      adicionarDespesa,
      marcarComoPaga,
      editarReceita,
      editarDespesa,
      excluirLancamento,
      parcelamentos,
      carregandoParcelamentos,
      erroParcelamentos,
      temMaisParcelamentos: cursorParcelamentos !== null,
      carregandoMaisParcelamentos,
      versaoParcelamentos,
      carregarParcelamentos,
      carregarMaisParcelamentos,
      contasVencendo,
      carregandoContasVencendo,
      erroContasVencendo,
      carregarContasVencendo,
      ultimosLancamentos,
      carregandoUltimosLancamentos,
      erroUltimosLancamentos,
      carregarUltimosLancamentos,
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
