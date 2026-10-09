import { renderHook, act } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { LancamentosProvider, useLancamentos } from './lancamentos-context'

function montar() {
  return renderHook(() => useLancamentos(), {
    wrapper: ({ children }) => <LancamentosProvider>{children}</LancamentosProvider>,
  })
}

describe('adicionarDespesa — parcelamento', () => {
  it('gera 3 despesas compartilhando o mesmo parcelamentoId, com valores 333,33 / 333,33 / 333,34', () => {
    const { result } = montar()

    act(() => {
      result.current.adicionarDespesa({
        dataEmissao: '2026-10-05',
        descricao: 'Notebook',
        valor: '1.000,00',
        vencimento: '2026-10-10',
        parcelado: true,
        quantidadeParcelas: 3,
      })
    })

    const geradas = result.current.despesas.filter((d) => d.descricao === 'Notebook')
    expect(geradas).toHaveLength(3)

    const parcelamentoId = geradas[0].parcelamentoId
    expect(parcelamentoId).not.toBeNull()
    expect(geradas.every((d) => d.parcelamentoId === parcelamentoId)).toBe(true)

    const valores = geradas
      .slice()
      .sort((a, b) => (a.parcelaAtual ?? 0) - (b.parcelaAtual ?? 0))
      .map((d) => d.valor)
    expect(valores).toEqual([333.33, 333.33, 333.34])

    const somaExata = valores.reduce((soma, v) => soma + v, 0)
    expect(Math.round(somaExata * 100) / 100).toBe(1000)
  })

  it('cada parcela vence um mes apos a anterior, com a mesma dataEmissao do grupo', () => {
    const { result } = montar()

    act(() => {
      result.current.adicionarDespesa({
        dataEmissao: '2026-10-05',
        descricao: 'Sofá',
        valor: '600,00',
        vencimento: '2026-10-10',
        parcelado: true,
        quantidadeParcelas: 3,
      })
    })

    const geradas = result.current.despesas
      .filter((d) => d.descricao === 'Sofá')
      .sort((a, b) => (a.parcelaAtual ?? 0) - (b.parcelaAtual ?? 0))

    expect(geradas.map((d) => d.vencimento)).toEqual(['2026-10-10', '2026-11-10', '2026-12-10'])
    expect(geradas.every((d) => d.dataEmissao === '2026-10-05')).toBe(true)
    expect(geradas.map((d) => d.parcelaAtual)).toEqual([1, 2, 3])
    expect(geradas.every((d) => d.totalParcelas === 3)).toBe(true)
  })
})

describe('marcarComoPaga', () => {
  it('altera paga para true apenas na despesa com o id chamado', () => {
    const { result } = montar()
    const idAlvo = result.current.despesas[0].id
    const idOutro = result.current.despesas[1].id

    act(() => {
      result.current.marcarComoPaga(idAlvo)
    })

    expect(result.current.despesas.find((d) => d.id === idAlvo)?.paga).toBe(true)
    expect(result.current.despesas.find((d) => d.id === idOutro)?.paga).toBe(false)
  })
})
