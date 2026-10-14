import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { describe, expect, it, vi } from 'vitest'

import { CaixinhaCard } from '@/components/caixinha-card'
import { ListaLancamentos } from '@/components/lista-lancamentos'
import { RegistrarFab } from '@/components/registrar-fab'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { useLancamentos } from '@/state/lancamentos-context'
import { renderWithProviders } from '@/test/test-utils'

function HarnessLancamentos() {
  const { receitas, despesas } = useLancamentos()
  return <ListaLancamentos receitas={receitas} despesas={despesas} />
}

describe('acessibilidade — nomes acessiveis e teclado', () => {
  it('expoe a exclusao da caixinha com nome acessivel e aciona por teclado', async () => {
    const onExcluir = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(
      <CaixinhaCard
        caixinha={{ id: '1', nome: 'Viagem', valorGuardado: 0, meta: 100 }}
        onDepositar={() => {}}
        onResgatar={() => {}}
        onExcluir={onExcluir}
      />,
    )

    const botao = screen.getByRole('button', { name: 'Excluir caixinha Viagem' })
    botao.focus()
    expect(botao).toHaveFocus()

    await user.keyboard('{Enter}')
    expect(onExcluir).toHaveBeenCalledTimes(1)
  })

  it('anuncia a acao de pagar no status e abre a confirmacao por teclado', async () => {
    const user = userEvent.setup()
    renderWithProviders(<HarnessLancamentos />)

    const botoes = await screen.findAllByRole('button', { name: /marcar ".+" como paga/ })
    const botaoStatus = botoes[0]
    botaoStatus.focus()
    expect(botaoStatus).toHaveFocus()

    await user.keyboard('{Enter}')

    await waitFor(() => {
      expect(screen.getByText('Deseja marcar como paga?')).toBeInTheDocument()
    })
  })

  it('o botao de fechar do dialogo tem nome acessivel em portugues', () => {
    renderWithProviders(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Nova receita</DialogTitle>
        </DialogContent>
      </Dialog>,
    )

    expect(screen.getByRole('button', { name: 'Fechar' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument()
  })
})

describe('acessibilidade — axe sem violacoes', () => {
  it('ListaLancamentos', async () => {
    const { container } = renderWithProviders(<HarnessLancamentos />)
    await screen.findByText('Aluguel e condomínio')
    const resultados = await axe(container)
    expect(resultados.violations).toEqual([])
  })

  it('CaixinhaCard', async () => {
    const { container } = renderWithProviders(
      <CaixinhaCard
        caixinha={{ id: '1', nome: 'Viagem', valorGuardado: 2400, meta: 6000 }}
        onDepositar={() => {}}
        onResgatar={() => {}}
        onExcluir={() => {}}
      />,
    )
    const resultados = await axe(container)
    expect(resultados.violations).toEqual([])
  })

  it('RegistrarFab', async () => {
    const { container } = renderWithProviders(<RegistrarFab />)
    const resultados = await axe(container)
    expect(resultados.violations).toEqual([])
  })
})
