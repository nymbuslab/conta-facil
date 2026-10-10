import { describe, expect, it, vi } from 'vitest'

import { ApiError, criarApiClient } from './api-client'

describe('apiClient', () => {
  it('inclui o Bearer token atual em toda chamada', async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    const cliente = criarApiClient({
      baseUrl: 'https://api.example.test',
      obterToken: async () => 'jwt-atual',
      fetcher,
    })

    await cliente.get('/lancamentos')

    const requisicao = fetcher.mock.calls[0][0] as Request
    expect(requisicao.headers.get('Authorization')).toBe('Bearer jwt-atual')
    expect(requisicao.url).toBe('https://api.example.test/lancamentos')
  })

  it('lanca ApiError com status e mensagem em resposta nao-2xx', async () => {
    const cliente = criarApiClient({
      baseUrl: 'https://api.example.test',
      obterToken: async () => 'jwt-atual',
      fetcher: async () =>
        new Response(JSON.stringify({ erro: 'Saldo insuficiente' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }),
    })

    await expect(cliente.post('/caixinhas/id/resgatar', { valor: 100 })).rejects.toEqual(
      expect.objectContaining<ApiError>({
        name: 'ApiError',
        status: 400,
        message: 'Saldo insuficiente',
      }),
    )
  })

  it('falha antes da rede quando a sessao nao fornece token', async () => {
    const fetcher = vi.fn()
    const cliente = criarApiClient({
      baseUrl: 'https://api.example.test',
      obterToken: async () => null,
      fetcher,
    })

    await expect(cliente.get('/lancamentos')).rejects.toMatchObject({ status: 401 })
    expect(fetcher).not.toHaveBeenCalled()
  })
})
