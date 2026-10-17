import { randomUUID } from 'node:crypto'

import { and, asc, desc, eq, gte, ilike, isNotNull, lt, lte, or, sql, type SQL } from 'drizzle-orm'
import { Hono } from 'hono'
import { z } from 'zod'

import {
  lancamentos,
  type LancamentoBanco,
  type NovoLancamentoBanco,
} from '../../db/schema.ts'
import {
  decodificarCursor,
  LIMITE_MAXIMO,
  LIMITE_PADRAO,
  montarPagina,
  normalizarLimite,
  type Cursor,
  type Pagina,
} from '../../lib/paginacao.ts'
import type { VariaveisAuth } from './auth-middleware.ts'
import { obterBanco } from './db.ts'
import { executarComIdempotencia } from './idempotencia.ts'

const baseLancamentoSchema = z.object({
  descricao: z.string().trim().min(1),
  valor: z.number().int().positive(),
})

const criarLancamentoSchema = z.discriminatedUnion('tipo', [
  baseLancamentoSchema.extend({
    tipo: z.literal('receita'),
    dataEmissao: z.string().date(),
  }),
  baseLancamentoSchema.extend({
    tipo: z.literal('despesa'),
    vencimento: z.string().date(),
    parcelado: z.boolean().optional().default(false),
    quantidadeParcelas: z.number().int().min(2).max(360).optional(),
  }),
])

const mesSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/)

const filtrosLancamentosSchema = z.object({
  limite: z.coerce.number().int().min(1).max(LIMITE_MAXIMO).optional(),
  cursor: z.string().min(1).optional(),
  tipo: z.enum(['receita', 'despesa']).optional(),
  mes: mesSchema.optional(),
  busca: z.string().trim().min(1).max(120).optional(),
})

const filtrosPaginaSchema = z.object({
  limite: z.coerce.number().int().min(1).max(LIMITE_MAXIMO).optional(),
  cursor: z.string().min(1).optional(),
})

const DIAS_VENCENDO_PADRAO = 3
const LIMITE_VENCENDO_PADRAO = 3

const filtrosVencendoSchema = z.object({
  dias: z.coerce.number().int().min(1).max(90).optional(),
  limite: z.coerce.number().int().min(1).max(LIMITE_MAXIMO).optional(),
})

const filtrosRecentesSchema = z.object({
  limite: z.coerce.number().int().min(1).max(LIMITE_MAXIMO).optional(),
})

export interface FiltrosLancamentos {
  limite: number
  cursor?: Cursor
  tipo?: 'receita' | 'despesa'
  mes?: string
  busca?: string
}

export interface FiltrosPagina {
  limite: number
  cursor?: Cursor
}

export interface ResumoLancamentos {
  receitas: number
  despesas: number
}

export interface GrupoParcelamentoBanco {
  parcelamentoId: string
  descricao: string
  totalParcelas: number
  parcelasPagas: number
  valorTotal: number
  valorPago: number
}

/** Campos que a listagem expõe para a tela. Nunca inclui `userId` nem os timestamps internos
 * (`criadoEm`/`atualizadoEm`) — `criadoEm` só é lido no servidor para montar o cursor. */
