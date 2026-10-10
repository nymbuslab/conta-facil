import { Hono } from 'hono'
import { describe, expect, it, vi } from 'vitest'

import { criarAuthMiddleware, type VariaveisAuth } from './auth-middleware'

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
})
