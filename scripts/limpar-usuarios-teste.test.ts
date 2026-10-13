import { describe, expect, it } from 'vitest'

import { limparUsuariosDeTeste } from './limpar-usuarios-teste.mjs'

function poolFalso(usuarios: Array<{ id: string; email: string }>) {
  const chamadas: string[] = []
  return {
    chamadas,
    query: async (sql: string, parametros?: unknown[]) => {
      chamadas.push(sql)
      if (sql.startsWith('select')) return { rows: usuarios }
      if (sql.startsWith('delete')) return { rows: [], rowCount: (parametros?.[0] as string[])?.length ?? 0 }
      throw new Error(`consulta inesperada: ${sql}`)
    },
  }
}

describe('limparUsuariosDeTeste', () => {
  it('remove so usuarios com e-mail de teste', async () => {
    const pool = poolFalso([
      { id: 'a1', email: 'caixinhas-a-123@example.test' },
      { id: 'b2', email: 'pessoa.real@gmail.com' },
    ])

    const resultado = await limparUsuariosDeTeste(pool)

    expect(resultado).toEqual({ removidos: 1 })
    expect(pool.chamadas.some((sql) => sql.startsWith('delete'))).toBe(true)
  })

  it('nao executa delete quando nao ha usuario de teste', async () => {
    const pool = poolFalso([{ id: 'b2', email: 'pessoa.real@gmail.com' }])

    const resultado = await limparUsuariosDeTeste(pool)

    expect(resultado).toEqual({ removidos: 0 })
    expect(pool.chamadas.some((sql) => sql.startsWith('delete'))).toBe(false)
  })
})
