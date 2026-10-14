import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ApiError, type ApiClient } from '@/lib/api-client'
import { criarClienteAuthTeste } from '@/test/test-utils'

import { AuthProvider } from './auth-context'
import { CaixinhasProvider, useCaixinhas } from './caixinhas-context'

function envelope(itens: unknown[] = [], totalGuardado = 0) {
  return { itens, proximoCursor: null, totalGuardado }
}

function criarCliente(overrides: Record<string, unknown> = {}) {
  return {
    get: vi.fn().mockResolvedValue(envelope()),
    post: vi.fn(),
    postIdempotente: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    ...overrides,
  } as unknown as ApiClient
}

function montar(cliente: ApiClient) {
  return renderHook(() => useCaixinhas(), {
    wrapper: ({ children }) => (
      <AuthProvider cliente={criarClienteAuthTeste()}>
        <CaixinhasProvider cliente={cliente}>{children}</CaixinhasProvider>
      </AuthProvider>
    ),
  })
}

describe('CaixinhasProvider', () => {
  it('carrega caixinhas da Function e converte centavos para reais', async () => {
    const cliente = criarCliente({
      get: vi.fn().mockResolvedValue(envelope([
        { id: 'caixinha-1', nome: 'Viagem', valorGuardado: 240000, meta: 600000 },
      ], 240000)),
    })

    const { result } = montar(cliente)

    expect(result.current.carregando).toBe(true)
    await waitFor(() => expect(result.current.carregando).toBe(false))
    expect(result.current.caixinhas[0]).toMatchObject({
      nome: 'Viagem', valorGuardado: 2400, meta: 6000,
    })
    expect(result.current.totalGuardado).toBe(2400)
  })

  it('cria e deposita usando a resposta persistida da Function', async () => {
    const post = vi.fn()
      .mockResolvedValueOnce({ id: 'caixinha-1', nome: 'Viagem', valorGuardado: 0, meta: 600000 })
    const postIdempotente = vi.fn()
      .mockResolvedValueOnce({ id: 'caixinha-1', nome: 'Viagem', valorGuardado: 240000, meta: 600000 })
    const { result } = montar(criarCliente({ post, postIdempotente }))
    await waitFor(() => expect(result.current.carregando).toBe(false))

    await act(async () => result.current.criarCaixinha({ nome: 'Viagem', meta: '6.000,00' }))
    await act(async () => result.current.depositar('caixinha-1', { valor: '2.400,00' }))

    expect(post).toHaveBeenCalledWith('/caixinhas', { nome: 'Viagem', meta: 600000 })
    expect(postIdempotente).toHaveBeenCalledWith('/caixinhas/caixinha-1/depositar', { valor: 240000 })
    expect(result.current.caixinhas[0].valorGuardado).toBe(2400)
    // O total guardado acompanha o deposito sem precisar recarregar a pagina inteira.
    expect(result.current.totalGuardado).toBe(2400)
  })

  it('saldo insuficiente devolve sucesso false sem alterar as caixinhas', async () => {
    const postIdempotente = vi.fn().mockRejectedValue(new ApiError(400, 'Saldo insuficiente'))
    const cliente = criarCliente({
      get: vi.fn().mockResolvedValue(envelope([
        { id: 'reserva-1', nome: 'Reserva', valorGuardado: 10000, meta: 100000 },
      ], 10000)),
      postIdempotente,
    })
    const { result } = montar(cliente)
    await waitFor(() => expect(result.current.carregando).toBe(false))

    let resposta: { sucesso: boolean; erro?: string } | undefined
    await act(async () => {
      resposta = await result.current.resgatar('reserva-1', { valor: '200,00' })
    })

    expect(resposta).toEqual({ sucesso: false, erro: 'Saldo insuficiente' })
    expect(postIdempotente).toHaveBeenCalledWith('/caixinhas/reserva-1/resgatar', { valor: 20000 })
    expect(result.current.caixinhas[0].valorGuardado).toBe(100)
    expect(result.current.totalGuardado).toBe(100)
  })

  it('expoe erro de rede e recarrega ate o estado vazio', async () => {
    const get = vi.fn()
      .mockRejectedValueOnce(new Error('Function indisponivel'))
      .mockResolvedValueOnce(envelope())
    const { result } = montar(criarCliente({ get }))

    await waitFor(() => expect(result.current.erro).toBe('Function indisponivel'))
    await act(async () => result.current.recarregar())

    expect(result.current.erro).toBeNull()
    expect(result.current.caixinhas).toEqual([])
  })
})
