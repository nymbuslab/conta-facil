import { fireEvent, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderRoute } from '@/test/render-route'

describe('TelaExtrato', () => {
  it('renderiza busca, navegador de mes, abas e o FAB de registrar', async () => {
    const { getByLabelText, getByRole, getByText } = renderRoute('/extrato')

    await waitFor(() => {
      expect(getByLabelText('Buscar lançamentos')).toBeInTheDocument()
      expect(getByLabelText('Mês anterior')).toBeInTheDocument()
      expect(getByRole('tab', { name: 'Receita' })).toBeInTheDocument()
      expect(getByRole('tab', { name: 'Despesas' })).toBeInTheDocument()
      expect(getByRole('button', { name: 'Registrar lançamento' })).toBeInTheDocument()
    })
    expect(getByText('Salário mensal')).toBeInTheDocument()
  })

  it('abre na aba despesas quando a busca da rota pede aba=despesa', async () => {
    const { getByText, queryByText } = renderRoute('/extrato?aba=despesa')

    await waitFor(() => expect(getByText('Aluguel e condomínio')).toBeInTheDocument())
    expect(queryByText('Salário mensal')).not.toBeInTheDocument()
  })

  it('a busca filtra a lista por descricao', async () => {
    const { getByLabelText, getByText, queryByText } = renderRoute('/extrato')
    await waitFor(() => expect(getByText('Salário mensal')).toBeInTheDocument())

    fireEvent.change(getByLabelText('Buscar lançamentos'), { target: { value: 'sal' } })

    await waitFor(
      () => expect(queryByText('Freelance UI design')).not.toBeInTheDocument(),
      { timeout: 2000 },
    )
    expect(getByText('Salário mensal')).toBeInTheDocument()
  })

  it('o FAB abre o modal de registrar despesa', async () => {
    const { getByRole, findByRole } = renderRoute('/extrato')
    await waitFor(() => expect(getByRole('button', { name: 'Registrar lançamento' })).toBeInTheDocument())

    fireEvent.click(getByRole('button', { name: 'Registrar lançamento' }))
    fireEvent.click(getByRole('button', { name: /Despesa/ }))

    expect(await findByRole('dialog')).toBeInTheDocument()
  })
})
