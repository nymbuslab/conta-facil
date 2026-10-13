import { createHash } from 'node:crypto'

import { and, eq, sql } from 'drizzle-orm'

import { idempotencias } from '../../db/schema.ts'
import { obterBanco } from './db.ts'

export type RegistroIdempotencia = {
  userId: string
  chave: string
  operacao: string
  hashRequisicao: string
  statusResposta: number
  corpoResposta: unknown
}

export type TransacaoIdempotencia = {
  banco: unknown
  bloquear: (userId: string, chave: string) => Promise<void>
  buscar: (userId: string, chave: string) => Promise<RegistroIdempotencia | null>
  salvar: (registro: RegistroIdempotencia) => Promise<void>
}

export type ArmazenamentoIdempotencia = {
  transacionar: <T>(callback: (transacao: TransacaoIdempotencia) => Promise<T>) => Promise<T>
}

type EntradaIdempotencia = {
  userId: string
  chave: string
  operacao: string
  payload: unknown
}

type RespostaMutacao = { status: number; corpo: unknown }
type ResultadoIdempotencia =
  | { tipo: 'executada' | 'replay'; status: number; corpo: unknown }
  | { tipo: 'conflito' }

function ordenar(valor: unknown): unknown {
  if (Array.isArray(valor)) return valor.map(ordenar)
  if (valor && typeof valor === 'object') {
    return Object.fromEntries(
      Object.entries(valor as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([chave, item]) => [chave, ordenar(item)]),
    )
  }
  return valor
}

export function calcularHashRequisicao(payload: unknown) {
  return createHash('sha256').update(JSON.stringify(ordenar(payload))).digest('hex')
}

const armazenamentoPostgres: ArmazenamentoIdempotencia = {
  transacionar(callback) {
    return obterBanco().transaction(async (banco) => callback({
      banco,
      async bloquear(userId, chave) {
        await banco.execute(
          sql`select pg_advisory_xact_lock(hashtextextended(${`${userId}:${chave}`}, 0))`,
        )
      },
      async buscar(userId, chave) {
        const [registro] = await banco
          .select()
          .from(idempotencias)
          .where(and(eq(idempotencias.userId, userId), eq(idempotencias.chave, chave)))
        return registro ?? null
      },
      async salvar(registro) {
        await banco.insert(idempotencias).values(registro)
      },
    }))
  },
}

export function criarExecutorIdempotencia(
  armazenamento: ArmazenamentoIdempotencia = armazenamentoPostgres,
  registrar: (metadados: Record<string, unknown>) => void = console.info,
) {
  return async function executar(
    entrada: EntradaIdempotencia,
    mutacao: (banco: unknown) => Promise<RespostaMutacao>,
  ): Promise<ResultadoIdempotencia> {
    const hashRequisicao = calcularHashRequisicao(entrada.payload)

    return armazenamento.transacionar(async (transacao) => {
      await transacao.bloquear(entrada.userId, entrada.chave)
      const existente = await transacao.buscar(entrada.userId, entrada.chave)

      if (existente) {
        if (existente.operacao !== entrada.operacao || existente.hashRequisicao !== hashRequisicao) {
          registrar({ evento: 'idempotencia', operacao: entrada.operacao, resultado: 'conflito', replay: false })
          return { tipo: 'conflito' }
        }
        registrar({ evento: 'idempotencia', operacao: entrada.operacao, resultado: 'replay', replay: true })
        return {
          tipo: 'replay',
          status: existente.statusResposta,
          corpo: existente.corpoResposta,
        }
      }

      const resposta = await mutacao(transacao.banco)
      await transacao.salvar({
        userId: entrada.userId,
        chave: entrada.chave,
        operacao: entrada.operacao,
        hashRequisicao,
        statusResposta: resposta.status,
        corpoResposta: resposta.corpo,
      })
      registrar({ evento: 'idempotencia', operacao: entrada.operacao, resultado: 'executada', replay: false })
      return { tipo: 'executada', ...resposta }
    })
  }
}

export const executarComIdempotencia = criarExecutorIdempotencia()
