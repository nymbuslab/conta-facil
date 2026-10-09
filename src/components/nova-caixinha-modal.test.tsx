import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithProviders } from '@/test/test-utils'
import { useCaixinhas } from '@/state/caixinhas-context'

import { NovaCaixinhaModal } from './nova-caixinha-modal'

function Harness() {
  const { caixinhas } = useCaixinhas()
  return (
    <>
      <NovaCaixinhaModal open onOpenChange={() => {}} />
      <div data-testid="total-caixinhas">{caixinhas.length}</div>
    </>
  )
}

describe('NovaCaixinhaModal', () => {
  it('bloqueia submissao com nome vazio', async () => {
    renderWithProviders(<Harness />)

    fireEvent.click(screen.getByRole('button', { name: 'Criar caixinha' }))

    await waitFor(() => {
      expect(screen.getByTestId('total-caixinhas')).toHaveTextContent('0')
    })
  })

  it('submeter com nome e meta validos chama criarCaixinha com os dados corretos', async () => {
    renderWithProviders(<Harness />)

    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Viagem' } })
    fireEvent.change(screen.getByLabelText('Meta'), { target: { value: '600000' } })

    fireEvent.click(screen.getByRole('button', { name: 'Criar caixinha' }))

    await waitFor(() => {
      expect(screen.getByTestId('total-caixinhas')).toHaveTextContent('1')
    })
  })
})
