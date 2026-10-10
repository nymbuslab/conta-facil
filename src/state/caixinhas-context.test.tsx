import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ApiError, type ApiClient } from '@/lib/api-client'
import { criarClienteAuthTeste } from '@/test/test-utils'

import { AuthProvider } from './auth-context'
import { CaixinhasProvider, useCaixinhas } from './caixinhas-context'

function criarCliente(overrides: Partial<ApiClient> = {}) {
  return {
    get: vi.fn().mockResolvedValue([]),
    post: vi.fn(),
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
      get: vi.fn().mockResolvedValue([
        { id: 'caixinha-1', nome: 'Viagem', valorGuardado: 240000, meta: 600000 },
      ]),
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
      .mockResolvedValueOnce({ id: 'caixinha-1', nome: 'Viagem', valorGuardado: 240000, meta: 600000 })
    const { result } = montar(criarCliente({ post }))
    await waitFor(() => expect(result.current.carregando).toBe(false))

    await act(async () => result.current.criarCaixinha({ nome: 'Viagem', meta: '6.000,00' }))
    await act(async () => result.current.depositar('caixinha-1', { valor: '2.400,00' }))

    expect(post).toHaveBeenNthCalledWith(1, '/caixinhas', { nome: 'Viagem', meta: 600000 })
    expect(post).toHaveBeenNthCalledWith(2, '/caixinhas/caixinha-1/depositar', { valor: 240000 })
    expect(result.current.caixinhas[0].valorGuardado).toBe(2400)
  })

  it('saldo insuficiente devolve sucesso false sem alterar as caixinhas', async () => {
    const post = vi.fn().mockRejectedValue(new ApiError(400, 'Saldo insuficiente'))
    const cliente = criarCliente({
      get: vi.fn().mockResolvedValue([
        { id: 'reserva-1', nome: 'Reserva', valorGuardado: 10000, meta: 100000 },
      ]),
      post,
    })
    const { result } = montar(cliente)
    await waitFor(() => expect(result.current.carregando).toBe(false))

    let resposta: { sucesso: boolean; erro?: string } | undefined
    await act(async () => {
      resposta = await result.current.resgatar('reserva-1', { valor: '200,00' })
    })

    expect(resposta).toEqual({ sucesso: false, erro: 'Saldo insuficiente' })
    expect(result.current.caixinhas[0].valorGuardado).toBe(100)
  })

  it('expoe erro de rede e recarrega sem manter dados antigos', async () => {
    const get = vi.fn()
      .mockRejectedValueOnce(new Error('Function indisponivel'))
      .mockResolvedValueOnce([])
    const { result } = montar(criarCliente({ get }))

    await waitFor(() => expect(result.current.erro).toBe('Function indisponivel'))
    await act(async () => result.current.recarregar())

    expect(result.current.erro).toBeNull()
    expect(result.current.caixinhas).toEqual([])
  })
})
