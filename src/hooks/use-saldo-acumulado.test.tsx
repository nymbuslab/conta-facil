import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { CaixinhasProvider, useCaixinhas } from '@/state/caixinhas-context'
import type { Despesa, Receita } from '@/types/lancamento'

import { useSaldoAcumulado } from './use-saldo-acumulado'

const receitas: Receita[] = [
  { id: 'r1', tipo: 'receita', dataEmissao: '2026-10-05', descricao: 'Salário', valor: 6450 },
]

const despesas: Despesa[] = [
  {
    id: 'd1',
    tipo: 'despesa',
    descricao: 'Aluguel',
    valor: 3119.5,
    vencimento: '2026-10-10',
    paga: false,
    parcelamentoId: null,
    parcelaAtual: null,
    totalParcelas: null,
  },
]

function Wrapper({ children }: { children: React.ReactNode }) {
  return <CaixinhasProvider>{children}</CaixinhasProvider>
}

describe('useSaldoAcumulado', () => {
  it('combina Receita, Despesa e totalGuardado das Caixinhas', () => {
    const { result } = renderHook(
      () => ({ saldo: useSaldoAcumulado(receitas, despesas), caixinhas: useCaixinhas() }),
      { wrapper: Wrapper },
    )

    expect(result.current.saldo.saldoAcumulado).toBe(3330.5)

    act(() => {
      result.current.caixinhas.criarCaixinha({ nome: 'Viagem', meta: '1.000,00' })
    })
    const caixinha = result.current.caixinhas.caixinhas[0]

    act(() => {
      result.current.caixinhas.depositar(caixinha.id, { valor: '500,00' })
    })

    expect(result.current.saldo.saldoAcumulado).toBe(2830.5)
  })
})
