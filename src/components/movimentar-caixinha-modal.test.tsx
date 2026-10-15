import { useEffect } from 'react'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useCaixinhas } from '@/state/caixinhas-context'
import {
  criarClienteCaixinhasTeste,
  criarClienteLancamentosTeste,
  criarEstadoLancamentosTeste,
} from '@/test/api-client-mocks'
import { renderWithProviders } from '@/test/test-utils'

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

  it('modal de depositar mostra o campo de origem pre-marcado em saldo atual', async () => {
    renderWithProviders(<Harness tipo="depositar" />)
    await screen.findByLabelText('Valor')

    const radioSaldoAtual = screen.getByRole('radio', { name: /saldo atual/i })
    const radioDeFora = screen.getByRole('radio', { name: /dinheiro de fora/i })
    expect(radioSaldoAtual).toBeChecked()
    expect(radioDeFora).not.toBeChecked()
  })

  it('modal de resgatar nao mostra o campo de origem', async () => {
    renderWithProviders(<Harness tipo="resgatar" />)
    await screen.findByLabelText('Valor')

    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument()
  })

  it('selecionar dinheiro de fora e confirmar envia origem de_fora e cria a receita vinculada', async () => {
    const estadoLancamentos = criarEstadoLancamentosTeste([])
    const clienteCaixinhas = criarClienteCaixinhasTeste([], { lancamentosEstado: estadoLancamentos })
    const clienteLancamentos = criarClienteLancamentosTeste([], estadoLancamentos)

    renderWithProviders(<Harness tipo="depositar" />, { clienteCaixinhas, clienteLancamentos })

    fireEvent.change(await screen.findByLabelText('Valor'), { target: { value: '5000' } })
    fireEvent.click(screen.getByRole('radio', { name: /dinheiro de fora/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }))

    await waitFor(() => {
      expect(screen.getByTestId('valor-guardado')).toHaveTextContent('50')
    })
    expect(estadoLancamentos.dados).toHaveLength(1)
    expect(estadoLancamentos.dados[0]).toMatchObject({ tipo: 'receita', valor: 5000 })
  })
})
