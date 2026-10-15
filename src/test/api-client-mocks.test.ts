import { describe, expect, it } from 'vitest'

import {
  criarClienteCaixinhasTeste,
  criarClienteLancamentosTeste,
  criarEstadoLancamentosTeste,
} from './api-client-mocks'

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
