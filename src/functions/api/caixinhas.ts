import { and, eq, gte, sql } from 'drizzle-orm'
import { Hono } from 'hono'
import { z } from 'zod'

import {
  caixinhas,
  type CaixinhaBanco,
  type NovaCaixinhaBanco,
} from '../../db/schema.ts'
import type { VariaveisAuth } from './auth-middleware.ts'
import { obterBanco } from './db.ts'

const criarCaixinhaSchema = z.object({
  nome: z.string().trim().min(1),
  meta: z.number().int().positive(),
})
const movimentarSchema = z.object({ valor: z.number().int().positive() })

export type ResultadoResgate =
  | { tipo: 'ok'; caixinha: CaixinhaBanco }
  | { tipo: 'nao_encontrada' }
  | { tipo: 'saldo_insuficiente' }

export type RepositorioCaixinhas = {
  listar: (userId: string) => Promise<CaixinhaBanco[]>
  criar: (dados: NovaCaixinhaBanco) => Promise<CaixinhaBanco>
  depositar: (userId: string, id: string, valor: number) => Promise<CaixinhaBanco | null>
  resgatar: (userId: string, id: string, valor: number) => Promise<ResultadoResgate>
  excluir: (userId: string, id: string) => Promise<boolean>
}

const repositorioPadrao: RepositorioCaixinhas = {
  listar(userId) {
    return obterBanco()
      .select()
      .from(caixinhas)
      .where(eq(caixinhas.userId, userId))
      .orderBy(caixinhas.criadoEm)
  },
  async criar(dados) {
    const [criada] = await obterBanco().insert(caixinhas).values(dados).returning()
    return criada
  },
  async depositar(userId, id, valor) {
    const [atualizada] = await obterBanco()
      .update(caixinhas)
      .set({
        valorGuardado: sql`${caixinhas.valorGuardado} + ${valor}`,
        atualizadoEm: new Date(),
      })
      .where(and(eq(caixinhas.id, id), eq(caixinhas.userId, userId)))
      .returning()
    return atualizada ?? null
  },
  async resgatar(userId, id, valor) {
    const [atualizada] = await obterBanco()
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
    if (atualizada) return { tipo: 'ok', caixinha: atualizada }

    const [existente] = await obterBanco()
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

export function criarRotasCaixinhas(repositorio: RepositorioCaixinhas = repositorioPadrao) {
  const app = new Hono<{ Variables: VariaveisAuth }>()

  app.get('/', async (contexto) => contexto.json(await repositorio.listar(contexto.get('userId'))))

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

    const resultado = movimentarSchema.safeParse(corpo.dados)
    if (!resultado.success) return contexto.json({ erro: 'Valor inválido' }, 400)

    const atualizada = await repositorio.depositar(contexto.get('userId'), id.data, resultado.data.valor)
    if (!atualizada) return contexto.json({ erro: 'Caixinha não encontrada' }, 404)
    return contexto.json(atualizada)
  })

  app.post('/:id/resgatar', async (contexto) => {
    const id = idParamSchema.safeParse(contexto.req.param('id'))
    if (!id.success) return contexto.json({ erro: 'Caixinha não encontrada' }, 404)

    const corpo = await lerCorpoJson(contexto)
    if (!corpo.sucesso) return contexto.json({ erro: 'Valor inválido' }, 400)

    const resultado = movimentarSchema.safeParse(corpo.dados)
    if (!resultado.success) return contexto.json({ erro: 'Valor inválido' }, 400)

    const resgate = await repositorio.resgatar(contexto.get('userId'), id.data, resultado.data.valor)
    if (resgate.tipo === 'nao_encontrada') return contexto.json({ erro: 'Caixinha não encontrada' }, 404)
    if (resgate.tipo === 'saldo_insuficiente') return contexto.json({ erro: 'Saldo insuficiente' }, 400)
    return contexto.json(resgate.caixinha)
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
