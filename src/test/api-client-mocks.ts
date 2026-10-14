import type { ApiClient } from '@/lib/api-client'
import { adicionarMeses } from '@/lib/datas'
import { lancamentosIniciais } from '@/lib/mock-data'

type Registro = Record<string, unknown>

const LIMITE_MOCK = 20

/** Cursor opaco por deslocamento: o cliente so devolve o token, entao o formato do backend
 * (keyset por criadoEm/id) nao importa para os testes de UI. */
function paginar<T>(itens: T[], cursor: string | null) {
  const inicio = cursor ? Number(atob(cursor)) || 0 : 0
  const fatia = itens.slice(inicio, inicio + LIMITE_MOCK)
  const fim = inicio + fatia.length
  return {
    itens: fatia,
    proximoCursor: fim < itens.length ? btoa(String(fim)) : null,
  }
}

function parametros(caminho: string) {
  const indice = caminho.indexOf('?')
  return new URLSearchParams(indice >= 0 ? caminho.slice(indice + 1) : '')
}

function mesDoItem(item: Registro) {
  const data = item.tipo === 'receita' ? item.dataEmissao : item.vencimento
  return String(data ?? '').slice(0, 7)
}

function lancamentosApiIniciais() {
  return lancamentosIniciais.map((item) => ({
    ...item,
    valor: Math.round(item.valor * 100),
    dataEmissao: item.tipo === 'receita' ? item.dataEmissao : null,
    vencimento: item.tipo === 'despesa' ? item.vencimento : null,
    paga: item.tipo === 'despesa' ? item.paga : false,
    parcelamentoId: item.tipo === 'despesa' ? item.parcelamentoId : null,
    parcelaAtual: item.tipo === 'despesa' ? item.parcelaAtual : null,
    totalParcelas: item.tipo === 'despesa' ? item.totalParcelas : null,
  }))
}

export function criarClienteLancamentosTeste(iniciais: Registro[] = lancamentosApiIniciais()): ApiClient {
  let dados: Registro[] = structuredClone(iniciais)
  let sequencia = 0

  const criarLancamentos = async (_caminho: string, corpo?: unknown) => {
    const entrada = corpo as Registro
    const quantidade = entrada.parcelado ? Number(entrada.quantidadeParcelas) : 1
    const total = Number(entrada.valor)
    const base = Math.floor(total / quantidade)
    const parcelamentoId = quantidade > 1 ? `parcelamento-${++sequencia}` : null
    const criados = Array.from({ length: quantidade }, (_, indice) => ({
      id: `lancamento-${++sequencia}`,
      tipo: entrada.tipo,
      descricao: entrada.descricao,
      valor: base + (indice === quantidade - 1 ? total - base * quantidade : 0),
      dataEmissao: entrada.dataEmissao ?? null,
      vencimento: entrada.vencimento ? adicionarMeses(String(entrada.vencimento), indice) : null,
      paga: false,
      parcelamentoId,
      parcelaAtual: quantidade > 1 ? indice + 1 : null,
      totalParcelas: quantidade > 1 ? quantidade : null,
    }))
    dados = [...dados, ...criados]
    return structuredClone(criados)
  }

  const listar = (caminho: string) => {
    const query = parametros(caminho)
    const tipo = query.get('tipo')
    const mes = query.get('mes')
    const busca = (query.get('busca') ?? '').toLowerCase()
    const filtrados = dados.filter((item) => {
      if (tipo && item.tipo !== tipo) return false
      if (mes && mesDoItem(item) !== mes) return false
      if (busca && !String(item.descricao).toLowerCase().includes(busca)) return false
      return true
    })
    return paginar(filtrados, query.get('cursor'))
  }

  const resumo = (caminho: string) => {
    const mes = parametros(caminho).get('mes')
    let receitas = 0
    let despesas = 0
    for (const item of dados) {
      if (mes && mesDoItem(item) !== mes) continue
      if (item.tipo === 'receita') receitas += Number(item.valor)
      else despesas += Number(item.valor)
    }
    return { receitas, despesas }
  }

  const listarParcelamentos = (caminho: string) => {
    const grupos = new Map<string, {
      parcelamentoId: string
      descricao: string
      totalParcelas: number
      parcelasPagas: number
      valorTotal: number
      valorPago: number
      indice: number
    }>()

    dados.forEach((item, indice) => {
      if (item.tipo !== 'despesa' || !item.parcelamentoId) return
      const chave = String(item.parcelamentoId)
      const grupo = grupos.get(chave) ?? {
        parcelamentoId: chave,
        descricao: String(item.descricao),
        totalParcelas: 0,
        parcelasPagas: 0,
        valorTotal: 0,
        valorPago: 0,
        indice,
      }
      grupo.totalParcelas += 1
      grupo.valorTotal += Number(item.valor)
      if (item.paga) {
        grupo.parcelasPagas += 1
        grupo.valorPago += Number(item.valor)
      }
      grupos.set(chave, grupo)
    })

    const ordenados = [...grupos.values()]
      .sort((a, b) => b.indice - a.indice)
      .map(({ indice: _indice, ...resto }) => resto)

    return paginar(ordenados, parametros(caminho).get('cursor'))
  }

  return {
    get: async (caminho: string) => {
      if (caminho.startsWith('/lancamentos/resumo')) return resumo(caminho)
      if (caminho.startsWith('/lancamentos/parcelamentos')) return listarParcelamentos(caminho)
      return listar(caminho)
    },
    post: criarLancamentos,
    postIdempotente: criarLancamentos,
    patch: async (caminho: string) => {
      const id = caminho.split('/')[2]
      dados = dados.map((item) => item.id === id ? { ...item, paga: true } : item)
      return structuredClone(dados.find((item) => item.id === id))
    },
    delete: async () => undefined,
  } as unknown as ApiClient
}

export function criarClienteCaixinhasTeste(iniciais: Registro[] = []): ApiClient {
  let dados = structuredClone(iniciais)
  let sequencia = 0

  const total = () => dados.reduce((soma, item) => soma + Number(item.valorGuardado ?? 0), 0)

  const movimentar = async (caminho: string, corpo?: unknown) => {
    const entrada = corpo as { valor?: number }
    const [, , id, acao] = caminho.split('/')
    const atual = dados.find((item) => item.id === id)
    if (!atual) throw new Error('Caixinha nao encontrada')
    const sinal = acao === 'depositar' ? 1 : -1
    if (acao === 'resgatar' && Number(entrada.valor) > Number(atual.valorGuardado)) {
      throw new Error('Valor maior que o guardado nesta caixinha')
    }
    const atualizada = { ...atual, valorGuardado: Number(atual.valorGuardado) + sinal * Number(entrada.valor) }
    dados = dados.map((item) => item.id === id ? atualizada : item)
    return structuredClone(atualizada)
  }

  return {
    get: async (caminho: string) => {
      const pagina = paginar(dados, parametros(caminho).get('cursor'))
      return { ...pagina, totalGuardado: total() }
    },
    post: async (caminho: string, corpo?: unknown) => {
      const entrada = corpo as { nome?: string; meta?: number; valor?: number }
      if (caminho === '/caixinhas') {
        const criada = { id: `caixinha-${++sequencia}`, nome: entrada.nome, meta: entrada.meta, valorGuardado: 0 }
        dados = [...dados, criada]
        return structuredClone(criada)
      }
      return movimentar(caminho, corpo)
    },
    postIdempotente: movimentar,
    patch: async () => undefined,
    delete: async (caminho: string) => {
      const id = caminho.split('/')[2]
      dados = dados.filter((item) => item.id !== id)
      return undefined
    },
  } as unknown as ApiClient
}
