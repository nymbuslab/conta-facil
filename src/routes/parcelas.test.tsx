import { act, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

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

function Harness() {
  const { adicionarDespesa } = useLancamentos()
  return (
    <>
      <button
        onClick={() =>
          adicionarDespesa({
            descricao: 'Notebook',
            valor: '1.200,00',
            vencimento: '2026-01-10',
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
  it('mostra um card por parcelamentoId quando ha despesas parceladas no estado', async () => {
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
    function HarnessComMarcador() {
      const { adicionarDespesa, despesas, marcarComoPaga } = useLancamentos()
      return (
        <>
          <button
            onClick={() =>
              adicionarDespesa({
                descricao: 'Notebook',
                valor: '1.200,00',
                vencimento: '2026-01-10',
                parcelado: true,
                quantidadeParcelas: 12,
              })
            }
          >
            criar parcelamento
          </button>
          <button
            onClick={() => {
              despesas
                .filter((d) => d.descricao === 'Notebook')
                .slice(0, 3)
                .forEach((d) => marcarComoPaga(d.id))
            }}
          >
            marcar 3 pagas
          </button>
          <TelaParcelas />
        </>
      )
    }

    const { getByText, getByRole, getAllByText } = renderWithProviders(<HarnessComMarcador />)

    act(() => {
      getByRole('button', { name: 'criar parcelamento' }).click()
    })
    await waitFor(() => expect(getByText('Notebook')).toBeInTheDocument())

    act(() => {
      getByRole('button', { name: 'marcar 3 pagas' }).click()
    })

    await waitFor(() => {
      expect(getAllByText('3/12').length).toBeGreaterThan(0)
      expect(getByText('R$ 300,00')).toBeInTheDocument()
      expect(getByText('R$ 900,00')).toBeInTheDocument()
    })
  })
})
