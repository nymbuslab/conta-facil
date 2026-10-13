import { describe, expect, it } from 'vitest'

import { DIAS_RETENCAO_PADRAO, limparIdempotenciasExpiradas } from './limpar-idempotencias.mjs'

function poolFalso(rowCount: number) {
  const chamadas: Array<{ sql: string; parametros?: unknown[] }> = []
  return {
    chamadas,
    query: async (sql: string, parametros?: unknown[]) => {
      chamadas.push({ sql, parametros })
      return { rows: [], rowCount }
    },
  }
}

describe('limparIdempotenciasExpiradas', () => {
  it('usa 90 dias como retencao padrao', async () => {
    const pool = poolFalso(3)

    const resultado = await limparIdempotenciasExpiradas(pool)

    expect(resultado).toEqual({ removidos: 3 })
    expect(pool.chamadas[0].parametros).toEqual([DIAS_RETENCAO_PADRAO])
  })

  it('aceita um prazo de retencao customizado', async () => {
    const pool = poolFalso(0)

    await limparIdempotenciasExpiradas(pool, 30)

    expect(pool.chamadas[0].parametros).toEqual([30])
  })

  it('recusa um prazo de retencao invalido', async () => {
    const pool = poolFalso(0)

    await expect(limparIdempotenciasExpiradas(pool, 0)).rejects.toThrow(/positivo/)
    await expect(limparIdempotenciasExpiradas(pool, Number.NaN)).rejects.toThrow(/positivo/)
  })
})
