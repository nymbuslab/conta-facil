import { Hono } from 'hono'
import { describe, expect, it, vi } from 'vitest'

import { ConfiguracaoAuthAusente, criarAuthMiddleware, type VariaveisAuth } from './auth-middleware'

function criarApp(verificarToken?: (token: string) => Promise<{ sub?: string }>) {
  const app = new Hono<{ Variables: VariaveisAuth }>()
  app.use('/dados/*', criarAuthMiddleware({ verificarToken }))
  app.get('/dados/usuario', (contexto) =>
    contexto.json({ userId: contexto.get('userId') }),
  )
  return app
}

describe('authMiddleware', () => {
  it('responde 401 sem Authorization e nao executa a rota protegida', async () => {
    const verificarToken = vi.fn()
    const resposta = await criarApp(verificarToken).request('/dados/usuario')

    expect(resposta.status).toBe(401)
    expect(await resposta.json()).toEqual({ erro: 'Não autorizado' })
    expect(verificarToken).not.toHaveBeenCalled()
  })

  it('grava o sub do JWT como userId antes de executar a rota', async () => {
    const verificarToken = vi.fn().mockResolvedValue({ sub: 'usuario-123' })
    const resposta = await criarApp(verificarToken).request('/dados/usuario', {
      headers: { Authorization: 'Bearer jwt-valido' },
    })

    expect(resposta.status).toBe(200)
    expect(await resposta.json()).toEqual({ userId: 'usuario-123' })
    expect(verificarToken).toHaveBeenCalledWith('jwt-valido')
  })

  it('responde 401 para token invalido ou sem sub', async () => {
    const app = criarApp(async () => ({}))
    const resposta = await app.request('/dados/usuario', {
      headers: { Authorization: 'Bearer jwt-sem-sub' },
    })

    expect(resposta.status).toBe(401)
  })

  it('responde 401 quando o token e invalido/expirado (codigo do jose)', async () => {
    const app = criarApp(async () => {
      throw Object.assign(new Error('jwt expired'), { code: 'ERR_JWT_EXPIRED' })
    })
    const resposta = await app.request('/dados/usuario', {
      headers: { Authorization: 'Bearer jwt-expirado' },
    })

    expect(resposta.status).toBe(401)
    expect(await resposta.json()).toEqual({ erro: 'Não autorizado' })
  })

  it('responde 503 quando o JWKS/servico de autenticacao esta indisponivel', async () => {
    const app = criarApp(async () => {
      throw Object.assign(new Error('jwks timeout'), { code: 'ERR_JWKS_TIMEOUT' })
    })
    const resposta = await app.request('/dados/usuario', {
      headers: { Authorization: 'Bearer jwt-qualquer' },
    })

    expect(resposta.status).toBe(503)
  })

  it('responde 503 em falha de rede (erro sem codigo do jose)', async () => {
    const app = criarApp(async () => {
      throw new TypeError('fetch failed')
    })
    const resposta = await app.request('/dados/usuario', {
      headers: { Authorization: 'Bearer jwt-qualquer' },
    })

    expect(resposta.status).toBe(503)
  })

  it('responde 500 quando a configuracao do Neon Auth esta ausente', async () => {
    const app = criarApp(async () => {
      throw new ConfiguracaoAuthAusente('Variaveis do Neon Auth nao configuradas')
    })
    const resposta = await app.request('/dados/usuario', {
      headers: { Authorization: 'Bearer jwt-qualquer' },
    })

    expect(resposta.status).toBe(500)
  })
})