export interface LancamentoListado {
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

/** Projeção explícita da listagem: só o que a tela usa, mais `criadoEm` (necessário para o
 * cursor keyset). Evita o overfetch de `SELECT *` (que trazia `userId` e timestamps à toa). */
export const colunasLancamentoListado = {
  id: lancamentos.id,
  tipo: lancamentos.tipo,
  descricao: lancamentos.descricao,
  valor: lancamentos.valor,
  dataEmissao: lancamentos.dataEmissao,
  vencimento: lancamentos.vencimento,
  paga: lancamentos.paga,
  parcelamentoId: lancamentos.parcelamentoId,
  parcelaAtual: lancamentos.parcelaAtual,
  totalParcelas: lancamentos.totalParcelas,
  criadoEm: lancamentos.criadoEm,
} as const

/** Descarta `criadoEm` (usado só pelo cursor) e devolve só o shape público da listagem. */
export function paraLancamentoListado(
  item: LancamentoListado & { criadoEm: Date },
): LancamentoListado {
  return {
    id: item.id,
    tipo: item.tipo,
    descricao: item.descricao,
    valor: item.valor,
    dataEmissao: item.dataEmissao,
    vencimento: item.vencimento,
    paga: item.paga,
    parcelamentoId: item.parcelamentoId,
    parcelaAtual: item.parcelaAtual,
    totalParcelas: item.totalParcelas,
  }
}

export interface FiltrosVencendo {
  dias: number
  limite: number
}

export interface FiltrosRecentes {
  limite: number
}

export type RepositorioLancamentos = {
  listar: (userId: string, filtros: FiltrosLancamentos) => Promise<Pagina<LancamentoListado>>
  resumo: (userId: string, mes?: string) => Promise<ResumoLancamentos>
  listarParcelamentos: (userId: string, filtros: FiltrosPagina) => Promise<Pagina<GrupoParcelamentoBanco>>
  criarMuitos: (dados: NovoLancamentoBanco[], banco?: unknown) => Promise<LancamentoBanco[]>
  marcarComoPaga: (userId: string, id: string) => Promise<LancamentoBanco | null>
  listarVencendo: (userId: string, filtros: FiltrosVencendo) => Promise<{ itens: LancamentoListado[] }>
  listarRecentes: (userId: string, filtros: FiltrosRecentes) => Promise<{ itens: LancamentoListado[] }>
}

const repositorioPadrao: RepositorioLancamentos = {
  async listar(userId, filtros) {
    const linhas = await obterBanco()
      .select(colunasLancamentoListado)
      .from(lancamentos)
      .where(and(...condicoesDeFiltro(userId, filtros)))
      .orderBy(asc(lancamentos.criadoEm), asc(lancamentos.id))
      .limit(filtros.limite + 1)
    const pagina = montarPagina(linhas, filtros.limite, (item) => ({
      criadoEm: item.criadoEm.toISOString(),
      id: item.id,
    }))
    return {
      itens: pagina.itens.map(paraLancamentoListado),
      proximoCursor: pagina.proximoCursor,
    }
  },
  async resumo(userId, mes) {
    const condicoes: SQL[] = [eq(lancamentos.userId, userId)]
    if (mes) condicoes.push(condicaoDoMes(mes))
    const linhas = await obterBanco()
      .select({
        tipo: lancamentos.tipo,
        soma: sql<number>`coalesce(sum(${lancamentos.valor}), 0)::int`,
      })
      .from(lancamentos)
      .where(and(...condicoes))
      .groupBy(lancamentos.tipo)

    const resumo: ResumoLancamentos = { receitas: 0, despesas: 0 }
    for (const linha of linhas) {
      if (linha.tipo === 'receita') resumo.receitas = linha.soma
      else resumo.despesas = linha.soma
    }
    return resumo
  },
  async listarParcelamentos(userId, filtros) {
    const linhas = await obterBanco()
      .select({
        parcelamentoId: lancamentos.parcelamentoId,
        descricao: sql<string>`min(${lancamentos.descricao})`,
        totalParcelas: sql<number>`max(${lancamentos.totalParcelas})::int`,
        parcelasPagas: sql<number>`(count(*) filter (where ${lancamentos.paga}))::int`,
        valorTotal: sql<number>`coalesce(sum(${lancamentos.valor}), 0)::int`,
        valorPago: sql<number>`coalesce(sum(${lancamentos.valor}) filter (where ${lancamentos.paga}), 0)::int`,
        ultimaCriacaoEm: sql<Date>`max(${lancamentos.criadoEm})`,
      })
      .from(lancamentos)
      .where(and(eq(lancamentos.userId, userId), isNotNull(lancamentos.parcelamentoId)))
      .groupBy(lancamentos.parcelamentoId)
      .having(
        filtros.cursor
          ? sql`(max(${lancamentos.criadoEm}), ${lancamentos.parcelamentoId}) < (${filtros.cursor.criadoEm}::timestamptz, ${filtros.cursor.id}::uuid)`
          : sql`true`,
      )
      .orderBy(desc(sql`max(${lancamentos.criadoEm})`), desc(lancamentos.parcelamentoId))
      .limit(filtros.limite + 1)

    const pagina = montarPagina(linhas, filtros.limite, (grupo) => ({
      criadoEm: new Date(grupo.ultimaCriacaoEm).toISOString(),
      id: grupo.parcelamentoId ?? '',
    }))
    return {
      itens: pagina.itens.map((grupo) => ({
        parcelamentoId: grupo.parcelamentoId ?? '',
        descricao: grupo.descricao,
        totalParcelas: grupo.totalParcelas,
        parcelasPagas: grupo.parcelasPagas,
        valorTotal: grupo.valorTotal,
        valorPago: grupo.valorPago,
      })),
      proximoCursor: pagina.proximoCursor,
    }
  },
  criarMuitos(dados, transacao) {
    const banco = (transacao ?? obterBanco()) as ReturnType<typeof obterBanco>
    return banco.insert(lancamentos).values(dados).returning()
  },
  async marcarComoPaga(userId, id) {
    const [atualizado] = await obterBanco()
      .update(lancamentos)
      .set({ paga: true, atualizadoEm: new Date() })
      .where(
        and(
          eq(lancamentos.id, id),
          eq(lancamentos.userId, userId),
          eq(lancamentos.tipo, 'despesa'),
        ),
      )
      .returning()
    return atualizado ?? null
  },
  async listarVencendo(userId, filtros) {
    const hoje = new Date()
    const limiteData = new Date(hoje)
    limiteData.setDate(limiteData.getDate() + filtros.dias)
    const linhas = await obterBanco()
      .select(colunasLancamentoListado)
      .from(lancamentos)
      .where(
        and(
          eq(lancamentos.userId, userId),
          eq(lancamentos.tipo, 'despesa'),
          eq(lancamentos.paga, false),
          gte(lancamentos.vencimento, dataIso(hoje)),
          lte(lancamentos.vencimento, dataIso(limiteData)),
        ),
      )
      .orderBy(asc(lancamentos.vencimento))
      .limit(filtros.limite)
    return { itens: linhas.map(paraLancamentoListado) }
  },
  async listarRecentes(userId, filtros) {
    const linhas = await obterBanco()
      .select(colunasLancamentoListado)
      .from(lancamentos)
      .where(eq(lancamentos.userId, userId))
      .orderBy(desc(lancamentos.criadoEm), desc(lancamentos.id))
      .limit(filtros.limite)
    return { itens: linhas.map(paraLancamentoListado) }
  },
}

/** Data "AAAA-MM-DD" (fuso local) de um Date — usado para comparar com a coluna `vencimento`,
 * que e armazenada como data pura, sem hora. */
function dataIso(data: Date) {
  const ano = data.getFullYear()
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

/** Primeiro e último dia (exclusivo) do mês "AAAA-MM", em datas "AAAA-MM-DD". */
function faixaDoMes(mes: string) {
  const [ano, numeroMes] = mes.split('-').map(Number)
  const inicio = `${mes}-01`
  const fim = new Date(Date.UTC(ano, numeroMes, 1)).toISOString().slice(0, 10)
  return { inicio, fim }
}

/** Mês por data de emissão (receita) ou vencimento (despesa). Sem tipo, casa os dois. */
function condicaoDoMes(mes: string, tipo?: 'receita' | 'despesa'): SQL {
  const { inicio, fim } = faixaDoMes(mes)
  const receita = and(gte(lancamentos.dataEmissao, inicio), lt(lancamentos.dataEmissao, fim))!
  const despesa = and(gte(lancamentos.vencimento, inicio), lt(lancamentos.vencimento, fim))!
  if (tipo === 'receita') return receita
  if (tipo === 'despesa') return despesa
  return or(receita, despesa)!
}

function escaparLike(texto: string) {
  return texto.replace(/[\\%_]/g, '\\$&')
}

function condicoesDeFiltro(userId: string, filtros: FiltrosLancamentos): SQL[] {
  const condicoes: SQL[] = [eq(lancamentos.userId, userId)]
  if (filtros.tipo) condicoes.push(eq(lancamentos.tipo, filtros.tipo))
  if (filtros.mes) condicoes.push(condicaoDoMes(filtros.mes, filtros.tipo))
  if (filtros.busca) condicoes.push(ilike(lancamentos.descricao, `%${escaparLike(filtros.busca)}%`))
  if (filtros.cursor) {
    condicoes.push(
      sql`(${lancamentos.criadoEm}, ${lancamentos.id}) > (${filtros.cursor.criadoEm}::timestamptz, ${filtros.cursor.id}::uuid)`,
    )
  }
  return condicoes
}

function adicionarMeses(data: string, quantidade: number) {
  const [ano, mes, dia] = data.split('-').map(Number)
  const primeiroDiaDestino = new Date(Date.UTC(ano, mes - 1 + quantidade, 1))
  const ultimoDiaDestino = new Date(
    Date.UTC(
      primeiroDiaDestino.getUTCFullYear(),
      primeiroDiaDestino.getUTCMonth() + 1,
      0,
    ),
  ).getUTCDate()
  const destino = new Date(
    Date.UTC(
      primeiroDiaDestino.getUTCFullYear(),
      primeiroDiaDestino.getUTCMonth(),
      Math.min(dia, ultimoDiaDestino),
    ),
  )
  return destino.toISOString().slice(0, 10)
}

function prepararLancamentos(
  userId: string,
  dados: z.infer<typeof criarLancamentoSchema>,
): NovoLancamentoBanco[] {
  if (dados.tipo === 'receita') {
    return [{
      userId,
      tipo: 'receita',
      descricao: dados.descricao,
      valor: dados.valor,
      dataEmissao: dados.dataEmissao,
    }]
  }

  if (!dados.parcelado) {
    return [{
      userId,
      tipo: 'despesa',
      descricao: dados.descricao,
      valor: dados.valor,
      vencimento: dados.vencimento,
    }]
  }

  if (!dados.quantidadeParcelas) {
    throw new Error('Quantidade de parcelas obrigatoria')
  }

  const parcelamentoId = randomUUID()

  return Array.from({ length: dados.quantidadeParcelas }, (_, indice) => ({
    userId,
    tipo: 'despesa' as const,
    descricao: dados.descricao,
    valor: dados.valor,
    vencimento: adicionarMeses(dados.vencimento, indice),
    parcelamentoId,
    parcelaAtual: indice + 1,
    totalParcelas: dados.quantidadeParcelas,
  }))
}

const idParamSchema = z.string().uuid()

async function lerCorpoJson(contexto: { req: { json: () => Promise<unknown> } }) {
  try {
    return { sucesso: true as const, dados: await contexto.req.json() }
  } catch {
    return { sucesso: false as const }
  }
}

export function criarRotasLancamentos(
  repositorio: RepositorioLancamentos = repositorioPadrao,
  executarIdempotencia = executarComIdempotencia,
) {
  const app = new Hono<{ Variables: VariaveisAuth }>()

  app.get('/', async (contexto) => {
    const resultado = filtrosLancamentosSchema.safeParse(contexto.req.query())
    if (!resultado.success) return contexto.json({ erro: 'Parâmetros inválidos' }, 400)

    const cursor = resultado.data.cursor ? decodificarCursor(resultado.data.cursor) : undefined
    if (resultado.data.cursor && !cursor) return contexto.json({ erro: 'Parâmetros inválidos' }, 400)

    const pagina = await repositorio.listar(contexto.get('userId'), {
      limite: normalizarLimite(resultado.data.limite),
      cursor: cursor ?? undefined,
      tipo: resultado.data.tipo,
      mes: resultado.data.mes,
      busca: resultado.data.busca,
    })
    return contexto.json({ itens: pagina.itens, proximoCursor: pagina.proximoCursor })
  })

  app.get('/resumo', async (contexto) => {
    const mes = contexto.req.query('mes')
    if (mes !== undefined && !mesSchema.safeParse(mes).success) {
      return contexto.json({ erro: 'Parâmetros inválidos' }, 400)
    }
    return contexto.json(await repositorio.resumo(contexto.get('userId'), mes))
  })

  app.get('/parcelamentos', async (contexto) => {
    const resultado = filtrosPaginaSchema.safeParse(contexto.req.query())
    if (!resultado.success) return contexto.json({ erro: 'Parâmetros inválidos' }, 400)

    const cursor = resultado.data.cursor ? decodificarCursor(resultado.data.cursor) : undefined
    if (resultado.data.cursor && !cursor) return contexto.json({ erro: 'Parâmetros inválidos' }, 400)

    const pagina = await repositorio.listarParcelamentos(contexto.get('userId'), {
      limite: normalizarLimite(resultado.data.limite),
      cursor: cursor ?? undefined,
    })
    return contexto.json({ itens: pagina.itens, proximoCursor: pagina.proximoCursor })
  })

  app.get('/vencendo', async (contexto) => {
    const resultado = filtrosVencendoSchema.safeParse(contexto.req.query())
    if (!resultado.success) return contexto.json({ erro: 'Parâmetros inválidos' }, 400)

    const resposta = await repositorio.listarVencendo(contexto.get('userId'), {
      dias: resultado.data.dias ?? DIAS_VENCENDO_PADRAO,
      limite: resultado.data.limite ?? LIMITE_VENCENDO_PADRAO,
    })
    return contexto.json({ itens: resposta.itens })
  })

  app.get('/recentes', async (contexto) => {
    const resultado = filtrosRecentesSchema.safeParse(contexto.req.query())
    if (!resultado.success) return contexto.json({ erro: 'Parâmetros inválidos' }, 400)

    const resposta = await repositorio.listarRecentes(contexto.get('userId'), {
      limite: resultado.data.limite ?? LIMITE_PADRAO,
    })
    return contexto.json({ itens: resposta.itens })
  })

  app.post('/', async (contexto) => {
    const corpo = await lerCorpoJson(contexto)
    if (!corpo.sucesso) return contexto.json({ erro: 'Dados inválidos' }, 400)

    const resultado = criarLancamentoSchema.safeParse(corpo.dados)
    if (!resultado.success) return contexto.json({ erro: 'Dados inválidos' }, 400)

    try {
      const novos = prepararLancamentos(contexto.get('userId'), resultado.data)
      const chave = contexto.req.header('Idempotency-Key')
      if (!chave) {
        const criados = await repositorio.criarMuitos(novos)
        return contexto.json(criados, 201)
      }
      const chaveValida = z.string().uuid().safeParse(chave)
      if (!chaveValida.success) return contexto.json({ erro: 'Chave de idempotência inválida' }, 400)

      const idempotencia = await executarIdempotencia({
        userId: contexto.get('userId'),
        chave: chaveValida.data,
        operacao: 'lancamentos.criar',
        payload: resultado.data,
      }, async (banco) => ({
        status: 201,
        corpo: await repositorio.criarMuitos(novos, banco),
      }))
      if (idempotencia.tipo === 'conflito') {
        return contexto.json({ erro: 'Chave de idempotência já usada com outro pedido' }, 409)
      }
      return contexto.json(idempotencia.corpo as LancamentoBanco[], 201)
    } catch (erro) {
      if (erro instanceof Error && erro.message.includes('parcelas')) {
        return contexto.json({ erro: 'Informe a quantidade de parcelas' }, 400)
      }
      throw erro
    }
  })

  app.patch('/:id/pagar', async (contexto) => {
    const id = idParamSchema.safeParse(contexto.req.param('id'))
    if (!id.success) return contexto.json({ erro: 'Lançamento não encontrado' }, 404)

    const atualizado = await repositorio.marcarComoPaga(contexto.get('userId'), id.data)
    if (!atualizado) return contexto.json({ erro: 'Lançamento não encontrado' }, 404)
    return contexto.json(atualizado)
  })

  return app
}

export const rotasLancamentos = criarRotasLancamentos()
