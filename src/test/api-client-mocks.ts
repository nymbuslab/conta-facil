import type { ApiClient } from '@/lib/api-client'
import { adicionarMeses } from '@/lib/datas'
import { lancamentosIniciais } from '@/lib/mock-data'

type Registro = Record<string, unknown>

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

export function criarClienteLancamentosTeste(iniciais = lancamentosApiIniciais()): ApiClient {
  let dados: Registro[] = structuredClone(iniciais)
  let sequencia = 0

  return {
    get: async () => structuredClone(dados),
    post: async (_caminho: string, corpo?: unknown) => {
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
    },
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

  return {
    get: async () => structuredClone(dados),
    post: async (caminho: string, corpo?: unknown) => {
      const entrada = corpo as { nome?: string; meta?: number; valor?: number }
      if (caminho === '/caixinhas') {
        const criada = { id: `caixinha-${++sequencia}`, nome: entrada.nome, meta: entrada.meta, valorGuardado: 0 }
        dados = [...dados, criada]
        return structuredClone(criada)
      }
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
    },
    patch: async () => undefined,
    delete: async (caminho: string) => {
      const id = caminho.split('/')[2]
      dados = dados.filter((item) => item.id !== id)
      return undefined
    },
  } as unknown as ApiClient
}
