import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithProviders } from '@/test/test-utils'
import { useLancamentos } from '@/state/lancamentos-context'

import { LancamentoModal } from './lancamento-modal'

function abrirModalDespesa() {
  return renderWithProviders(<LancamentoModal tipo="despesa" onOpenChange={() => {}} />)
}

function HarnessComContador() {
  const { despesas } = useLancamentos()
  return (
    <>
      <LancamentoModal tipo="despesa" onOpenChange={() => {}} />
      <div data-testid="total-despesas">{despesas.length}</div>
    </>
  )
}

describe('LancamentoModal — Despesa parcelada', () => {
  it('marcar o checkbox Parcelado exibe o campo Quantidade de parcelas', async () => {
    abrirModalDespesa()

    expect(screen.queryByLabelText('Quantidade de parcelas')).not.toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('Parcelado?'))

    await waitFor(() => {
      expect(screen.getByLabelText('Quantidade de parcelas')).toBeInTheDocument()
    })
  })

  it('muda o rotulo do campo Valor para "Valor total da dívida" quando parcelado', async () => {
    abrirModalDespesa()

    expect(screen.getByText('Valor')).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('Parcelado?'))

    await waitFor(() => {
      expect(screen.getByText('Valor total da dívida')).toBeInTheDocument()
    })
  })

  it('submeter com parcelado marcado e quantidade 3 gera 3 despesas no estado', async () => {
    renderWithProviders(<HarnessComContador />)

    expect(screen.getByTestId('total-despesas')).toHaveTextContent('3')

    fireEvent.change(screen.getByLabelText('Descrição'), {
      target: { value: 'Notebook' },
    })
    fireEvent.click(screen.getByLabelText('Parcelado?'))

    await waitFor(() => expect(screen.getByLabelText('Quantidade de parcelas')).toBeInTheDocument())
    fireEvent.change(screen.getByLabelText('Quantidade de parcelas'), { target: { value: '3' } })
    fireEvent.change(screen.getByLabelText('Valor total da dívida'), { target: { value: '900' } })
    fireEvent.change(screen.getByLabelText('Vencimento'), {
      target: { value: '2026-10-10' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Registrar despesa' }))

    await waitFor(() => {
      expect(screen.getByTestId('total-despesas')).toHaveTextContent('6')
    })
  })
})
