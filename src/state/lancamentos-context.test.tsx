import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { ApiClient } from '@/lib/api-client'
import { criarClienteAuthTeste } from '@/test/test-utils'

import { AuthProvider } from './auth-context'
import { LancamentosProvider, useLancamentos } from './lancamentos-context'

function criarCliente(overrides: Partial<ApiClient> = {}) {
  return {
    get: vi.fn().mockResolvedValue([]),
    post: vi.fn().mockResolvedValue([]),
    postIdempotente: vi.fn().mockResolvedValue([]),
    patch: vi.fn(),
    delete: vi.fn(),
    ...overrides,
  } as unknown as ApiClient
}

function montar(cliente: ApiClient) {
  return renderHook(() => useLancamentos(), {
    wrapper: ({ children }) => (
      <AuthProvider cliente={criarClienteAuthTeste()}>
        <LancamentosProvider cliente={cliente}>{children}</LancamentosProvider>
      </AuthProvider>
    ),
  })
}

describe('LancamentosProvider', () => {
  it('carrega os lancamentos da Function e converte centavos para reais', async () => {
    const cliente = criarCliente({
      get: vi.fn().mockResolvedValue([
        {
          id: 'receita-1', tipo: 'receita', descricao: 'Freelance', valor: 125050,
          dataEmissao: '2026-10-10', paga: false, parcelamentoId: null,
          parcelaAtual: null, totalParcelas: null,
        },
      ]),
    })

    const { result } = montar(cliente)

    expect(result.current.carregando).toBe(true)
    await waitFor(() => expect(result.current.carregando).toBe(false))
    expect(result.current.receitas[0]).toMatchObject({ valor: 1250.5, descricao: 'Freelance' })
    expect(result.current.erro).toBeNull()
  })

  it('adicionarDespesa envia centavos e reflete todas as parcelas devolvidas', async () => {
    const postIdempotente = vi.fn().mockResolvedValue([
      { id: 'parcela-1', tipo: 'despesa', descricao: 'Notebook', valor: 33333,
        vencimento: '2026-10-10', paga: false, parcelamentoId: 'parcelamento-1', parcelaAtual: 1, totalParcelas: 3 },
      { id: 'parcela-2', tipo: 'despesa', descricao: 'Notebook', valor: 33333,
        vencimento: '2026-11-10', paga: false, parcelamentoId: 'parcelamento-1', parcelaAtual: 2, totalParcelas: 3 },
      { id: 'parcela-3', tipo: 'despesa', descricao: 'Notebook', valor: 33334,
        vencimento: '2026-12-10', paga: false, parcelamentoId: 'parcelamento-1', parcelaAtual: 3, totalParcelas: 3 },
    ])
    const cliente = criarCliente({ postIdempotente })
    const { result } = montar(cliente)
    await waitFor(() => expect(result.current.carregando).toBe(false))

    await act(async () => {
      await result.current.adicionarDespesa({
        descricao: 'Notebook', valor: '1.000,00', vencimento: '2026-10-10',
        parcelado: true, quantidadeParcelas: 3,
      })
    })

    expect(postIdempotente).toHaveBeenCalledWith('/lancamentos', {
      tipo: 'despesa', descricao: 'Notebook', valor: 100000,
      vencimento: '2026-10-10', parcelado: true, quantidadeParcelas: 3,
    })
    expect(result.current.despesas.map((item) => item.valor)).toEqual([333.33, 333.33, 333.34])
  })

  it('adicionarReceita usa o POST idempotente com o payload em centavos', async () => {
    const postIdempotente = vi.fn().mockResolvedValue([
      { id: 'receita-1', tipo: 'receita', descricao: 'Freelance', valor: 125050,
        dataEmissao: '2026-10-11', vencimento: null, paga: false, parcelamentoId: null,
        parcelaAtual: null, totalParcelas: null },
    ])
    const { result } = montar(criarCliente({ postIdempotente }))
    await waitFor(() => expect(result.current.carregando).toBe(false))

    await act(async () => {
      await result.current.adicionarReceita({
        descricao: 'Freelance', valor: '1.250,50', dataEmissao: '2026-10-11',
      })
    })

    expect(postIdempotente).toHaveBeenCalledWith('/lancamentos', {
      tipo: 'receita', descricao: 'Freelance', valor: 125050, dataEmissao: '2026-10-11',
    })
    expect(result.current.receitas[0]).toMatchObject({ descricao: 'Freelance', valor: 1250.5 })
  })

  it('expoe a falha inicial e permite tentar novamente', async () => {
    const get = vi.fn()
      .mockRejectedValueOnce(new Error('Function indisponivel'))
      .mockResolvedValueOnce([])
    const { result } = montar(criarCliente({ get }))

    await waitFor(() => expect(result.current.erro).toBe('Function indisponivel'))
    await act(async () => result.current.recarregar())

    expect(result.current.erro).toBeNull()
    expect(get).toHaveBeenCalledTimes(2)
  })
})
