import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { CaixinhasProvider, useCaixinhas } from './caixinhas-context'

function montar() {
  return renderHook(() => useCaixinhas(), {
    wrapper: ({ children }) => <CaixinhasProvider>{children}</CaixinhasProvider>,
  })
}

describe('CaixinhasProvider', () => {
  it('criar uma caixinha e depositar reflete no valorGuardado dela e no totalGuardado agregado', () => {
    const { result } = montar()

    act(() => {
      result.current.criarCaixinha({ nome: 'Viagem', meta: '6.000,00' })
    })
    const caixinha = result.current.caixinhas[0]
    expect(caixinha.nome).toBe('Viagem')
    expect(caixinha.valorGuardado).toBe(0)

    act(() => {
      result.current.depositar(caixinha.id, { valor: '2.400,00' })
    })

    expect(result.current.caixinhas[0].valorGuardado).toBe(2400)
    expect(result.current.totalGuardado).toBe(2400)
  })

  it('resgatar um valor maior que o guardado nao altera o estado e sinaliza erro', () => {
    const { result } = montar()

    act(() => {
      result.current.criarCaixinha({ nome: 'Reserva', meta: '1.000,00' })
    })
    const caixinha = result.current.caixinhas[0]

    act(() => {
      result.current.depositar(caixinha.id, { valor: '100,00' })
    })

    let resultado: { sucesso: boolean; erro?: string } | undefined
    act(() => {
      resultado = result.current.resgatar(caixinha.id, { valor: '200,00' })
    })

    expect(resultado?.sucesso).toBe(false)
    expect(resultado?.erro).toBeTruthy()
    expect(result.current.caixinhas[0].valorGuardado).toBe(100)
  })

  it('excluir uma caixinha remove ela da lista e reduz totalGuardado pelo valor que ela tinha', () => {
    const { result } = montar()

    act(() => {
      result.current.criarCaixinha({ nome: 'Viagem', meta: '6.000,00' })
      result.current.criarCaixinha({ nome: 'Carro', meta: '20.000,00' })
    })
    const [viagem, carro] = result.current.caixinhas

    act(() => {
      result.current.depositar(viagem.id, { valor: '1.000,00' })
      result.current.depositar(carro.id, { valor: '500,00' })
    })
    expect(result.current.totalGuardado).toBe(1500)

    act(() => {
      result.current.excluirCaixinha(viagem.id)
    })

    expect(result.current.caixinhas.find((c) => c.id === viagem.id)).toBeUndefined()
    expect(result.current.totalGuardado).toBe(500)
  })
})
