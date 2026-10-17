import { ApiError, type ApiClient } from '@/lib/api-client'
import { adicionarMeses } from '@/lib/datas'
import { lancamentosIniciais } from '@/lib/mock-data'
import { LIMITE_PADRAO } from '@/lib/paginacao'

type Registro = Record<string, unknown>

/** Cursor opaco por deslocamento: o cliente so devolve o token, entao o formato do backend
 * (keyset por criadoEm/id) nao importa para os testes de UI. O tamanho da pagina acompanha o
 * padrao real (`LIMITE_PADRAO`) para os testes de UI refletirem a paginacao de producao. */
function paginar<T>(itens: T[], cursor: string | null) {
  const inicio = cursor ? Number(atob(cursor)) || 0 : 0
  const fatia = itens.slice(inicio, inicio + LIMITE_PADRAO)
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
    pagoEm: item.tipo === 'despesa' ? (item.pagoEm ?? null) : null,
    parcelamentoId: item.tipo === 'despesa' ? item.parcelamentoId : null,
    parcelaAtual: item.tipo === 'despesa' ? item.parcelaAtual : null,
    totalParcelas: item.tipo === 'despesa' ? item.totalParcelas : null,
  }))
}

/** Estado mutavel compartilhavel entre o mock de lancamentos e o de caixinhas, para o deposito
 * "de_fora" (origem-deposito-caixinha) conseguir inserir uma receita fake que o mock de
 * lancamentos enxerga sem os dois clientes se conhecerem. */
export interface EstadoLancamentosTeste {
  dados: Registro[]
}

export function criarEstadoLancamentosTeste(
  iniciais: Registro[] = lancamentosApiIniciais(),
): EstadoLancamentosTeste {
  return { dados: structuredClone(iniciais) }
}

