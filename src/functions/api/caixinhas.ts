import { and, asc, eq, gte, sql } from 'drizzle-orm'
import { Hono } from 'hono'
import { z } from 'zod'

import {
  caixinhaMovimentacoes,
  caixinhas,
  type CaixinhaBanco,
  type NovaCaixinhaBanco,
} from '../../db/schema.ts'
import {
  decodificarCursor,
  LIMITE_MAXIMO,
  montarPagina,
  normalizarLimite,
  type Cursor,
  type Pagina,
} from '../../lib/paginacao.ts'
import type { VariaveisAuth } from './auth-middleware.ts'
import { obterBanco } from './db.ts'
import { executarComIdempotencia } from './idempotencia.ts'
import { criarLancamentoReceita } from './lancamentos-shared.ts'

const criarCaixinhaSchema = z.object({
  nome: z.string().trim().min(1),
  meta: z.number().int().positive(),
})
const origemSchema = z.enum(['saldo_atual', 'de_fora'])
const movimentarSchema = z.object({ valor: z.number().int().positive() })
const depositarSchema = z.object({
  valor: z.number().int().positive(),
  origem: origemSchema.optional().default('saldo_atual'),
})

function hojeISO() {
  return new Date().toISOString().slice(0, 10)
}
const filtrosPaginaSchema = z.object({
  limite: z.coerce.number().int().min(1).max(LIMITE_MAXIMO).optional(),
  cursor: z.string().min(1).optional(),
})

export interface FiltrosPagina {
  limite: number
  cursor?: Cursor
}

export type ResultadoResgate =
  | { tipo: 'ok'; caixinha: CaixinhaBanco }
  | { tipo: 'nao_encontrada' }
  | { tipo: 'saldo_insuficiente' }

/** Campos que a listagem de caixinhas expõe. Sem `userId` nem timestamps internos. */
export interface CaixinhaListada {
  id: string
  nome: string
  valorGuardado: number
  meta: number
}

/** Projeção explícita da listagem; `criadoEm` fica só para o cursor keyset. */
export const colunasCaixinhaListada = {
  id: caixinhas.id,
  nome: caixinhas.nome,
  valorGuardado: caixinhas.valorGuardado,
  meta: caixinhas.meta,
  criadoEm: caixinhas.criadoEm,
} as const

/** Descarta `criadoEm` e devolve só o shape público da listagem. */
export function paraCaixinhaListada(item: CaixinhaListada & { criadoEm: Date }): CaixinhaListada {
  return {
    id: item.id,
    nome: item.nome,
    valorGuardado: item.valorGuardado,
    meta: item.meta,
  }
}

export type OrigemDeposito = 'saldo_atual' | 'de_fora'

export type RepositorioCaixinhas = {
  listar: (userId: string, filtros: FiltrosPagina) => Promise<Pagina<CaixinhaListada>>
  totalGuardado: (userId: string) => Promise<number>
  criar: (dados: NovaCaixinhaBanco) => Promise<CaixinhaBanco>
  depositar: (
    userId: string,
    id: string,
    valor: number,
    origem: OrigemDeposito,
    banco?: unknown,
  ) => Promise<CaixinhaBanco | null>
  resgatar: (userId: string, id: string, valor: number, banco?: unknown) => Promise<ResultadoResgate>
  excluir: (userId: string, id: string) => Promise<boolean>
}

