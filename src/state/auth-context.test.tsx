import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { AuthProvider, type ClienteAuth, useAuth } from './auth-context'

function criarClienteAuth() {
  const entrar = vi.fn().mockResolvedValue({ data: {}, error: null })
  const cadastrar = vi.fn().mockResolvedValue({ data: {}, error: null })
  const sair = vi.fn().mockResolvedValue({ data: {}, error: null })
  const obterToken = vi.fn().mockResolvedValue('token-de-teste')

  const cliente: ClienteAuth = {
    useSession: () => ({
      data: null,
      error: null,
      isPending: true,
    }),
    signIn: { email: entrar },
    signUp: { email: cadastrar },
    signOut: sair,
    token: obterToken,
    requestPasswordReset: vi.fn().mockResolvedValue({ data: {}, error: null }),
    resetPassword: vi.fn().mockResolvedValue({ data: {}, error: null }),
  }

  return { cliente, entrar, cadastrar, sair, obterToken }
}

describe('AuthProvider', () => {
  it('comeca carregando enquanto a sessao ainda nao resolveu', () => {
    const { cliente } = criarClienteAuth()
    const wrapper = ({ children }: { children: ReactNode }) => (
      <AuthProvider cliente={cliente}>{children}</AuthProvider>
    )

    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.status).toBe('carregando')
    expect(result.current.usuario).toBeNull()
  })

  it('expoe usuario autenticado e as operacoes de auth', async () => {
    const { cliente, entrar, cadastrar, sair, obterToken } = criarClienteAuth()
    cliente.useSession = () => ({
      data: {
        user: { id: 'usuario-1', name: 'Ana', email: 'ana@exemplo.com' },
        session: { id: 'sessao-1' },
      },
      error: null,
      isPending: false,
    })
    const wrapper = ({ children }: { children: ReactNode }) => (
      <AuthProvider cliente={cliente}>{children}</AuthProvider>
    )

    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.status).toBe('autenticado')
    expect(result.current.usuario).toEqual({
      id: 'usuario-1',
      nome: 'Ana',
      email: 'ana@exemplo.com',
    })

    await act(async () => {
      await result.current.entrar('ana@exemplo.com', 'segredo123')
      await result.current.cadastrar('Ana', 'ana@exemplo.com', 'segredo123')
      await result.current.sair()
      await result.current.obterToken()
    })

    expect(entrar).toHaveBeenCalledWith({
      email: 'ana@exemplo.com',
      password: 'segredo123',
    })
    expect(cadastrar).toHaveBeenCalledWith({
      name: 'Ana',
      email: 'ana@exemplo.com',
      password: 'segredo123',
    })
    expect(sair).toHaveBeenCalledOnce()
    expect(obterToken).toHaveBeenCalledOnce()
  })

  it('extrai o token do formato { data: { token } }', async () => {
    const { cliente } = criarClienteAuth()
    cliente.token = vi.fn().mockResolvedValue({ data: { token: 'token-direto' }, error: null })
    cliente.useSession = () => ({
      data: { user: { id: 'usuario-1', name: 'Ana', email: 'ana@exemplo.com' }, session: {} },
      error: null,
      isPending: false,
    })
    const wrapper = ({ children }: { children: ReactNode }) => (
      <AuthProvider cliente={cliente}>{children}</AuthProvider>
    )
    const { result } = renderHook(() => useAuth(), { wrapper })

    await expect(result.current.obterToken()).resolves.toBe('token-direto')
  })

  it('extrai o token do formato { data: { session: { token } } } (shape real do adapter)', async () => {
    const { cliente } = criarClienteAuth()
    cliente.token = vi.fn().mockResolvedValue({
      data: { session: { token: 'token-da-sessao' }, user: {} },
      error: null,
    })
    cliente.useSession = () => ({
      data: { user: { id: 'usuario-1', name: 'Ana', email: 'ana@exemplo.com' }, session: {} },
      error: null,
      isPending: false,
    })
    const wrapper = ({ children }: { children: ReactNode }) => (
      <AuthProvider cliente={cliente}>{children}</AuthProvider>
    )
    const { result } = renderHook(() => useAuth(), { wrapper })

    await expect(result.current.obterToken()).resolves.toBe('token-da-sessao')
  })

  it('devolve null quando o token vem ausente ou em formato desconhecido', async () => {
    const { cliente } = criarClienteAuth()
    cliente.useSession = () => ({
      data: { user: { id: 'usuario-1', name: 'Ana', email: 'ana@exemplo.com' }, session: {} },
      error: null,
      isPending: false,
    })
    const wrapper = ({ children }: { children: ReactNode }) => (
      <AuthProvider cliente={cliente}>{children}</AuthProvider>
    )
    const { result } = renderHook(() => useAuth(), { wrapper })

    cliente.token = vi.fn().mockResolvedValue(null)
    await expect(result.current.obterToken()).resolves.toBeNull()

    cliente.token = vi.fn().mockResolvedValue({ data: null, error: null })
    await expect(result.current.obterToken()).resolves.toBeNull()

    cliente.token = vi.fn().mockResolvedValue({ data: { session: {} }, error: null })
    await expect(result.current.obterToken()).resolves.toBeNull()

    cliente.token = vi.fn().mockResolvedValue({ data: { session: { token: 123 } }, error: null })
    await expect(result.current.obterToken()).resolves.toBeNull()
  })

  it('expoe status erro (nao anonimo) quando a verificacao de sessao falha', () => {
    const { cliente } = criarClienteAuth()
    cliente.useSession = () => ({
      data: null,
      error: { message: 'jwks fora do ar' },
      isPending: false,
    })
    const wrapper = ({ children }: { children: ReactNode }) => (
      <AuthProvider cliente={cliente}>{children}</AuthProvider>
    )

    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.status).toBe('erro')
    expect(result.current.usuario).toBeNull()
  })

  it('mantem autenticado quando ha usuario mesmo com erro de sessao', () => {
    const { cliente } = criarClienteAuth()
    cliente.useSession = () => ({
      data: {
        user: { id: 'usuario-1', name: 'Ana', email: 'ana@exemplo.com' },
        session: {},
      },
      error: { message: 'refresh falhou' },
      isPending: false,
    })
    const wrapper = ({ children }: { children: ReactNode }) => (
      <AuthProvider cliente={cliente}>{children}</AuthProvider>
    )

    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.status).toBe('autenticado')
  })

  it('recarregarSessao chama o refetch da sessao', async () => {
    const { cliente } = criarClienteAuth()
    const refetch = vi.fn().mockResolvedValue(undefined)
    cliente.useSession = () => ({
      data: null,
      error: { message: 'falha de rede' },
      isPending: false,
      refetch,
    })
    const wrapper = ({ children }: { children: ReactNode }) => (
      <AuthProvider cliente={cliente}>{children}</AuthProvider>
    )
    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.recarregarSessao()
    })

    expect(refetch).toHaveBeenCalledOnce()
  })

  it('lanca erro quando useAuth e usado fora do provider', () => {
    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth deve ser usado dentro de AuthProvider',
    )
  })
})
