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
