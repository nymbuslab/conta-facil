import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { renderWithProviders } from '@/test/test-utils'
import { criarClienteLancamentosTeste } from '@/test/api-client-mocks'
import { useLancamentos } from '@/state/lancamentos-context'
import type { ApiClient } from '@/lib/api-client'
import type { Despesa, Receita } from '@/types/lancamento'

import { AcoesLancamentoDialog } from './acoes-lancamento-dialog'

const despesaPendente: Despesa = {
  id: 'd1', tipo: 'despesa', descricao: 'Aluguel e condomínio', valor: 1850,
  vencimento: '2026-10-10', paga: false, pagoEm: null,
  parcelamentoId: null, parcelaAtual: null, totalParcelas: null,
}

const despesaParcelada: Despesa = {
  id: 'p2', tipo: 'despesa', descricao: 'Notebook', valor: 333.33,
  vencimento: '2026-10-25', paga: false, pagoEm: null,
  parcelamentoId: 'pc1', parcelaAtual: 2, totalParcelas: 3,
}

const receita: Receita = {
  id: 'r1', tipo: 'receita', descricao: 'Salário mensal', valor: 5200, dataEmissao: '2026-10-05',
}

const despesaPaga: Despesa = {
  id: 'd4', tipo: 'despesa', descricao: 'Água', valor: 80, vencimento: '2026-10-05',
  paga: true, pagoEm: '2026-10-05', parcelamentoId: null, parcelaAtual: null, totalParcelas: null,
}

/** editarReceita/editarDespesa/excluirLancamento so atuam sobre um id ja presente na lista
 * carregada do contexto (precisam do "anterior" pra reverter em falha) — por isso o harness
 * espera o carregamento inicial assentar (via o numero total exposto) antes de qualquer
 * interacao, em vez de confiar na sorte do timing do fetch mockado. */
function Harness({ lancamento, onOpenChange }: { lancamento: Despesa | Receita | null; onOpenChange: (open: boolean) => void }) {
  const { receitas, despesas } = useLancamentos()
  return (
    <>
      <span data-testid="total-lancamentos">{receitas.length + despesas.length}</span>
      <AcoesLancamentoDialog lancamento={lancamento} onOpenChange={onOpenChange} />
    </>
  )
}

async function renderizar(lancamento = despesaPendente as typeof despesaPendente | Receita | null, clienteLancamentos?: ApiClient) {
  const onOpenChange = vi.fn()
  renderWithProviders(<Harness lancamento={lancamento} onOpenChange={onOpenChange} />, {
    clienteLancamentos,
  })
  await waitFor(() => expect(Number(screen.getByTestId('total-lancamentos').textContent)).toBeGreaterThan(0))
  return { onOpenChange }
}

/** O contexto so aceita editar/excluir um id que ja esta na lista carregada (precisa do "anterior"
 * pra reverter em falha) — por isso os testes de parcela usam um cliente com esse fixture no
 * estado inicial, em vez do id direto do prop do dialogo. */
function clienteComParcela() {
  return criarClienteLancamentosTeste([
    {
      id: 'p2', tipo: 'despesa', descricao: 'Notebook', valor: 33333,
      vencimento: '2026-10-25', paga: false, pagoEm: null,
      parcelamentoId: 'pc1', parcelaAtual: 2, totalParcelas: 3,
    },
  ])
}

function clienteComDespesaPaga() {
  return criarClienteLancamentosTeste([
    {
      id: 'd4', tipo: 'despesa', descricao: 'Água', valor: 8000,
      vencimento: '2026-10-05', paga: true, pagoEm: '2026-10-05',
      parcelamentoId: null, parcelaAtual: null, totalParcelas: null,
    },
  ])
}

