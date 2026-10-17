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
    patchIdempotente: vi.fn().mockResolvedValue([]),
    delete: vi.fn(),
    deleteIdempotente: vi.fn().mockResolvedValue({ idsExcluidos: [] }),
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

  it('carregarContasVencendo preenche contasVencendo a partir de /lancamentos/vencendo', async () => {
    const despesaVencendo = {
      id: 'despesa-1', tipo: 'despesa', descricao: 'Luz', valor: 12000,
      dataEmissao: null, vencimento: '2026-10-19', paga: false,
      parcelamentoId: null, parcelaAtual: null, totalParcelas: null,
    }
    const get = vi.fn(async (caminho: string) => {
      if (caminho.startsWith('/lancamentos/vencendo')) return { itens: [despesaVencendo] }
      if (caminho.startsWith('/lancamentos/resumo')) return { receitas: 0, despesas: 0 }
      return envelope()
    })
    const { result } = montar(criarCliente({ get }))
    await waitFor(() => expect(result.current.carregando).toBe(false))

    await act(async () => result.current.carregarContasVencendo())

    expect(result.current.contasVencendo).toHaveLength(1)
    expect(result.current.contasVencendo[0]).toMatchObject({ descricao: 'Luz', valor: 120 })
    expect(get).toHaveBeenCalledWith(expect.stringContaining('/lancamentos/vencendo'))
  })

  it('carregarContasVencendo expoe erro via mensagemErroApi em falha', async () => {
    const get = vi.fn(async (caminho: string) => {
      if (caminho.startsWith('/lancamentos/vencendo')) throw new Error('Function indisponivel')
      if (caminho.startsWith('/lancamentos/resumo')) return { receitas: 0, despesas: 0 }
      return envelope()
    })
    const { result } = montar(criarCliente({ get }))
    await waitFor(() => expect(result.current.carregando).toBe(false))

    await act(async () => result.current.carregarContasVencendo())

    expect(result.current.erroContasVencendo).toBe('Function indisponivel')
  })

  it('carregarUltimosLancamentos preenche ultimosLancamentos misturando tipo', async () => {
    const receita = {
      id: 'receita-2', tipo: 'receita', descricao: 'Salario', valor: 500000,
      dataEmissao: '2026-10-17', vencimento: null, paga: false,
      parcelamentoId: null, parcelaAtual: null, totalParcelas: null,
    }
    const despesa = {
      id: 'despesa-2', tipo: 'despesa', descricao: 'Internet', valor: 9000,
      dataEmissao: null, vencimento: '2026-10-20', paga: false,
      parcelamentoId: null, parcelaAtual: null, totalParcelas: null,
    }
    const get = vi.fn(async (caminho: string) => {
      if (caminho.startsWith('/lancamentos/recentes')) return { itens: [receita, despesa] }
      if (caminho.startsWith('/lancamentos/resumo')) return { receitas: 0, despesas: 0 }
      return envelope()
    })
    const { result } = montar(criarCliente({ get }))
    await waitFor(() => expect(result.current.carregando).toBe(false))

    await act(async () => result.current.carregarUltimosLancamentos())

    expect(result.current.ultimosLancamentos).toHaveLength(2)
    expect(result.current.ultimosLancamentos.map((item) => item.tipo)).toEqual(['receita', 'despesa'])
  })

  it('carregarUltimosLancamentos expoe erro via mensagemErroApi em falha', async () => {
    const get = vi.fn(async (caminho: string) => {
      if (caminho.startsWith('/lancamentos/recentes')) throw new Error('Function indisponivel')
      if (caminho.startsWith('/lancamentos/resumo')) return { receitas: 0, despesas: 0 }
      return envelope()
    })
    const { result } = montar(criarCliente({ get }))
    await waitFor(() => expect(result.current.carregando).toBe(false))

    await act(async () => result.current.carregarUltimosLancamentos())

    expect(result.current.erroUltimosLancamentos).toBe('Function indisponivel')
  })
})

