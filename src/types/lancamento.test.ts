import { describe, expect, it } from 'vitest'

import { despesaFormSchema } from './lancamento'

const basico = {
  descricao: 'Compra parcelada',
  valor: '1.000,00',
  vencimento: '2026-10-10',
}

describe('despesaFormSchema — parcelamento', () => {
  it('rejeita parcelado true sem quantidadeParcelas', () => {
    const resultado = despesaFormSchema.safeParse({ ...basico, parcelado: true })
    expect(resultado.success).toBe(false)
  })

  it('aceita parcelado false sem exigir quantidadeParcelas', () => {
    const resultado = despesaFormSchema.safeParse({ ...basico, parcelado: false })
    expect(resultado.success).toBe(true)
  })

  it('aceita parcelado true com quantidadeParcelas valida', () => {
    const resultado = despesaFormSchema.safeParse({
      ...basico,
      parcelado: true,
      quantidadeParcelas: 3,
    })
    expect(resultado.success).toBe(true)
  })

  it('rejeita quantidadeParcelas menor que 2', () => {
    const resultado = despesaFormSchema.safeParse({
      ...basico,
      parcelado: true,
      quantidadeParcelas: 1,
    })
    expect(resultado.success).toBe(false)
  })
})
