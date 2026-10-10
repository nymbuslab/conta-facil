import { useEffect } from 'react'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithProviders } from '@/test/test-utils'
import { useCaixinhas } from '@/state/caixinhas-context'

import { MovimentarCaixinhaModal } from './movimentar-caixinha-modal'

function Harness({ tipo }: { tipo: 'depositar' | 'resgatar' }) {
  const { caixinhas, criarCaixinha } = useCaixinhas()

  useEffect(() => {
    if (caixinhas.length === 0) {
      criarCaixinha({ nome: 'Viagem', meta: '1.000,00' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (caixinhas.length === 0) return null

  return (
    <>
      <MovimentarCaixinhaModal caixinha={caixinhas[0]} tipo={tipo} onOpenChange={() => {}} />
      <div data-testid="valor-guardado">{caixinhas[0].valorGuardado}</div>
    </>
  )
}

describe('MovimentarCaixinhaModal', () => {
  it('submeter deposito soma ao valorGuardado da caixinha', async () => {
    renderWithProviders(<Harness tipo="depositar" />)

    fireEvent.change(await screen.findByLabelText('Valor'), { target: { value: '5000' } })
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }))

    await waitFor(() => {
      expect(screen.getByTestId('valor-guardado')).toHaveTextContent('50')
    })
  })

  it('submeter resgate maior que o valor guardado exibe mensagem de erro e nao altera o estado', async () => {
    renderWithProviders(<Harness tipo="resgatar" />)

    fireEvent.change(await screen.findByLabelText('Valor'), { target: { value: '100000' } })
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }))

    await waitFor(() => {
      expect(screen.getByText('Valor maior que o guardado nesta caixinha')).toBeInTheDocument()
      expect(screen.getByTestId('valor-guardado')).toHaveTextContent('0')
    })
  })
})
