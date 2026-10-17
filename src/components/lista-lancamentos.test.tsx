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
  it('clicar numa linha de despesa abre o menu de acoes com a descricao', async () => {
    renderWithProviders(<Harness />)

    fireEvent.click(await screen.findByText('Aluguel e condomínio'))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Marcar como paga' })).toBeInTheDocument()
      expect(screen.getAllByText('Aluguel e condomínio').length).toBeGreaterThan(1)
    })
  })

  it('cancelar fecha o dialogo sem marcar como paga', async () => {
    renderWithProviders(<Harness />)

    fireEvent.click(await screen.findByText('Internet fibra'))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Marcar como paga' })).toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Marcar como paga' })).not.toBeInTheDocument()
    })
  })

  it('confirmar marca a despesa como paga e fecha o dialogo', async () => {
    renderWithProviders(<Harness />)

    fireEvent.click(await screen.findByText('Fatura cartão de crédito'))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Marcar como paga' })).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: 'Marcar como paga' }))

    await waitFor(() => expect(screen.getByText('Deseja marcar como paga?')).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: 'Marcar como paga' }))

    await waitFor(() => {
      expect(screen.queryByText('Deseja marcar como paga?')).not.toBeInTheDocument()
    })
  })
})