describe('LancamentosProvider — editar e excluir (otimista com rollback)', () => {
  const despesaLuz = {
    id: 'despesa-1', tipo: 'despesa', descricao: 'Luz', valor: 10000,
    dataEmissao: null, vencimento: '2026-10-20', paga: false, pagoEm: null,
    parcelamentoId: null, parcelaAtual: null, totalParcelas: null,
  }

  it('editarReceita atualiza a lista na hora, confirma com o servidor e reverte em falha', async () => {
    const get = getPorTipo({ receita: [receitaSalario], resumo: { receitas: 1250.5, despesas: 0 } })
    const patchIdempotente = vi.fn().mockResolvedValue({})
    const { result } = montar(criarCliente({ get, patchIdempotente }))
    await waitFor(() => expect(result.current.carregando).toBe(false))

    await act(async () => {
      await result.current.editarReceita('receita-1', { descricao: 'Freelance editado', valor: '2.000,00', dataEmissao: '2026-10-12' })
    })

    expect(patchIdempotente).toHaveBeenCalledWith('/lancamentos/receita-1', {
      tipo: 'receita', descricao: 'Freelance editado', valor: 200000, dataEmissao: '2026-10-12',
    })
    expect(result.current.receitas[0]).toMatchObject({ descricao: 'Freelance editado', valor: 2000 })

    const falhando = criarCliente({
      get: getPorTipo({ receita: [receitaSalario] }),
      patchIdempotente: vi.fn().mockRejectedValue(new Error('Falha ao editar')),
    })
    const segunda = montar(falhando)
    await waitFor(() => expect(segunda.result.current.carregando).toBe(false))

    await expect(act(async () => {
      await segunda.result.current.editarReceita('receita-1', { descricao: 'Nao vai vingar', valor: '1,00', dataEmissao: '2026-10-12' })
    })).rejects.toThrow('Falha ao editar')
    expect(segunda.result.current.receitas[0]).toMatchObject({ descricao: 'Freelance' })
  })

  it('editarDespesa envia o alcance e atualiza as parcelas devolvidas pelo servidor', async () => {
    const get = getPorTipo({ despesa: [despesaLuz] })
    const patchIdempotente = vi.fn().mockResolvedValue([
      { ...despesaLuz, descricao: 'Luz e água', valor: 15000 },
    ])
    const { result } = montar(criarCliente({ get, patchIdempotente }))
    await waitFor(() => expect(result.current.carregando).toBe(false))

    await act(async () => {
      await result.current.editarDespesa('despesa-1', {
        descricao: 'Luz e água', valor: '150,00', vencimento: '2026-10-20',
        parcelado: false, quantidadeParcelas: undefined, alcance: 'futuras',
      })
    })

    expect(patchIdempotente).toHaveBeenCalledWith('/lancamentos/despesa-1', {
      tipo: 'despesa', descricao: 'Luz e água', valor: 15000, vencimento: '2026-10-20', alcance: 'futuras',
    })
    expect(result.current.despesas[0]).toMatchObject({ descricao: 'Luz e água', valor: 150 })
  })

  it('excluirLancamento remove a despesa na hora e reverte se a API falhar', async () => {
    const get = getPorTipo({ despesa: [despesaLuz] })
    const deleteIdempotente = vi.fn().mockRejectedValue(new Error('Falha ao excluir'))
    const { result } = montar(criarCliente({ get, deleteIdempotente }))
    await waitFor(() => expect(result.current.carregando).toBe(false))
    expect(result.current.despesas).toHaveLength(1)

    await expect(act(async () => {
      await result.current.excluirLancamento('despesa-1', 'despesa')
    })).rejects.toThrow('Falha ao excluir')

    expect(deleteIdempotente).toHaveBeenCalledWith('/lancamentos/despesa-1')
    expect(result.current.despesas).toHaveLength(1)
  })

  it('excluirLancamento com alcance futuras remove so os ids que o servidor confirmou', async () => {
    const despesaIrma = { ...despesaLuz, id: 'despesa-2', descricao: 'Luz', parcelamentoId: 'pc1', parcelaAtual: 2, totalParcelas: 2 }
    const get = getPorTipo({ despesa: [{ ...despesaLuz, parcelamentoId: 'pc1', parcelaAtual: 1, totalParcelas: 2 }, despesaIrma] })
    const deleteIdempotente = vi.fn().mockResolvedValue({ idsExcluidos: ['despesa-1', 'despesa-2'] })
    const { result } = montar(criarCliente({ get, deleteIdempotente }))
    await waitFor(() => expect(result.current.carregando).toBe(false))

    await act(async () => {
      await result.current.excluirLancamento('despesa-1', 'despesa', 'futuras')
    })

    expect(deleteIdempotente).toHaveBeenCalledWith('/lancamentos/despesa-1?alcance=futuras')
    expect(result.current.despesas).toHaveLength(0)
  })
})
