import { Hono } from 'hono'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { criarRotasCaixinhas, type RepositorioCaixinhas } from './caixinhas'

const CAIXINHA_ID = '22222222-2222-2222-2222-222222222222'

function criarRepositorio(): RepositorioCaixinhas {
  let valorGuardado = 1000
  const caixinha = () => ({
    id: CAIXINHA_ID,
    userId: 'usuario-1',
    nome: 'Reserva',
    valorGuardado,
    meta: 5000,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
  })
  return {
    listar: vi.fn().mockResolvedValue([]),
    criar: vi.fn(async () => caixinha()),
    depositar: vi.fn(async (_userId, _id, valor) => {
      valorGuardado += valor
      return caixinha()
    }),
    resgatar: vi.fn(async (_userId, id, valor) => {
      if (id !== CAIXINHA_ID) return { tipo: 'nao_encontrada' as const }
      if (valor > valorGuardado) return { tipo: 'saldo_insuficiente' as const }
      valorGuardado -= valor
      return { tipo: 'ok' as const, caixinha: caixinha() }
    }),
    excluir: vi.fn().mockResolvedValue(true),
  }
}

function criarApp(repositorio: RepositorioCaixinhas) {
  const app = new Hono<{ Variables: { userId: string } }>()
  app.use('*', async (contexto, next) => {
    contexto.set('userId', 'usuario-1')
    await next()
  })
  app.route('/caixinhas', criarRotasCaixinhas(repositorio))
  return app
}

describe('rotas de caixinhas', () => {
  let repositorio: RepositorioCaixinhas

  beforeEach(() => {
    repositorio = criarRepositorio()
  })

  it('deposita o valor em centavos na caixinha do usuario autenticado', async () => {
    const resposta = await criarApp(repositorio).request(`/caixinhas/${CAIXINHA_ID}/depositar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ valor: 500 }),
    })

    expect(resposta.status).toBe(200)
    expect(await resposta.json()).toMatchObject({ valorGuardado: 1500 })
    expect(repositorio.depositar).toHaveBeenCalledWith('usuario-1', CAIXINHA_ID, 500)
  })

  it('recusa resgate maior que o saldo sem alterar a caixinha', async () => {
    const resposta = await criarApp(repositorio).request(`/caixinhas/${CAIXINHA_ID}/resgatar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ valor: 1500 }),
    })

    expect(resposta.status).toBe(400)
    expect(await resposta.json()).toEqual({ erro: 'Saldo insuficiente' })

    const deposito = await criarApp(repositorio).request(`/caixinhas/${CAIXINHA_ID}/depositar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ valor: 1 }),
    })
    expect(await deposito.json()).toMatchObject({ valorGuardado: 1001 })
  })

  it('resgate em caixinha de outro usuario ou inexistente retorna 404, nao 400', async () => {
    const outroId = '33333333-3333-3333-3333-333333333333'
    const resposta = await criarApp(repositorio).request(`/caixinhas/${outroId}/resgatar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ valor: 1 }),
    })

    expect(resposta.status).toBe(404)
    expect(await resposta.json()).toEqual({ erro: 'Caixinha não encontrada' })
  })

  it('exclui usando id e userId para impedir acesso cruzado', async () => {
    const resposta = await criarApp(repositorio).request(`/caixinhas/${CAIXINHA_ID}`, {
      method: 'DELETE',
    })

    expect(resposta.status).toBe(204)
    expect(repositorio.excluir).toHaveBeenCalledWith('usuario-1', CAIXINHA_ID)
  })

  it('recusa id que nao e uuid sem consultar o repositorio', async () => {
    const resposta = await criarApp(repositorio).request('/caixinhas/nao-e-uuid/depositar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ valor: 500 }),
    })

    expect(resposta.status).toBe(404)
    expect(repositorio.depositar).not.toHaveBeenCalled()
  })
})
