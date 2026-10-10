import { Hono } from 'hono'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { LancamentoBanco, NovoLancamentoBanco } from '@/db/schema'

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

function criarApp(repositorio: RepositorioLancamentos) {
  const app = new Hono<{ Variables: { userId: string } }>()
  app.use('*', async (contexto, next) => {
    contexto.set('userId', 'usuario-1')
    await next()
  })
  app.route('/lancamentos', criarRotasLancamentos(repositorio))
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

  it('divide uma despesa parcelada em N linhas com o mesmo parcelamentoId', async () => {
    const resposta = await criarApp(repositorio).request('/lancamentos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo: 'despesa',
        descricao: 'Notebook',
        valor: 10001,
        vencimento: '2026-10-15',
        parcelado: true,
        quantidadeParcelas: 3,
      }),
    })

    expect(resposta.status).toBe(201)
    const [parcelas] = vi.mocked(repositorio.criarMuitos).mock.calls[0]
    expect(parcelas).toHaveLength(3)
    expect(new Set(parcelas.map((parcela) => parcela.parcelamentoId)).size).toBe(1)
    expect(parcelas.map((parcela) => parcela.valor)).toEqual([3333, 3333, 3335])
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
})
