import { describe, expect, it } from 'vitest'

import { criarCenarioIdempotencia } from './idempotencia-fixtures'

describe('fixtures de idempotencia', () => {
  it.each(['lancamento', 'deposito', 'resgate'] as const)(
    'cria cenario independente para %s',
    (operacao) => {
      const primeiro = criarCenarioIdempotencia(operacao)
      const segundo = criarCenarioIdempotencia(operacao)

      expect(primeiro.chave).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
      expect(primeiro.repeticao).toEqual(primeiro.original)
      expect(primeiro.repeticao).not.toBe(primeiro.original)
      expect(primeiro.conflito).not.toEqual(primeiro.original)
      expect(primeiro.conflito).not.toBe(primeiro.original)
      expect(primeiro.conflito).toEqual({
        ...primeiro.original,
        valor: primeiro.original.valor + 1,
      })
      expect(segundo.chave).not.toBe(primeiro.chave)

      primeiro.original.valor = 1
      expect(segundo.original.valor).not.toBe(1)
      expect(primeiro.repeticao.valor).not.toBe(1)
    },
  )

})
