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

  it.each([
    ['rede', new TypeError('Failed to fetch')],
    ['502', new Response('{}', { status: 502 })],
    ['503', new Response('{}', { status: 503 })],
    ['504', new Response('{}', { status: 504 })],
  ])('repete uma vez falha transitoria %s com a mesma chave', async (_nome, falha) => {
    const fetcher = vi.fn()
      .mockRejectedValueOnce(falha instanceof Error ? falha : undefined)
    if (falha instanceof Response) fetcher.mockReset().mockResolvedValueOnce(falha)
    fetcher.mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    }))
    const cliente = criarApiClient({
      baseUrl: 'https://api.example.test', obterToken: async () => 'jwt', fetcher,
      gerarChave: () => '11111111-1111-4111-8111-111111111111',
    })

    await expect(cliente.postIdempotente('/lancamentos', { valor: 100 })).resolves.toEqual({ ok: true })
    expect(fetcher).toHaveBeenCalledTimes(2)
    const requests = fetcher.mock.calls.map(([request]) => request as Request)
    const chaves = requests.map((request) => request.headers.get('Idempotency-Key'))
    expect(chaves).toEqual(['11111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111'])
    expect(requests.map((request) => request.method)).toEqual(['POST', 'POST'])
    await expect(Promise.all(requests.map((request) => request.clone().text())))
      .resolves.toEqual(['{"valor":100}', '{"valor":100}'])
  })

  it.each([400, 401, 409, 500])('nao repete status %s', async (status) => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ erro: 'falha' }), {
      status, headers: { 'Content-Type': 'application/json' },
    }))
    const cliente = criarApiClient({ baseUrl: 'https://api.example.test', obterToken: async () => 'jwt', fetcher })

    await expect(cliente.postIdempotente('/lancamentos', {})).rejects.toMatchObject({ status })
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it('para depois de duas falhas e cria UUID novo por operacao', async () => {
    const chaves = [
      '11111111-1111-4111-8111-111111111111',
      '22222222-2222-4222-8222-222222222222',
    ]
    const gerarChave = vi.fn(() => chaves.shift() ?? 'sem-chave')
    const fetcher = vi.fn().mockResolvedValue(new Response('{}', { status: 503 }))
    const cliente = criarApiClient({ baseUrl: 'https://api.example.test', obterToken: async () => 'jwt', fetcher, gerarChave })

    await expect(cliente.postIdempotente('/lancamentos', {})).rejects.toMatchObject({ status: 503 })
    expect(fetcher).toHaveBeenCalledTimes(2)
    fetcher.mockClear().mockResolvedValue(new Response(JSON.stringify({ ok: true }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    }))
    await cliente.postIdempotente('/lancamentos', {})

    expect(gerarChave).toHaveBeenCalledTimes(2)
    expect((fetcher.mock.calls[0][0] as Request).headers.get('Idempotency-Key'))
      .toBe('22222222-2222-4222-8222-222222222222')
  })

  it('gera por padrao UUID v4 valido e distinto para cada operacao', async () => {
    const fetcher = vi.fn().mockImplementation(async () => new Response(JSON.stringify({ ok: true }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    }))
    const cliente = criarApiClient({ baseUrl: 'https://api.example.test', obterToken: async () => 'jwt', fetcher })

    await cliente.postIdempotente('/lancamentos', {})
    await cliente.postIdempotente('/lancamentos', {})

    const chaves = fetcher.mock.calls.map(([request]) => (request as Request).headers.get('Idempotency-Key'))
    expect(chaves[0]).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
    expect(chaves[1]).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
    expect(chaves[1]).not.toBe(chaves[0])
  })
})