export const repositorioPadrao: RepositorioCaixinhas = {
  async listar(userId, filtros) {
    const linhas = await obterBanco()
      .select(colunasCaixinhaListada)
      .from(caixinhas)
      .where(
        and(
          eq(caixinhas.userId, userId),
          filtros.cursor
            ? sql`(${caixinhas.criadoEm}, ${caixinhas.id}) > (${filtros.cursor.criadoEm}::timestamptz, ${filtros.cursor.id}::uuid)`
            : undefined,
        ),
      )
      .orderBy(asc(caixinhas.criadoEm), asc(caixinhas.id))
      .limit(filtros.limite + 1)
    const pagina = montarPagina(linhas, filtros.limite, (item) => ({
      criadoEm: item.criadoEm.toISOString(),
      id: item.id,
    }))
    return {
      itens: pagina.itens.map(paraCaixinhaListada),
      proximoCursor: pagina.proximoCursor,
    }
  },
  async totalGuardado(userId) {
    const [linha] = await obterBanco()
      .select({ total: sql<number>`coalesce(sum(${caixinhas.valorGuardado}), 0)::int` })
      .from(caixinhas)
      .where(eq(caixinhas.userId, userId))
    return linha?.total ?? 0
  },
  async criar(dados) {
    const [criada] = await obterBanco().insert(caixinhas).values(dados).returning()
    return criada
  },
  async depositar(userId, id, valor, origem, transacao) {
    const banco = (transacao ?? obterBanco()) as ReturnType<typeof obterBanco>

    let lancamentoId: string | null = null
    if (origem === 'de_fora') {
      const lancamento = await criarLancamentoReceita({ userId, valor, dataEmissao: hojeISO() }, banco)
      lancamentoId = lancamento.id
    }

    const [atualizada] = await banco
      .update(caixinhas)
      .set({
        valorGuardado: sql`${caixinhas.valorGuardado} + ${valor}`,
        atualizadoEm: new Date(),
      })
      .where(and(eq(caixinhas.id, id), eq(caixinhas.userId, userId)))
      .returning()
    if (!atualizada) return null

    await banco.insert(caixinhaMovimentacoes).values({
      userId,
      caixinhaId: id,
      tipo: 'deposito',
      origem,
      valor,
      lancamentoId,
    })

    return atualizada
  },
  async resgatar(userId, id, valor, transacao) {
    const banco = (transacao ?? obterBanco()) as ReturnType<typeof obterBanco>
    const [atualizada] = await banco
      .update(caixinhas)
      .set({
        valorGuardado: sql`${caixinhas.valorGuardado} - ${valor}`,
        atualizadoEm: new Date(),
      })
      .where(
        and(
          eq(caixinhas.id, id),
          eq(caixinhas.userId, userId),
          gte(caixinhas.valorGuardado, valor),
        ),
      )
      .returning()
    if (atualizada) {
      await banco.insert(caixinhaMovimentacoes).values({
        userId,
        caixinhaId: id,
        tipo: 'resgate',
        origem: null,
        valor,
        lancamentoId: null,
      })
      return { tipo: 'ok', caixinha: atualizada }
    }

    const [existente] = await banco
      .select()
      .from(caixinhas)
      .where(and(eq(caixinhas.id, id), eq(caixinhas.userId, userId)))
    return existente ? { tipo: 'saldo_insuficiente' } : { tipo: 'nao_encontrada' }
  },
  async excluir(userId, id) {
    const removidas = await obterBanco()
      .delete(caixinhas)
      .where(and(eq(caixinhas.id, id), eq(caixinhas.userId, userId)))
      .returning({ id: caixinhas.id })
    return removidas.length > 0
  },
}

const idParamSchema = z.string().uuid()

async function lerCorpoJson(contexto: { req: { json: () => Promise<unknown> } }) {
  try {
    return { sucesso: true as const, dados: await contexto.req.json() }
  } catch {
    return { sucesso: false as const }
  }
}

class RespostaMovimentacaoError extends Error {
  readonly status: 400 | 404
  readonly corpo: { erro: string }

  constructor(status: 400 | 404, corpo: { erro: string }) {
    super(corpo.erro)
    this.status = status
    this.corpo = corpo
  }
}

/** Transacao simples (sem idempotencia) para compor mais de uma escrita atomicamente - usada
 * pelo deposito origem de_fora sem Idempotency-Key, que grava caixinha_movimentacoes e
 * lancamentos juntos. Injetavel para teste; em producao abre uma transacao real no Postgres. */
type TransacaoSimples = <T>(callback: (banco: unknown) => Promise<T>) => Promise<T>
const transacaoSimplesPadrao: TransacaoSimples = (callback) => obterBanco().transaction(callback)