export function criarClienteLancamentosTeste(
  iniciais: Registro[] = lancamentosApiIniciais(),
  estado: EstadoLancamentosTeste = criarEstadoLancamentosTeste(iniciais),
): ApiClient {
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
      pagoEm: null,
      parcelamentoId,
      parcelaAtual: quantidade > 1 ? indice + 1 : null,
      totalParcelas: quantidade > 1 ? quantidade : null,
    }))
    estado.dados = [...estado.dados, ...criados]
    return structuredClone(criados)
  }

  const listar = (caminho: string) => {
    const query = parametros(caminho)
    const tipo = query.get('tipo')
    const mes = query.get('mes')
    const busca = (query.get('busca') ?? '').toLowerCase()
    const filtrados = estado.dados.filter((item) => {
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
    let despesasPagas = 0
    for (const item of estado.dados) {
      if (mes && mesDoItem(item) !== mes) continue
      if (item.tipo === 'receita') {
        receitas += Number(item.valor)
      } else {
        despesas += Number(item.valor)
        if (item.paga) despesasPagas += Number(item.valor)
      }
    }
    return { receitas, despesas, despesasPagas }
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

    estado.dados.forEach((item, indice) => {
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

  const vencendo = (caminho: string) => {
    const query = parametros(caminho)
    const dias = Number(query.get('dias') ?? 3)
    const limite = Number(query.get('limite') ?? 3)
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    const limiteData = new Date(hoje)
    limiteData.setDate(limiteData.getDate() + dias)

    const itens = estado.dados
      .filter((item) => item.tipo === 'despesa' && !item.paga && item.vencimento)
      .filter((item) => {
        const venc = new Date(String(item.vencimento))
        return venc >= hoje && venc <= limiteData
      })
      .sort((a, b) => String(a.vencimento).localeCompare(String(b.vencimento)))
      .slice(0, limite)

    return { itens: structuredClone(itens) }
  }

  const recentes = (caminho: string) => {
    const limite = Number(parametros(caminho).get('limite') ?? 5)
    const itens = [...estado.dados].reverse().slice(0, limite)
    return { itens: structuredClone(itens) }
  }

  return {
    get: async (caminho: string) => {
      if (caminho.startsWith('/lancamentos/resumo')) return resumo(caminho)
      if (caminho.startsWith('/lancamentos/parcelamentos')) return listarParcelamentos(caminho)
      if (caminho.startsWith('/lancamentos/vencendo')) return vencendo(caminho)
      if (caminho.startsWith('/lancamentos/recentes')) return recentes(caminho)
      return listar(caminho)
    },
    post: criarLancamentos,
    postIdempotente: criarLancamentos,
    patch: async (caminho: string) => {
      const id = caminho.split('/')[2]

      if (caminho.endsWith('/pagar')) {
        const hoje = new Date().toISOString().slice(0, 10)
        estado.dados = estado.dados.map((item) =>
          item.id === id ? { ...item, paga: true, pagoEm: hoje } : item,
        )
        return structuredClone(estado.dados.find((item) => item.id === id))
      }

      return estado.dados
    },
    patchIdempotente: async (caminho: string, corpo?: unknown) => {
      const id = caminho.split('/')[2]
      const atual = estado.dados.find((item) => item.id === id)
      if (!atual) throw new ApiError(404, 'Lançamento não encontrado')
      if (atual.vinculoCaixinha) {
        throw new ApiError(409, 'Lançamento vinculado a um depósito em caixinha — edite ou exclua por lá')
      }

      const entrada = corpo as Registro
      const alcance = entrada.alcance === 'futuras' ? 'futuras' : 'somente'
      const ehAfetada = (item: Registro) =>
        alcance === 'somente' || !atual.parcelamentoId
          ? item.id === id
          : item.parcelamentoId === atual.parcelamentoId &&
            Number(item.parcelaAtual) >= Number(atual.parcelaAtual) &&
            !item.paga

      estado.dados = estado.dados.map((item) =>
        ehAfetada(item)
          ? {
              ...item,
              descricao: entrada.descricao,
              valor: entrada.valor,
              dataEmissao: entrada.dataEmissao ?? item.dataEmissao,
              vencimento: entrada.vencimento ?? item.vencimento,
            }
          : item,
      )

      return structuredClone(estado.dados.filter(ehAfetada))
    },
    delete: async () => undefined,
    deleteIdempotente: async (caminho: string) => {
      const [semQuery, query] = caminho.split('?')
      const id = semQuery.split('/')[2]
      const alcance = new URLSearchParams(query).get('alcance') === 'futuras' ? 'futuras' : 'somente'
      const atual = estado.dados.find((item) => item.id === id)
      if (!atual) throw new ApiError(404, 'Lançamento não encontrado')
      if (atual.vinculoCaixinha) {
        throw new ApiError(409, 'Lançamento vinculado a um depósito em caixinha — edite ou exclua por lá')
      }

      const idsExcluidos =
        alcance === 'futuras' && atual.parcelamentoId
          ? estado.dados
              .filter((item) =>
                item.parcelamentoId === atual.parcelamentoId &&
                Number(item.parcelaAtual) >= Number(atual.parcelaAtual) &&
                !item.paga,
              )
              .map((item) => String(item.id))
          : [id]

      estado.dados = estado.dados.filter((item) => !idsExcluidos.includes(String(item.id)))

      if (atual.parcelamentoId) {
        const restantes = estado.dados.filter((item) => item.parcelamentoId === atual.parcelamentoId)
        estado.dados = estado.dados.map((item) =>
          item.parcelamentoId === atual.parcelamentoId ? { ...item, totalParcelas: restantes.length } : item,
        )
      }

      return { idsExcluidos }
    },
  } as unknown as ApiClient
}

export interface OpcoesClienteCaixinhasTeste {
  /** Estado de lancamentos compartilhado: quando um deposito com origem "de_fora" acontece, uma
   * receita fake equivalente ao valor depositado entra nesse estado, para o mock de lancamentos
   * (se estiver usando o mesmo estado) refletir a receita sem os dois clientes se conhecerem. */
  lancamentosEstado?: EstadoLancamentosTeste
}

export function criarClienteCaixinhasTeste(
  iniciais: Registro[] = [],
  opcoes: OpcoesClienteCaixinhasTeste = {},
): ApiClient {
  let dados = structuredClone(iniciais)
  let sequencia = 0
  let sequenciaLancamento = 0

  const total = () => dados.reduce((soma, item) => soma + Number(item.valorGuardado ?? 0), 0)

  const movimentar = async (caminho: string, corpo?: unknown) => {
    const entrada = corpo as { valor?: number; origem?: 'saldo_atual' | 'de_fora' }
    const [, , id, acao] = caminho.split('/')
    const atual = dados.find((item) => item.id === id)
    if (!atual) throw new Error('Caixinha nao encontrada')
    const sinal = acao === 'depositar' ? 1 : -1
    if (acao === 'resgatar' && Number(entrada.valor) > Number(atual.valorGuardado)) {
      throw new Error('Valor maior que o guardado nesta caixinha')
    }
    const atualizada = { ...atual, valorGuardado: Number(atual.valorGuardado) + sinal * Number(entrada.valor) }
    dados = dados.map((item) => item.id === id ? atualizada : item)
    if (acao === 'depositar' && entrada.origem === 'de_fora' && opcoes.lancamentosEstado) {
      const hoje = new Date().toISOString().slice(0, 10)
      opcoes.lancamentosEstado.dados = [...opcoes.lancamentosEstado.dados, {
        id: `lancamento-de-fora-${++sequenciaLancamento}`,
        tipo: 'receita',
        descricao: 'Depósito em caixinha (de fora)',
        valor: Number(entrada.valor),
        dataEmissao: hoje,
        vencimento: null,
        paga: false,
        pagoEm: null,
        parcelamentoId: null,
        parcelaAtual: null,
        totalParcelas: null,
        vinculoCaixinha: true,
      }]
    }
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
