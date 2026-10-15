import { describe, expect, it } from 'vitest'

import { criarCaixinhaSchema, depositarCaixinhaSchema, movimentarCaixinhaSchema } from './caixinha'

describe('criarCaixinhaSchema', () => {
  it('rejeita nome vazio', () => {
    const resultado = criarCaixinhaSchema.safeParse({ nome: '', meta: '1.000,00' })
    expect(resultado.success).toBe(false)
  })

  it('aceita nome e meta validos', () => {
    const resultado = criarCaixinhaSchema.safeParse({ nome: 'Viagem', meta: '6.000,00' })
    expect(resultado.success).toBe(true)
  })
})

describe('movimentarCaixinhaSchema', () => {
  it('aceita um valor positivo em formato pt-BR', () => {
    const resultado = movimentarCaixinhaSchema.safeParse({ valor: '2.400,00' })
    expect(resultado.success).toBe(true)
  })

  it('rejeita valor menor ou igual a zero', () => {
    expect(movimentarCaixinhaSchema.safeParse({ valor: '0' }).success).toBe(false)
    expect(movimentarCaixinhaSchema.safeParse({ valor: '0,00' }).success).toBe(false)
  })

  it('nao exige nem aceita o campo origem', () => {
    const resultado = movimentarCaixinhaSchema.safeParse({ valor: '500,00', origem: 'saldo_atual' })
    expect(resultado.success).toBe(true)
    if (resultado.success) expect(resultado.data).not.toHaveProperty('origem')
  })
})

describe('depositarCaixinhaSchema', () => {
  it.each(['saldo_atual', 'de_fora'] as const)('aceita origem %s', (origem) => {
    const resultado = depositarCaixinhaSchema.safeParse({ valor: '500,00', origem })
    expect(resultado.success).toBe(true)
  })

  it('rejeita origem ausente', () => {
    expect(depositarCaixinhaSchema.safeParse({ valor: '500,00' }).success).toBe(false)
  })

  it('rejeita origem invalida', () => {
    expect(depositarCaixinhaSchema.safeParse({ valor: '500,00', origem: 'outro-banco' }).success).toBe(false)
  })
})
