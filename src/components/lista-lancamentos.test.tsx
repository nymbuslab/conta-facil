import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithProviders } from '@/test/test-utils'
import { useLancamentos } from '@/state/lancamentos-context'

import { ListaLancamentos } from './lista-lancamentos'

function Harness() {
  const { receitas, despesas } = useLancamentos()
  return <ListaLancamentos receitas={receitas} despesas={despesas} />
}

describe('ListaLancamentos — marcar despesa como paga', () => {
  it('clicar numa linha de despesa abre o dialogo de confirmacao com a descricao', async () => {
    renderWithProviders(<Harness />)

    fireEvent.click(screen.getByText('Aluguel e condomínio'))

    await waitFor(() => {
      expect(screen.getByText('Deseja marcar como paga?')).toBeInTheDocument()
      expect(screen.getAllByText('Aluguel e condomínio').length).toBeGreaterThan(1)
    })
  })

  it('cancelar fecha o dialogo sem marcar como paga', async () => {
    renderWithProviders(<Harness />)

    fireEvent.click(screen.getByText('Internet fibra'))
    await waitFor(() => expect(screen.getByText('Deseja marcar como paga?')).toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

    await waitFor(() => {
      expect(screen.queryByText('Deseja marcar como paga?')).not.toBeInTheDocument()
    })
  })

  it('confirmar marca a despesa como paga e fecha o dialogo', async () => {
    renderWithProviders(<Harness />)

    fireEvent.click(screen.getByText('Fatura cartão de crédito'))
    await waitFor(() => expect(screen.getByText('Deseja marcar como paga?')).toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: 'Marcar como paga' }))

    await waitFor(() => {
      expect(screen.queryByText('Deseja marcar como paga?')).not.toBeInTheDocument()
    })
  })
})
