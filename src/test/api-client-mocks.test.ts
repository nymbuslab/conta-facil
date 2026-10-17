import { describe, expect, it } from 'vitest'

import {
  criarClienteCaixinhasTeste,
  criarClienteLancamentosTeste,
  criarEstadoLancamentosTeste,
} from './api-client-mocks'

function emDias(deslocamento: number) {
  const data = new Date()
  data.setDate(data.getDate() + deslocamento)
  return data.toISOString().slice(0, 10)
}

describe('criarClienteLancamentosTeste — GET /lancamentos/vencendo', () => {
  it('devolve so despesas nao pagas dentro da janela de dias, ordenadas por vencimento', async () => {
    const cliente = criarClienteLancamentosTeste([
      { id: 'd1', tipo: 'despesa', descricao: 'Vence em 10 dias', valor: 100, vencimento: emDias(10), paga: false },
      { id: 'd2', tipo: 'despesa', descricao: 'Vence em 3 dias', valor: 200, vencimento: emDias(3), paga: false },
      { id: 'd3', tipo: 'despesa', descricao: 'Vence em 1 dia', valor: 300, vencimento: emDias(1), paga: false },
      { id: 'd4', tipo: 'despesa', descricao: 'Paga, vence em 2 dias', valor: 400, vencimento: emDias(2), paga: true },
    ])

    const resposta = await cliente.get<{ itens: { id: string }[] }>('/lancamentos/vencendo?dias=3')

    expect(resposta.itens.map((item) => item.id)).toEqual(['d3', 'd2'])
  })

  it('exclui despesas pagas e as fora da janela', async () => {
    const cliente = criarClienteLancamentosTeste([
      { id: 'd1', tipo: 'despesa', descricao: 'Vence em 10 dias', valor: 100, vencimento: emDias(10), paga: false },
    ])

    const resposta = await cliente.get<{ itens: { id: string }[] }>('/lancamentos/vencendo?dias=3')

    expect(resposta.itens).toEqual([])
  })
})

describe('criarClienteLancamentosTeste — GET /lancamentos/recentes', () => {
  it('devolve os mais recentes misturando tipo, sem paginacao', async () => {
    const cliente = criarClienteLancamentosTeste(
      Array.from({ length: 8 }, (_, indice) => ({
        id: `l${indice}`,
        tipo: indice % 2 === 0 ? 'receita' : 'despesa',
        descricao: `Lancamento ${indice}`,
        valor: 10,
        dataEmissao: indice % 2 === 0 ? '2026-10-01' : null,
        vencimento: indice % 2 === 1 ? '2026-10-15' : null,
        paga: false,
      })),
    )

    const resposta = await cliente.get<{ itens: { id: string }[] }>('/lancamentos/recentes?limite=5')

    expect(resposta.itens.map((item) => item.id)).toEqual(['l7', 'l6', 'l5', 'l4', 'l3'])
  })
})

describe('criarClienteCaixinhasTeste com origem', () => {
  it('deposito de_fora cria uma receita fake no estado de lancamentos compartilhado', async () => {
    const estadoLancamentos = criarEstadoLancamentosTeste([])
    const clienteCaixinhas = criarClienteCaixinhasTeste([], { lancamentosEstado: estadoLancamentos })
    const clienteLancamentos = criarClienteLancamentosTeste([], estadoLancamentos)

    const criada = await clienteCaixinhas.post<{ id: string }>('/caixinhas', { nome: 'Viagem', meta: 100000 })
    await clienteCaixinhas.postIdempotente(`/caixinhas/${criada.id}/depositar`, { valor: 50000, origem: 'de_fora' })

    const resumo = await clienteLancamentos.get<{ receitas: number; despesas: number }>('/lancamentos/resumo')
    expect(resumo.receitas).toBe(50000)
  })

  it('deposito saldo_atual nao cria lancamento nenhum', async () => {
    const estadoLancamentos = criarEstadoLancamentosTeste([])
    const clienteCaixinhas = criarClienteCaixinhasTeste([], { lancamentosEstado: estadoLancamentos })
    const clienteLancamentos = criarClienteLancamentosTeste([], estadoLancamentos)

    const criada = await clienteCaixinhas.post<{ id: string }>('/caixinhas', { nome: 'Viagem', meta: 100000 })
    await clienteCaixinhas.postIdempotente(`/caixinhas/${criada.id}/depositar`, { valor: 50000, origem: 'saldo_atual' })

    const resumo = await clienteLancamentos.get<{ receitas: number; despesas: number }>('/lancamentos/resumo')
    expect(resumo.receitas).toBe(0)
  })
})
