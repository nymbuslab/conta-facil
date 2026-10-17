import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { AuthProvider } from '@/state/auth-context'
import { LancamentosProvider } from '@/state/lancamentos-context'
import { criarClienteLancamentosTeste } from '@/test/api-client-mocks'
import { criarClienteAuthTeste } from '@/test/test-utils'
import type { Despesa, Receita } from '@/types/lancamento'

import { ExtratoLista } from './extrato-lista'

function renderizar(props: Partial<React.ComponentProps<typeof ExtratoLista>> = {}) {
  return render(
    <AuthProvider cliente={criarClienteAuthTeste()}>
      <LancamentosProvider cliente={criarClienteLancamentosTeste([])}>
        <ExtratoLista
          receitas={[]}
          despesas={[]}
          temMaisReceitas={false}
          temMaisDespesas={false}
          carregandoMais={null}
          erroCarregarMais={null}
          onCarregarMaisReceitas={vi.fn()}
          onCarregarMaisDespesas={vi.fn()}
          {...props}
        />
      </LancamentosProvider>
    </AuthProvider>,
  )
}

const receita: Receita = { id: 'r1', tipo: 'receita', descricao: 'Salário', valor: 5000, dataEmissao: '2026-10-17' }
const despesa: Despesa = {
  id: 'd1', tipo: 'despesa', descricao: 'Internet', valor: 90, vencimento: '2026-10-20',
  paga: false, parcelamentoId: null, parcelaAtual: null, totalParcelas: null,
}

describe('ExtratoLista', () => {
  it('mostra a aba Receita ativa por padrao, so com a tabela de receitas', async () => {
    renderizar({ receitas: [receita], despesas: [despesa] })

    await waitFor(() => expect(screen.getByText('Salário')).toBeInTheDocument())
    expect(screen.queryByText('Internet')).not.toBeInTheDocument()
  })

  it('clicar em Despesas troca a lista exibida sem desmontar o resto da tela', async () => {
    renderizar({ receitas: [receita], despesas: [despesa] })
    await waitFor(() => expect(screen.getByText('Salário')).toBeInTheDocument())

    fireEvent.click(screen.getByRole('tab', { name: 'Despesas' }))

    await waitFor(() => expect(screen.getByText('Internet')).toBeInTheDocument())
    expect(screen.queryByText('Salário')).not.toBeInTheDocument()
  })

  it('respeita a aba inicial recebida por prop', async () => {
    renderizar({ receitas: [receita], despesas: [despesa], abaInicial: 'despesa' })

    await waitFor(() => expect(screen.getByText('Internet')).toBeInTheDocument())
    expect(screen.queryByText('Salário')).not.toBeInTheDocument()
  })

  it('mostra o botao carregar mais da aba ativa', async () => {
    const onCarregarMaisReceitas = vi.fn()
    renderizar({ receitas: [receita], temMaisReceitas: true, onCarregarMaisReceitas })
    await waitFor(() => expect(screen.getByText('Salário')).toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: 'Carregar mais' }))

    expect(onCarregarMaisReceitas).toHaveBeenCalled()
  })
})
