import { randomUUID } from 'node:crypto'

import { and, eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { z } from 'zod'

import {
  lancamentos,
  type LancamentoBanco,
  type NovoLancamentoBanco,
} from '../../db/schema.ts'
import type { VariaveisAuth } from './auth-middleware.ts'
import { obterBanco } from './db.ts'

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
]).refine(
  (dados) =>
    dados.tipo !== 'despesa' ||
    !dados.parcelado ||
    dados.quantidadeParcelas === undefined ||
    dados.valor >= dados.quantidadeParcelas,
  { message: 'Valor insuficiente para a quantidade de parcelas', path: ['quantidadeParcelas'] },
)

export type RepositorioLancamentos = {
  listar: (userId: string) => Promise<LancamentoBanco[]>
  criarMuitos: (dados: NovoLancamentoBanco[]) => Promise<LancamentoBanco[]>
  marcarComoPaga: (userId: string, id: string) => Promise<LancamentoBanco | null>
}

const repositorioPadrao: RepositorioLancamentos = {
  listar(userId) {
    return obterBanco()
      .select()
      .from(lancamentos)
      .where(eq(lancamentos.userId, userId))
      .orderBy(lancamentos.criadoEm)
  },
  criarMuitos(dados) {
    return obterBanco().insert(lancamentos).values(dados).returning()
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
  const valorBase = Math.floor(dados.valor / dados.quantidadeParcelas)
  const resto = dados.valor - valorBase * dados.quantidadeParcelas

  return Array.from({ length: dados.quantidadeParcelas }, (_, indice) => ({
    userId,
    tipo: 'despesa' as const,
    descricao: dados.descricao,
    valor: valorBase + (indice === dados.quantidadeParcelas! - 1 ? resto : 0),
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
) {
  const app = new Hono<{ Variables: VariaveisAuth }>()

  app.get('/', async (contexto) => {
    const dados = await repositorio.listar(contexto.get('userId'))
    return contexto.json(dados)
  })

  app.post('/', async (contexto) => {
    const corpo = await lerCorpoJson(contexto)
    if (!corpo.sucesso) return contexto.json({ erro: 'Dados inválidos' }, 400)

    const resultado = criarLancamentoSchema.safeParse(corpo.dados)
    if (!resultado.success) return contexto.json({ erro: 'Dados inválidos' }, 400)

    try {
      const novos = prepararLancamentos(contexto.get('userId'), resultado.data)
      const criados = await repositorio.criarMuitos(novos)
      return contexto.json(criados, 201)
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