export function criarRotasCaixinhas(
  repositorio: RepositorioCaixinhas = repositorioPadrao,
  executarIdempotencia = executarComIdempotencia,
  transacionar: TransacaoSimples = transacaoSimplesPadrao,
) {
  const app = new Hono<{ Variables: VariaveisAuth }>()

  app.get('/', async (contexto) => {
    const resultado = filtrosPaginaSchema.safeParse(contexto.req.query())
    if (!resultado.success) return contexto.json({ erro: 'Parâmetros inválidos' }, 400)

    const cursor = resultado.data.cursor ? decodificarCursor(resultado.data.cursor) : undefined
    if (resultado.data.cursor && !cursor) return contexto.json({ erro: 'Parâmetros inválidos' }, 400)

    const userId = contexto.get('userId')
    const [pagina, totalGuardado] = await Promise.all([
      repositorio.listar(userId, {
        limite: normalizarLimite(resultado.data.limite),
        cursor: cursor ?? undefined,
      }),
      repositorio.totalGuardado(userId),
    ])
    return contexto.json({
      itens: pagina.itens,
      proximoCursor: pagina.proximoCursor,
      totalGuardado,
    })
  })

  app.post('/', async (contexto) => {
    const corpo = await lerCorpoJson(contexto)
    if (!corpo.sucesso) return contexto.json({ erro: 'Dados inválidos' }, 400)

    const resultado = criarCaixinhaSchema.safeParse(corpo.dados)
    if (!resultado.success) return contexto.json({ erro: 'Dados inválidos' }, 400)

    const criada = await repositorio.criar({
      userId: contexto.get('userId'),
      nome: resultado.data.nome,
      meta: resultado.data.meta,
    })
    return contexto.json(criada, 201)
  })

  app.post('/:id/depositar', async (contexto) => {
    const id = idParamSchema.safeParse(contexto.req.param('id'))
    if (!id.success) return contexto.json({ erro: 'Caixinha não encontrada' }, 404)

    const corpo = await lerCorpoJson(contexto)
    if (!corpo.sucesso) return contexto.json({ erro: 'Valor inválido' }, 400)

    const resultado = depositarSchema.safeParse(corpo.dados)
    if (!resultado.success) return contexto.json({ erro: 'Valor inválido' }, 400)

    const chave = contexto.req.header('Idempotency-Key')
    if (!chave) {
      // origem de_fora grava duas tabelas (caixinha_movimentacoes e, quando aplicavel,
      // lancamentos) - mesmo sem chave de idempotencia, as duas escritas precisam ser atomicas.
      if (resultado.data.origem === 'de_fora') {
        try {
          const atualizada = await transacionar(async (transacao) => {
            const linha = await repositorio.depositar(
              contexto.get('userId'), id.data, resultado.data.valor, resultado.data.origem, transacao,
            )
            if (!linha) throw new RespostaMovimentacaoError(404, { erro: 'Caixinha não encontrada' })
            return linha
          })
          return contexto.json(atualizada)
        } catch (erro) {
          if (erro instanceof RespostaMovimentacaoError) return contexto.json(erro.corpo, erro.status)
          throw erro
        }
      }
      const atualizada = await repositorio.depositar(
        contexto.get('userId'), id.data, resultado.data.valor, resultado.data.origem,
      )
      if (!atualizada) return contexto.json({ erro: 'Caixinha não encontrada' }, 404)
      return contexto.json(atualizada)
    }
    const chaveValida = z.string().uuid().safeParse(chave)
    if (!chaveValida.success) return contexto.json({ erro: 'Chave de idempotência inválida' }, 400)
    try {
      const idempotencia = await executarIdempotencia({
        userId: contexto.get('userId'), chave: chaveValida.data,
        operacao: 'caixinhas.depositar', payload: { id: id.data, ...resultado.data },
      }, async (banco) => {
        const atualizada = await repositorio.depositar(
          contexto.get('userId'), id.data, resultado.data.valor, resultado.data.origem, banco,
        )
        if (!atualizada) throw new RespostaMovimentacaoError(404, { erro: 'Caixinha não encontrada' })
        return { status: 200, corpo: atualizada }
      })
      if (idempotencia.tipo === 'conflito') return contexto.json({ erro: 'Chave de idempotência já usada com outro pedido' }, 409)
      return contexto.json(idempotencia.corpo as CaixinhaBanco)
    } catch (erro) {
      if (erro instanceof RespostaMovimentacaoError) return contexto.json(erro.corpo, erro.status)
      throw erro
    }
  })

  app.post('/:id/resgatar', async (contexto) => {
    const id = idParamSchema.safeParse(contexto.req.param('id'))
    if (!id.success) return contexto.json({ erro: 'Caixinha não encontrada' }, 404)

    const corpo = await lerCorpoJson(contexto)
    if (!corpo.sucesso) return contexto.json({ erro: 'Valor inválido' }, 400)

    const resultado = movimentarSchema.safeParse(corpo.dados)
    if (!resultado.success) return contexto.json({ erro: 'Valor inválido' }, 400)

    const chave = contexto.req.header('Idempotency-Key')
    if (!chave) {
      const resgate = await repositorio.resgatar(contexto.get('userId'), id.data, resultado.data.valor)
      if (resgate.tipo === 'nao_encontrada') return contexto.json({ erro: 'Caixinha não encontrada' }, 404)
      if (resgate.tipo === 'saldo_insuficiente') return contexto.json({ erro: 'Saldo insuficiente' }, 400)
      return contexto.json(resgate.caixinha)
    }
    const chaveValida = z.string().uuid().safeParse(chave)
    if (!chaveValida.success) return contexto.json({ erro: 'Chave de idempotência inválida' }, 400)
    try {
      const idempotencia = await executarIdempotencia({
        userId: contexto.get('userId'), chave: chaveValida.data,
        operacao: 'caixinhas.resgatar', payload: { id: id.data, ...resultado.data },
      }, async (banco) => {
        const resgate = await repositorio.resgatar(contexto.get('userId'), id.data, resultado.data.valor, banco)
        if (resgate.tipo === 'nao_encontrada') throw new RespostaMovimentacaoError(404, { erro: 'Caixinha não encontrada' })
        if (resgate.tipo === 'saldo_insuficiente') throw new RespostaMovimentacaoError(400, { erro: 'Saldo insuficiente' })
        return { status: 200, corpo: resgate.caixinha }
      })
      if (idempotencia.tipo === 'conflito') return contexto.json({ erro: 'Chave de idempotência já usada com outro pedido' }, 409)
      return contexto.json(idempotencia.corpo as CaixinhaBanco)
    } catch (erro) {
      if (erro instanceof RespostaMovimentacaoError) return contexto.json(erro.corpo, erro.status)
      throw erro
    }
  })

  app.delete('/:id', async (contexto) => {
    const id = idParamSchema.safeParse(contexto.req.param('id'))
    if (!id.success) return contexto.json({ erro: 'Caixinha não encontrada' }, 404)

    const excluida = await repositorio.excluir(contexto.get('userId'), id.data)
    if (!excluida) return contexto.json({ erro: 'Caixinha não encontrada' }, 404)
    return contexto.body(null, 204)
  })

  return app
}

export const rotasCaixinhas = criarRotasCaixinhas()
