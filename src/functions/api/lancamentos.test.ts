import { Hono } from 'hono'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { LancamentoBanco, NovoLancamentoBanco } from '@/db/schema'

import { criarExecutorIdempotencia, type RegistroIdempotencia, type TransacaoIdempotencia } from './idempotencia'
import { criarRotasLancamentos, type RepositorioLancamentos } from './lancamentos'

function criarRepositorio(): RepositorioLancamentos {
  return {
    listar: vi.fn().mockResolvedValue([]),
    criarMuitos: vi.fn(async (dados: NovoLancamentoBanco[]): Promise<LancamentoBanco[]> =>
      dados.map((item, indice) => ({
        ...item,
        id: `id-${indice + 1}`,
        dataEmissao: item.dataEmissao ?? null,
        vencimento: item.vencimento ?? null,
        paga: item.paga ?? false,
        parcelamentoId: item.parcelamentoId ?? null,
        parcelaAtual: item.parcelaAtual ?? null,
        totalParcelas: item.totalParcelas ?? null,
        criadoEm: item.criadoEm ?? new Date(),
        atualizadoEm: item.atualizadoEm ?? new Date(),
      })),
    ),
    marcarComoPaga: vi.fn().mockResolvedValue({ id: '11111111-1111-1111-1111-111111111111', paga: true }),
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

function criarApp(repositorio: RepositorioLancamentos, userId = 'usuario-1', executar = criarExecutorMemoria()) {
  const app = new Hono<{ Variables: { userId: string } }>()
  app.use('*', async (contexto, next) => {
    contexto.set('userId', userId)
    await next()
  })
  app.route('/lancamentos', criarRotasLancamentos(repositorio, executar))
  return app
}

describe('rotas de lancamentos', () => {
  let repositorio: RepositorioLancamentos

  beforeEach(() => {
    repositorio = criarRepositorio()
  })

  it('lista somente com o userId autenticado', async () => {
    const resposta = await criarApp(repositorio).request('/lancamentos')

    expect(resposta.status).toBe(200)
    expect(repositorio.listar).toHaveBeenCalledWith('usuario-1')
  })

  it('multiplica o valor da parcela em N linhas com o mesmo parcelamentoId', async () => {
    const resposta = await criarApp(repositorio).request('/lancamentos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo: 'despesa',
        descricao: 'Notebook',
        valor: 3334,
        vencimento: '2026-10-15',
        parcelado: true,
        quantidadeParcelas: 3,
      }),
    })

    expect(resposta.status).toBe(201)
    const [parcelas] = vi.mocked(repositorio.criarMuitos).mock.calls[0]
    expect(parcelas).toHaveLength(3)
    expect(new Set(parcelas.map((parcela) => parcela.parcelamentoId)).size).toBe(1)
    expect(parcelas.map((parcela) => parcela.valor)).toEqual([3334, 3334, 3334])
    expect(parcelas.map((parcela) => parcela.vencimento)).toEqual([
      '2026-10-15',
      '2026-11-15',
      '2026-12-15',
    ])
    expect(parcelas.every((parcela) => parcela.userId === 'usuario-1')).toBe(true)
  })

  it('marca como paga usando id e userId para impedir acesso cruzado', async () => {
    const resposta = await criarApp(repositorio).request(
      '/lancamentos/11111111-1111-1111-1111-111111111111/pagar',
      { method: 'PATCH' },
    )

    expect(resposta.status).toBe(200)
    expect(repositorio.marcarComoPaga).toHaveBeenCalledWith(
      'usuario-1',
      '11111111-1111-1111-1111-111111111111',
    )
  })

  it('recusa id que nao e uuid sem consultar o repositorio', async () => {
    const resposta = await criarApp(repositorio).request('/lancamentos/nao-e-uuid/pagar', {
      method: 'PATCH',
    })

    expect(resposta.status).toBe(404)
    expect(repositorio.marcarComoPaga).not.toHaveBeenCalled()
  })

  it('repete lote parcelado e resposta sem criar novamente', async () => {
    const app = criarApp(repositorio)
    const corpo = {
      tipo: 'despesa', descricao: 'Notebook', valor: 50000, vencimento: '2026-10-11',
      parcelado: true, quantidadeParcelas: 3,
    }
    const init = {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': '11111111-1111-4111-8111-111111111111' },
      body: JSON.stringify(corpo),
    }

    const primeira = await app.request('/lancamentos', init)
    const segunda = await app.request('/lancamentos', init)

    expect(primeira.status).toBe(201)
    expect(segunda.status).toBe(201)
    const corpoPrimeira = await primeira.json() as LancamentoBanco[]
    const corpoSegunda = await segunda.json() as LancamentoBanco[]
    expect(corpoSegunda).toEqual(corpoPrimeira)
    expect(corpoPrimeira).toHaveLength(3)
    expect(new Set(corpoPrimeira.map((item) => item.parcelamentoId)).size).toBe(1)
    expect(repositorio.criarMuitos).toHaveBeenCalledTimes(1)
  })

  it('retorna 409 para mesma chave com payload diferente', async () => {
    const app = criarApp(repositorio)
    const chave = '22222222-2222-4222-8222-222222222222'
    const enviar = (valor: number) => app.request('/lancamentos', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': chave },
      body: JSON.stringify({ tipo: 'receita', descricao: 'Salário', valor, dataEmissao: '2026-10-11' }),
    })
    expect((await enviar(100)).status).toBe(201)
    expect((await enviar(101)).status).toBe(409)
    expect(repositorio.criarMuitos).toHaveBeenCalledTimes(1)
  })

  it('isola a mesma chave entre usuarios e preserva o caminho sem cabecalho', async () => {
    const executar = criarExecutorMemoria()
    const corpo = JSON.stringify({ tipo: 'receita', descricao: 'Salário', valor: 100, dataEmissao: '2026-10-11' })
    const init = { method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': '33333333-3333-4333-8333-333333333333' }, body: corpo }

    expect((await criarApp(repositorio, 'usuario-1', executar).request('/lancamentos', init)).status).toBe(201)
    expect((await criarApp(repositorio, 'usuario-2', executar).request('/lancamentos', init)).status).toBe(201)
    expect((await criarApp(repositorio).request('/lancamentos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: corpo })).status).toBe(201)
    expect(repositorio.criarMuitos).toHaveBeenCalledTimes(3)
  })
})
