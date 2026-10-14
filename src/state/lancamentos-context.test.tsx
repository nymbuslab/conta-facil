import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { ApiClient } from '@/lib/api-client'
import { criarClienteAuthTeste } from '@/test/test-utils'

import { AuthProvider } from './auth-context'
import { LancamentosProvider, useLancamentos } from './lancamentos-context'

function envelope(itens: unknown[] = [], proximoCursor: string | null = null) {
  return { itens, proximoCursor }
}

function criarCliente(overrides: Record<string, unknown> = {}) {
  return {
    get: vi.fn().mockResolvedValue(envelope()),
    post: vi.fn().mockResolvedValue([]),
    postIdempotente: vi.fn().mockResolvedValue([]),
    patch: vi.fn(),
    delete: vi.fn(),
    ...overrides,
  } as unknown as ApiClient
}

/** `get` que distingue as tres consultas do contexto (pagina, resumo e parcelamentos por mes). */
function getPorTipo(respostas: { receita?: unknown[]; despesa?: unknown[]; resumo?: { receitas: number; despesas: number } }) {
  return vi.fn(async (caminho: string) => {
    if (caminho.startsWith('/lancamentos/resumo')) {
      return respostas.resumo ?? { receitas: 0, despesas: 0 }
    }
    if (caminho.startsWith('/lancamentos/parcelamentos')) return envelope()
    const tipo = new URLSearchParams(caminho.split('?')[1] ?? '').get('tipo')
    return envelope(tipo === 'receita' ? respostas.receita ?? [] : respostas.despesa ?? [])
  })
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

const receitaSalario = {
  id: 'receita-1', tipo: 'receita', descricao: 'Freelance', valor: 125050,
  dataEmissao: '2026-10-10', vencimento: null, paga: false,
  parcelamentoId: null, parcelaAtual: null, totalParcelas: null,
}

describe('LancamentosProvider', () => {
  it('carrega os lancamentos da Function e converte centavos para reais', async () => {
    const get = getPorTipo({ receita: [receitaSalario], resumo: { receitas: 125050, despesas: 0 } })
    const { result } = montar(criarCliente({ get }))

    expect(result.current.carregando).toBe(true)
    await waitFor(() => expect(result.current.carregando).toBe(false))
    expect(result.current.receitas[0]).toMatchObject({ valor: 1250.5, descricao: 'Freelance' })
    expect(result.current.saldoReceita).toBe(1250.5)
    expect(result.current.erro).toBeNull()
  })

  it('adicionarDespesa envia centavos e so exibe as parcelas do mes vigente', async () => {
    const postIdempotente = vi.fn().mockResolvedValue([
      { id: 'parcela-1', tipo: 'despesa', descricao: 'Notebook', valor: 33333,
        vencimento: '2026-10-10', paga: false, parcelamentoId: 'parcelamento-1', parcelaAtual: 1, totalParcelas: 3 },
      { id: 'parcela-2', tipo: 'despesa', descricao: 'Notebook', valor: 33333,
        vencimento: '2026-11-10', paga: false, parcelamentoId: 'parcelamento-1', parcelaAtual: 2, totalParcelas: 3 },
      { id: 'parcela-3', tipo: 'despesa', descricao: 'Notebook', valor: 33334,
        vencimento: '2026-12-10', paga: false, parcelamentoId: 'parcelamento-1', parcelaAtual: 3, totalParcelas: 3 },
    ])
    const cliente = criarCliente({ get: getPorTipo({}), postIdempotente })
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
    // So a parcela de outubro entra na lista do mes vigente.
    expect(result.current.despesas.map((item) => item.id)).toEqual(['parcela-1'])
    expect(result.current.despesas.map((item) => item.valor)).toEqual([333.33])
  })

  it('adicionarReceita usa o POST idempotente com o payload em centavos', async () => {
    const postIdempotente = vi.fn().mockResolvedValue([
      { id: 'receita-1', tipo: 'receita', descricao: 'Freelance', valor: 125050,
        dataEmissao: '2026-10-11', vencimento: null, paga: false, parcelamentoId: null,
        parcelaAtual: null, totalParcelas: null },
    ])
    const { result } = montar(criarCliente({ get: getPorTipo({}), postIdempotente }))
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

  it('carregarMaisReceitas busca a proxima pagina com o cursor devolvido', async () => {
    const get = vi.fn(async (caminho: string) => {
      if (caminho.startsWith('/lancamentos/resumo')) return { receitas: 125050, despesas: 0 }
      if (caminho.startsWith('/lancamentos/parcelamentos')) return envelope()
      const params = new URLSearchParams(caminho.split('?')[1] ?? '')
      if (params.get('tipo') === 'receita') {
        return params.get('cursor')
          ? envelope([{ ...receitaSalario, id: 'receita-2', descricao: 'Freela extra', valor: 50000 }])
          : envelope([receitaSalario], 'cursor-1')
      }
      return envelope()
    })
    const { result } = montar(criarCliente({ get }))
    await waitFor(() => expect(result.current.carregando).toBe(false))
    expect(result.current.temMaisReceitas).toBe(true)

    await act(async () => {
      await result.current.carregarMaisReceitas()
    })

    expect(result.current.receitas.map((item) => item.id)).toEqual(['receita-1', 'receita-2'])
    expect(get).toHaveBeenCalledWith(expect.stringContaining('cursor=cursor-1'))
  })

  it('definirFiltros troca o mes e recarrega a lista', async () => {
    const get = getPorTipo({})
    const { result } = montar(criarCliente({ get }))
    await waitFor(() => expect(result.current.carregando).toBe(false))

    await act(async () => {
      result.current.definirFiltros({ mes: '2026-09' })
    })

    await waitFor(() => expect(result.current.filtros.mes).toBe('2026-09'))
    expect(get).toHaveBeenCalledWith(expect.stringContaining('mes=2026-09'))
  })

  it('expoe a falha inicial e permite tentar novamente', async () => {
    const get = vi.fn()
      .mockRejectedValueOnce(new Error('Function indisponivel'))
      .mockImplementation(async (caminho: string) => (
        caminho.startsWith('/lancamentos/resumo') ? { receitas: 0, despesas: 0 } : envelope()
      ))
    const { result } = montar(criarCliente({ get }))

    await waitFor(() => expect(result.current.erro).toBe('Function indisponivel'))
    await act(async () => result.current.recarregar())

    expect(result.current.erro).toBeNull()
  })
})
