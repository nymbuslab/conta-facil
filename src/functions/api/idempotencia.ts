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

    const resultado = await armazenamento.transacionar(async (transacao) => {
      await transacao.bloquear(entrada.userId, entrada.chave)
      const existente = await transacao.buscar(entrada.userId, entrada.chave)

      if (existente) {
        if (existente.operacao !== entrada.operacao || existente.hashRequisicao !== hashRequisicao) {
          return { tipo: 'conflito' as const }
        }
        return {
          tipo: 'replay' as const,
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
      return { tipo: 'executada' as const, ...resposta }
    })

    // Registrado so apos transacionar() resolver: o commit ja foi confirmado pelo Postgres,
    // entao o log nunca diverge de uma falha de commit que o callback nao chegaria a ver.
    const resultadoPorTipo = {
      conflito: 'conflito',
      replay: 'replay',
      executada: 'executada',
    } as const
    registrar({
      evento: 'idempotencia',
      operacao: entrada.operacao,
      resultado: resultadoPorTipo[resultado.tipo],
      replay: resultado.tipo === 'replay',
    })

    return resultado
  }
}

export const executarComIdempotencia = criarExecutorIdempotencia()
