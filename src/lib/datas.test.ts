import { describe, expect, it } from 'vitest'

import { estaVencida } from './datas'

describe('estaVencida', () => {
  const hoje = new Date(2026, 9, 13) // 2026-10-13

  it('retorna true quando o vencimento já passou', () => {
    expect(estaVencida('2026-10-10', hoje)).toBe(true)
  })

  it('retorna false quando o vencimento é hoje', () => {
    expect(estaVencida('2026-10-13', hoje)).toBe(false)
  })

  it('retorna false quando o vencimento ainda não chegou', () => {
    expect(estaVencida('2026-10-15', hoje)).toBe(false)
  })
})