describe('AcoesLancamentoDialog — menu de ações', () => {
  it('despesa pendente mostra marcar como paga, editar e excluir', async () => {
    await renderizar(despesaPendente)

    expect(await screen.findByRole('button', { name: 'Marcar como paga' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Excluir' })).toBeInTheDocument()
  })

  it('receita nao mostra a opcao marcar como paga', async () => {
    await renderizar(receita)

    expect(await screen.findByRole('button', { name: 'Editar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Excluir' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Marcar como paga' })).not.toBeInTheDocument()
  })

  it('despesa ja paga mostra aviso de que a mudanca afeta o Total Pago', async () => {
    await renderizar(despesaPaga, clienteComDespesaPaga())

    expect(await screen.findByText(/já foi paga/i)).toBeInTheDocument()
    expect(screen.getByText(/Total Pago/)).toBeInTheDocument()
  })

  it('despesa pendente nao mostra o aviso de despesa paga', async () => {
    await renderizar(despesaPendente)

    expect(await screen.findByRole('button', { name: 'Editar' })).toBeInTheDocument()
    expect(screen.queryByText(/já foi paga/i)).not.toBeInTheDocument()
  })

  it('receita nao mostra o aviso de despesa paga', async () => {
    await renderizar(receita)

    expect(await screen.findByRole('button', { name: 'Editar' })).toBeInTheDocument()
    expect(screen.queryByText(/já foi paga/i)).not.toBeInTheDocument()
  })
})

describe('AcoesLancamentoDialog — marcar como paga', () => {
  it('dispara marcarComoPaga do contexto e fecha o dialogo', async () => {
    const patch = vi.fn().mockResolvedValue({ id: 'd1', tipo: 'despesa', paga: true, pagoEm: '2026-10-17' })
    const cliente = { ...criarClienteLancamentosTeste(), patch } as unknown as ApiClient
    const { onOpenChange } = await renderizar(despesaPendente, cliente)

    fireEvent.click(await screen.findByRole('button', { name: 'Marcar como paga' }))
    await screen.findByText('Deseja marcar como paga?')
    fireEvent.click(screen.getByRole('button', { name: 'Marcar como paga' }))

    await waitFor(() => expect(patch).toHaveBeenCalledWith('/lancamentos/d1/pagar'))
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false))
  })
})

describe('AcoesLancamentoDialog — editar', () => {
  it('formulario vem preenchido com os valores atuais e salva via editarDespesa', async () => {
    const patchIdempotente = vi.fn().mockResolvedValue([{ ...despesaPendente, descricao: 'Aluguel novo' }])
    const cliente = { ...criarClienteLancamentosTeste(), patchIdempotente } as unknown as ApiClient
    const { onOpenChange } = await renderizar(despesaPendente, cliente)

    fireEvent.click(await screen.findByRole('button', { name: 'Editar' }))

    const campoDescricao = await screen.findByLabelText('Descrição') as HTMLInputElement
    expect(campoDescricao.value).toBe('Aluguel e condomínio')

    fireEvent.change(campoDescricao, { target: { value: 'Aluguel novo' } })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() => expect(patchIdempotente).toHaveBeenCalledWith('/lancamentos/d1', expect.objectContaining({
      tipo: 'despesa', descricao: 'Aluguel novo',
    })))
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false))
  })
})

describe('AcoesLancamentoDialog — excluir', () => {
  it('mostra o texto que nomeia a consequencia e chama excluirLancamento ao confirmar', async () => {
    const deleteIdempotente = vi.fn().mockResolvedValue({ idsExcluidos: ['d1'] })
    const cliente = { ...criarClienteLancamentosTeste(), deleteIdempotente } as unknown as ApiClient
    const { onOpenChange } = await renderizar(despesaPendente, cliente)

    fireEvent.click(await screen.findByRole('button', { name: 'Excluir' }))

    expect(await screen.findByText('Essa ação não pode ser desfeita.')).toBeInTheDocument()
    const botaoExcluir = screen.getByRole('button', { name: 'Excluir' })
    expect(botaoExcluir).toHaveClass('bg-destructive')
    fireEvent.click(botaoExcluir)

    await waitFor(() => expect(deleteIdempotente).toHaveBeenCalledWith('/lancamentos/d1'))
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false))
  })
})

describe('AcoesLancamentoDialog — alcance de parcelamento', () => {
  it('pergunta o alcance antes de editar uma parcela, e repassa a escolha ao contexto', async () => {
    const patchIdempotente = vi.fn().mockResolvedValue([despesaParcelada])
    const cliente = { ...clienteComParcela(), patchIdempotente } as unknown as ApiClient
    await renderizar(despesaParcelada, cliente)

    fireEvent.click(await screen.findByRole('button', { name: 'Editar' }))
    expect(await screen.findByText(/só esta parcela ou esta e as futuras/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Esta e as futuras' }))

    const campoValor = await screen.findByLabelText('Valor')
    fireEvent.change(campoValor, { target: { value: '400,00' } })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() => expect(patchIdempotente).toHaveBeenCalledWith('/lancamentos/p2', expect.objectContaining({
      alcance: 'futuras',
    })))
  })

  it('despesa sem parcelamento vai direto pro formulario, sem perguntar alcance', async () => {
    await renderizar(despesaPendente)

    fireEvent.click(await screen.findByRole('button', { name: 'Editar' }))

    expect(await screen.findByLabelText('Descrição')).toBeInTheDocument()
    expect(screen.queryByText(/só esta parcela ou esta e as futuras/i)).not.toBeInTheDocument()
  })
})

describe('AcoesLancamentoDialog — erro de vinculo com caixinha', () => {
  it('mostra o erro 409 sem fechar o dialogo', async () => {
    const { ApiError } = await import('@/lib/api-client')
    const patchIdempotente = vi.fn().mockRejectedValue(
      new ApiError(409, 'Lançamento vinculado a um depósito em caixinha — edite ou exclua por lá'),
    )
    const cliente = { ...criarClienteLancamentosTeste(), patchIdempotente } as unknown as ApiClient
    const { onOpenChange } = await renderizar(receita, cliente)

    fireEvent.click(await screen.findByRole('button', { name: 'Editar' }))
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(await screen.findByText('Lançamento vinculado a um depósito em caixinha — edite ou exclua por lá'))
      .toBeInTheDocument()
    expect(onOpenChange).not.toHaveBeenCalledWith(false)
  })
})
