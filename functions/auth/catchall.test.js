import { afterEach, describe, expect, it, vi } from 'vitest'

import { onRequest } from './[[catchall]].js'

function criarContexto({ url, env = {}, catchall = [] }) {
  return {
    request: new Request(url),
    env,
    params: { catchall },
  }
}

describe('proxy reverso /auth/*', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('responde 502 sem tentar fetch quando NEON_AUTH_UPSTREAM_URL esta ausente', async () => {
    const fetchEspiao = vi.spyOn(globalThis, 'fetch')
    const contexto = criarContexto({ url: 'https://app.exemplo/auth/get-session' })

    const resposta = await onRequest(contexto)

    expect(resposta.status).toBe(502)
    expect(fetchEspiao).not.toHaveBeenCalled()
  })

  it('encaminha para o host upstream preservando caminho, querystring e Set-Cookie', async () => {
    const respostaUpstream = new Response('{"ok":true}', {
      status: 200,
      headers: { 'Set-Cookie': 'better-auth.session=abc; Path=/; HttpOnly' },
    })
    const fetchEspiao = vi.spyOn(globalThis, 'fetch').mockResolvedValue(respostaUpstream)

    const contexto = criarContexto({
      url: 'https://app.exemplo/auth/get-session?foo=bar',
      env: { NEON_AUTH_UPSTREAM_URL: 'https://auth.upstream.exemplo' },
      catchall: ['get-session'],
    })

    const resposta = await onRequest(contexto)

    expect(fetchEspiao).toHaveBeenCalledOnce()
    const [urlChamada] = fetchEspiao.mock.calls[0]
    expect(urlChamada).toBe('https://auth.upstream.exemplo/get-session?foo=bar')
    expect(resposta.status).toBe(200)
    expect(resposta.headers.get('Set-Cookie')).toBe('better-auth.session=abc; Path=/; HttpOnly')
  })

  it('nunca busca outro host mesmo com segmento tentando reconstruir uma URL absoluta', async () => {
    const respostaUpstream = new Response('nao encontrado', { status: 404 })
    const fetchEspiao = vi.spyOn(globalThis, 'fetch').mockResolvedValue(respostaUpstream)

    const contexto = criarContexto({
      url: 'https://app.exemplo/auth/https://evil.exemplo/roubar-cookie',
      env: { NEON_AUTH_UPSTREAM_URL: 'https://auth.upstream.exemplo' },
      catchall: ['https:', '', 'evil.exemplo', 'roubar-cookie'],
    })

    await onRequest(contexto)

    expect(fetchEspiao).toHaveBeenCalledOnce()
    const [urlChamada] = fetchEspiao.mock.calls[0]
    expect(new URL(urlChamada).origin).toBe('https://auth.upstream.exemplo')
  })

  it('responde 400 quando o path resultante escapa do prefixo do upstream', async () => {
    const fetchEspiao = vi.spyOn(globalThis, 'fetch')

    const contexto = criarContexto({
      url: 'https://app.exemplo/auth/..%2f..%2fadmin',
      env: { NEON_AUTH_UPSTREAM_URL: 'https://auth.upstream.exemplo/auth-interno' },
      catchall: ['..', '..', 'admin'],
    })

    const resposta = await onRequest(contexto)

    expect(resposta.status).toBe(400)
    expect(fetchEspiao).not.toHaveBeenCalled()
  })

  it('responde 502 quando o fetch ao upstream falha', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('network error'))

    const contexto = criarContexto({
      url: 'https://app.exemplo/auth/sign-in/email',
      env: { NEON_AUTH_UPSTREAM_URL: 'https://auth.upstream.exemplo' },
      catchall: ['sign-in', 'email'],
    })

    const resposta = await onRequest(contexto)

    expect(resposta.status).toBe(502)
  })
})
