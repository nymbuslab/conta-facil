import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { act } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ApiError, type ApiClient } from '@/lib/api-client'
import { criarClienteCaixinhasTeste, criarClienteLancamentosTeste } from '@/test/api-client-mocks'
import { renderWithProviders } from '@/test/test-utils'
import { LancamentoModal } from '@/components/lancamento-modal'
import { ListaLancamentos } from '@/components/lista-lancamentos'
import { useLancamentos } from '@/state/lancamentos-context'
import { TelaCaixinhas } from '@/routes/caixinhas'

type LancamentoResposta = Record<string, unknown>

/** Promise que so resolve/rejeita quando o teste mandar, para simular rede lenta. */
function promessaControlada<T>() {
  let resolver!: (valor: T) => void
  let rejeitar!: (erro: unknown) => void
  const promessa = new Promise<T>((res, rej) => {
    resolver = res
    rejeitar = rej
  })
  return { promessa, resolver, rejeitar }
}

function HarnessReceita({ onOpenChange }: { onOpenChange: (open: boolean) => void }) {
  const { receitas } = useLancamentos()
  return (
    <>
      <LancamentoModal tipo="receita" onOpenChange={onOpenChange} />
      <div data-testid="total-receitas">{receitas.length}</div>
    </>
  )
}

function HarnessLancamentos() {
  const { receitas, despesas } = useLancamentos()
  return <ListaLancamentos receitas={receitas} despesas={despesas} />
}

function preencherReceita(descricao = 'Freelance', valor = '10000') {
  fireEvent.change(screen.getByLabelText('Data de entrada'), { target: { value: '2026-10-20' } })
  fireEvent.change(screen.getByLabelText('Descrição'), { target: { value: descricao } })
  fireEvent.change(screen.getByLabelText('Valor'), { target: { value: valor } })
}

describe('fluxos assincronos — submit com feedback', () => {
  it('mostra estado de envio e desabilita o botao durante o submit (rede lenta)', async () => {
    const { promessa, resolver } = promessaControlada<LancamentoResposta[]>()
    const cliente = {
      ...criarClienteLancamentosTeste(),
      postIdempotente: vi.fn(() => promessa),
    } as unknown as ApiClient
    const onOpenChange = vi.fn()
    renderWithProviders(<HarnessReceita onOpenChange={onOpenChange} />, {
      clienteLancamentos: cliente,
    })

    preencherReceita()
    fireEvent.click(screen.getByRole('button', { name: 'Registrar receita' }))

    const botaoEnviando = await screen.findByRole('button', { name: 'Registrando...' })
    expect(botaoEnviando).toBeDisabled()

    await act(async () => {
      resolver([
        {
          id: 'r-novo', tipo: 'receita', descricao: 'Freelance', valor: 10000,
          dataEmissao: '2026-10-20', vencimento: null, paga: false,
          parcelamentoId: null, parcelaAtual: null, totalParcelas: null,
        },
      ])
    })

    await waitFor(() => expect(screen.getByTestId('total-receitas')).toHaveTextContent('4'))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('nao duplica o lancamento quando o usuario clica duas vezes durante a rede lenta', async () => {
    const postIdempotente = vi.fn(() => new Promise<LancamentoResposta[]>(() => {}))
    const cliente = {
      ...criarClienteLancamentosTeste(),
      postIdempotente,
    } as unknown as ApiClient
    renderWithProviders(<HarnessReceita onOpenChange={() => {}} />, {
      clienteLancamentos: cliente,
    })

    preencherReceita()
    const botao = screen.getByRole('button', { name: 'Registrar receita' })
    fireEvent.click(botao)
    await waitFor(() => expect(screen.getByRole('button', { name: 'Registrando...' })).toBeDisabled())
    fireEvent.click(screen.getByRole('button', { name: 'Registrando...' }))

    expect(postIdempotente).toHaveBeenCalledTimes(1)
  })

  it('falha da API volta o botao ao normal, mostra o erro e preserva o que foi digitado', async () => {
    const cliente = {
      ...criarClienteLancamentosTeste(),
      postIdempotente: vi.fn().mockRejectedValue(new ApiError(500, 'Falha ao registrar')),
    } as unknown as ApiClient
    renderWithProviders(<HarnessReceita onOpenChange={() => {}} />, {
      clienteLancamentos: cliente,
    })

    preencherReceita('Freelance')

    fireEvent.click(screen.getByRole('button', { name: 'Registrar receita' }))

    expect(await screen.findByText('Falha ao registrar')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Registrar receita' })).toBeEnabled()
    expect((screen.getByLabelText('Descrição') as HTMLInputElement).value).toBe('Freelance')
  })
})

describe('fluxos assincronos — optimistic com rollback', () => {
  it('marca como paga na hora e reverte se a API falhar', async () => {
    const { promessa, rejeitar } = promessaControlada<LancamentoResposta>()
    const cliente = {
      ...criarClienteLancamentosTeste(),
      patch: vi.fn(() => promessa),
    } as unknown as ApiClient
    renderWithProviders(<HarnessLancamentos />, { clienteLancamentos: cliente })

    fireEvent.click(
      await screen.findByRole('button', { name: /marcar "Fatura cartão de crédito" como paga/ }),
    )

    await screen.findByText('Deseja marcar como paga?')
    fireEvent.click(screen.getByRole('button', { name: 'Marcar como paga' }))

    // A lista reflete "Pago" antes da resposta da Function; o dialogo mostra o progresso.
    expect(await screen.findByText('Pago')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Marcando...' })).toBeDisabled()

    await act(async () => {
      rejeitar(new ApiError(500, 'Falha ao pagar'))
    })

    expect(await screen.findByText('Falha ao pagar')).toBeInTheDocument()
    expect(screen.queryByText('Pago')).not.toBeInTheDocument()

    // Fecha o dialogo: a despesa voltou a ficar pendente na lista.
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(
      await screen.findByRole('button', { name: /marcar "Fatura cartão de crédito" como paga/ }),
    ).toBeInTheDocument()
  })

  it('exclui a caixinha na hora e devolve o card com aviso se a API falhar', async () => {
    const { promessa, rejeitar } = promessaControlada<void>()
    const cliente = {
      ...criarClienteCaixinhasTeste([
        { id: 'c1', nome: 'Viagem', valorGuardado: 0, meta: 600000 },
      ]),
      delete: vi.fn(() => promessa),
    } as unknown as ApiClient
    renderWithProviders(<TelaCaixinhas />, { clienteCaixinhas: cliente })

    await screen.findByText('Viagem')
    fireEvent.click(screen.getByRole('button', { name: 'Excluir caixinha Viagem' }))
    await screen.findByRole('heading', { name: 'Excluir caixinha?' })
    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }))

    await waitFor(() => expect(screen.queryByText('Viagem')).not.toBeInTheDocument())

    await act(async () => {
      rejeitar(new ApiError(500, 'Falha ao excluir'))
    })

    expect(await screen.findByText('Viagem')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('Falha ao excluir')
  })
})

describe('fluxos assincronos — movimento reduzido', () => {
  it('desliga animacoes quando o usuario pede movimento reduzido', () => {
    const css = readFileSync(resolve(process.cwd(), 'src/index.css'), 'utf8')
    expect(css).toContain('@media (prefers-reduced-motion: reduce)')
    expect(css).toContain('animation-duration: 0.01ms !important')
  })
})
