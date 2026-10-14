import { Hono } from 'hono'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  colunasCaixinhaListada,
  criarRotasCaixinhas,
  paraCaixinhaListada,
  type RepositorioCaixinhas,
} from './caixinhas'
import { criarExecutorIdempotencia, type RegistroIdempotencia, type TransacaoIdempotencia } from './idempotencia'

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
    listar: vi.fn().mockResolvedValue({ itens: [], proximoCursor: null }),
    totalGuardado: vi.fn().mockResolvedValue(1000),
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

function criarExecutorMemoria() {
  const registros = new Map<string, RegistroIdempotencia>()
  return criarExecutorIdempotencia({
    async transacionar(callback) {
      const transacao: TransacaoIdempotencia = {
        banco: null,
        bloquear: async () => undefined,
        buscar: async (userId, chave) => registros.get(`${userId}:${chave}`) ?? null,
        salvar: async (registro) => { registros.set(`${registro.userId}:${registro.chave}`, registro) },
      }
      return callback(transacao)
    },
  }, vi.fn())
}

function criarApp(repositorio: RepositorioCaixinhas, userId = 'usuario-1', executar = criarExecutorMemoria()) {
  const app = new Hono<{ Variables: { userId: string } }>()
  app.use('*', async (contexto, next) => {
    contexto.set('userId', userId)
    await next()
  })
  app.route('/caixinhas', criarRotasCaixinhas(repositorio, executar))
  return app
}

describe('rotas de caixinhas', () => {
  let repositorio: RepositorioCaixinhas

  beforeEach(() => {
    repositorio = criarRepositorio()
  })

  it('lista a página com o total guardado do usuário', async () => {
    const resposta = await criarApp(repositorio).request('/caixinhas?limite=10')

    expect(resposta.status).toBe(200)
    expect(await resposta.json()).toEqual({
      itens: [],
      proximoCursor: null,
      totalGuardado: 1000,
    })
    expect(repositorio.listar).toHaveBeenCalledWith(
      'usuario-1',
      expect.objectContaining({ limite: 10 }),
    )
    expect(repositorio.totalGuardado).toHaveBeenCalledWith('usuario-1')
  })

  it('recusa cursor inválido na listagem', async () => {
    const resposta = await criarApp(repositorio).request('/caixinhas?cursor=nao-e-base64')

    expect(resposta.status).toBe(400)
    expect(repositorio.listar).not.toHaveBeenCalled()
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

  it('repete deposito e resgate sem duplicar efeito', async () => {
    const app = criarApp(repositorio)
    const depositar = { method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': '11111111-1111-4111-8111-111111111111' }, body: JSON.stringify({ valor: 500 }) }
    const primeiroDeposito = await app.request(`/caixinhas/${CAIXINHA_ID}/depositar`, depositar)
    const replayDeposito = await app.request(`/caixinhas/${CAIXINHA_ID}/depositar`, depositar)
    expect(primeiroDeposito.status).toBe(200)
    expect(replayDeposito.status).toBe(200)
    expect(await replayDeposito.json()).toEqual(await primeiroDeposito.json())
    expect(repositorio.depositar).toHaveBeenCalledTimes(1)

    const resgatar = { method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': '22222222-2222-4222-8222-222222222222' }, body: JSON.stringify({ valor: 200 }) }
    const primeiroResgate = await app.request(`/caixinhas/${CAIXINHA_ID}/resgatar`, resgatar)
    const replayResgate = await app.request(`/caixinhas/${CAIXINHA_ID}/resgatar`, resgatar)
    expect(primeiroResgate.status).toBe(200)
    expect(replayResgate.status).toBe(200)
    expect(await replayResgate.json()).toEqual(await primeiroResgate.json())
    expect(repositorio.resgatar).toHaveBeenCalledTimes(1)
  })

  it('retorna 409 para payload ou operacao diferente com a mesma chave', async () => {
    const executar = criarExecutorMemoria()
    const app = criarApp(repositorio, 'usuario-1', executar)
    const chave = '33333333-3333-4333-8333-333333333333'
    const enviar = (acao: 'depositar' | 'resgatar', valor: number) => app.request(`/caixinhas/${CAIXINHA_ID}/${acao}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': chave }, body: JSON.stringify({ valor }),
    })
    expect((await enviar('depositar', 500)).status).toBe(200)
    expect((await enviar('depositar', 501)).status).toBe(409)
    expect((await enviar('resgatar', 500)).status).toBe(409)
  })

  it('saldo insuficiente nao reserva a chave e usuarios distintos podem reutiliza-la', async () => {
    const executar = criarExecutorMemoria()
    const chave = '44444444-4444-4444-8444-444444444444'
    const init = { method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': chave }, body: JSON.stringify({ valor: 1500 }) }
    expect((await criarApp(repositorio, 'usuario-1', executar).request(`/caixinhas/${CAIXINHA_ID}/resgatar`, init)).status).toBe(400)
    expect((await criarApp(repositorio, 'usuario-1', executar).request(`/caixinhas/${CAIXINHA_ID}/depositar`, { ...init, body: JSON.stringify({ valor: 1 }) })).status).toBe(200)
    expect((await criarApp(repositorio).request(`/caixinhas/${CAIXINHA_ID}/depositar`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ valor: 1 }) })).status).toBe(200)
  })
})

describe('projeção da listagem de caixinhas', () => {
  it('seleciona só as colunas da tela mais criadoEm para o cursor', () => {
    expect(Object.keys(colunasCaixinhaListada).sort()).toEqual([
      'criadoEm',
      'id',
      'meta',
      'nome',
      'valorGuardado',
    ])
  })

  it('nunca expõe userId nem os timestamps internos no item da listagem', () => {
    const item = paraCaixinhaListada({
      id: CAIXINHA_ID,
      nome: 'Reserva',
      valorGuardado: 1000,
      meta: 5000,
      criadoEm: new Date('2026-10-10T00:00:00.000Z'),
    })

    expect(item).not.toHaveProperty('userId')
    expect(item).not.toHaveProperty('criadoEm')
    expect(item).not.toHaveProperty('atualizadoEm')
    expect(Object.keys(item).sort()).toEqual(['id', 'meta', 'nome', 'valorGuardado'])
  })

  it('devolve a página inteira em uma listagem por requisição', async () => {
    const repositorio = criarRepositorio()
    const itens = Array.from({ length: 8 }, (_, indice) => ({
      id: `id-${indice}`,
      nome: `Caixinha ${indice}`,
      valorGuardado: indice * 100,
      meta: 5000,
    }))
    vi.mocked(repositorio.listar).mockResolvedValue({ itens, proximoCursor: null })

    const resposta = await criarApp(repositorio).request('/caixinhas')

    expect((await resposta.json()).itens).toEqual(itens)
    expect(repositorio.listar).toHaveBeenCalledTimes(1)
  })
})
