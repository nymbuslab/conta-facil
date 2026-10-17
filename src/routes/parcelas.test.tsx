import { act, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { ApiClient } from '@/lib/api-client'
import { adicionarMeses } from '@/lib/datas'
import { criarClienteLancamentosTeste } from '@/test/api-client-mocks'
import { renderWithProviders } from '@/test/test-utils'
import { renderRoute } from '@/test/render-route'
import { useLancamentos } from '@/state/lancamentos-context'

import { TelaParcelas } from './parcelas'

describe('rota /parcelas', () => {
  it('renderiza o texto Parcelas no documento', async () => {
    const { getByText } = renderRoute('/parcelas')
    await waitFor(() => expect(getByText('Parcelas', { selector: 'h1' })).toBeInTheDocument())
  })
})

describe('TelaParcelas - estados remotos', () => {
  it('nao mostra o vazio antes da consulta terminar', () => {
    const cliente = {
      ...criarClienteLancamentosTeste(),
      get: vi.fn(() => new Promise(() => {})),
    } as unknown as ApiClient
    const { getByRole, queryByText } = renderWithProviders(<TelaParcelas />, {
      clienteLancamentos: cliente,
    })

    expect(getByRole('status', { name: 'Carregando dados' })).toBeInTheDocument()
    expect(queryByText('Nenhuma compra parcelada ainda.')).not.toBeInTheDocument()
  })
})

function Harness() {
  const { adicionarDespesa } = useLancamentos()
  return (
    <>
      <button
        onClick={() =>
          adicionarDespesa({
            descricao: 'Notebook',
            valor: '1.200,00',
            vencimento: '2026-10-10',
            parcelado: true,
            quantidadeParcelas: 12,
          })
        }
      >
        criar parcelamento
      </button>
      <TelaParcelas />
    </>
  )
}

describe('TelaParcelas — cards de parcelamento', () => {
  it('mostra um card por parcelamentoId quando um parcelamento e criado', async () => {
    const { getByText, getByRole } = renderWithProviders(<Harness />)

    act(() => {
      getByRole('button', { name: 'criar parcelamento' }).click()
    })

    await waitFor(() => {
      expect(getByText('Notebook')).toBeInTheDocument()
      expect(getByText('0/12')).toBeInTheDocument()
    })
  })

  it('mostra Pago e Falta corretos quando algumas parcelas ja foram pagas', async () => {
    const parceladas = Array.from({ length: 12 }, (_, indice) => ({
      id: `parcela-${indice + 1}`,
      tipo: 'despesa',
      descricao: 'Notebook',
      valor: 10000,
      dataEmissao: null,
      vencimento: adicionarMeses('2026-01-10', indice),
      paga: indice < 3,
      parcelamentoId: 'parcelamento-1',
      parcelaAtual: indice + 1,
      totalParcelas: 12,
    }))

    const { getByText, getAllByText } = renderWithProviders(<TelaParcelas />, {
      clienteLancamentos: criarClienteLancamentosTeste(parceladas),
    })

    await waitFor(() => {
      expect(getAllByText('3/12').length).toBeGreaterThan(0)
      expect(getByText('R$ 300,00')).toBeInTheDocument()
      expect(getByText('R$ 900,00')).toBeInTheDocument()
    })
  })
})

function HarnessEdicaoExclusao() {
  const { editarDespesa, excluirLancamento } = useLancamentos()
  return (
    <>
      <button onClick={() => void editarDespesa('parcela-2', { descricao: 'Notebook', valor: '175,00', vencimento: '2026-02-10', parcelado: false, quantidadeParcelas: undefined })}>
        editar parcela 2
      </button>
      <button onClick={() => void excluirLancamento('parcela-2', 'despesa', 'somente')}>
        excluir parcela 2
      </button>
      <TelaParcelas />
    </>
  )
}

describe('TelaParcelas — reflete edicao e exclusao de parcela (D-10)', () => {
  // Parcela 1 paga e valores distintos por parcela evitam que valorTotal/Pago/Falta coincidam
  // no texto renderizado (getByText exige um unico elemento com aquele texto exato).
  // editarDespesa/excluirLancamento so atuam sobre um id presente na lista `despesas` do
  // contexto, que e filtrada pelo mes vigente (igual ao que a tela Extrato mostra) — por isso
  // as tres parcelas caem no mes atual, mesmo representando um parcelamento de verdade (que na
  // pratica se espalharia por varios meses).
  const parceladasBase = [
    { id: 'parcela-1', tipo: 'despesa', descricao: 'Notebook', valor: 10000, dataEmissao: null, vencimento: '2026-10-05', paga: true, parcelamentoId: 'parcelamento-1', parcelaAtual: 1, totalParcelas: 3 },
    { id: 'parcela-2', tipo: 'despesa', descricao: 'Notebook', valor: 15000, dataEmissao: null, vencimento: '2026-10-10', paga: false, parcelamentoId: 'parcelamento-1', parcelaAtual: 2, totalParcelas: 3 },
    { id: 'parcela-3', tipo: 'despesa', descricao: 'Notebook', valor: 20000, dataEmissao: null, vencimento: '2026-10-15', paga: false, parcelamentoId: 'parcelamento-1', parcelaAtual: 3, totalParcelas: 3 },
  ]

  it('editar o valor de uma parcela nao paga atualiza valorTotal do grupo', async () => {
    const { getByText, getByRole } = renderWithProviders(<HarnessEdicaoExclusao />, {
      clienteLancamentos: criarClienteLancamentosTeste(parceladasBase),
    })
    // 100 + 150 + 200 = 450
    await waitFor(() => expect(getByText('R$ 450,00')).toBeInTheDocument())

    act(() => {
      getByRole('button', { name: 'editar parcela 2' }).click()
    })

    // Parcela 2 passa de 150,00 para 175,00: 100 + 175 + 200 = 475
    await waitFor(() => expect(getByText('R$ 475,00')).toBeInTheDocument())
  })

  it('excluir uma parcela nao paga atualiza totalParcelas e valorTotal do grupo', async () => {
    const { getAllByText, getByText, getByRole } = renderWithProviders(<HarnessEdicaoExclusao />, {
      clienteLancamentos: criarClienteLancamentosTeste(parceladasBase),
    })
    await waitFor(() => expect(getAllByText('1/3').length).toBeGreaterThan(0))

    act(() => {
      getByRole('button', { name: 'excluir parcela 2' }).click()
    })

    // Restam parcela 1 (paga, 100) e parcela 3 (200): totalParcelas vira 2, valorTotal 300.
    await waitFor(() => {
      expect(getAllByText('1/2').length).toBeGreaterThan(0)
      expect(getByText('R$ 300,00')).toBeInTheDocument()
    })
  })
})
