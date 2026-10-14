import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { CaixinhasProvider, useCaixinhas } from '@/state/caixinhas-context'
import { AuthProvider } from '@/state/auth-context'
import { criarClienteCaixinhasTeste } from '@/test/api-client-mocks'
import { criarClienteAuthTeste } from '@/test/test-utils'

import { useSaldoAcumulado } from './use-saldo-acumulado'

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider cliente={criarClienteAuthTeste()}>
      <CaixinhasProvider cliente={criarClienteCaixinhasTeste()}>{children}</CaixinhasProvider>
    </AuthProvider>
  )
}

describe('useSaldoAcumulado', () => {
  it('combina os totais de Receita e Despesa com o totalGuardado das Caixinhas', async () => {
    const { result } = renderHook(
      () => ({ saldo: useSaldoAcumulado(6450, 3119.5), caixinhas: useCaixinhas() }),
      { wrapper: Wrapper },
    )

    expect(result.current.saldo.saldoAcumulado).toBe(3330.5)

    await act(async () => {
      await result.current.caixinhas.criarCaixinha({ nome: 'Viagem', meta: '1.000,00' })
    })
    const caixinha = result.current.caixinhas.caixinhas[0]

    await act(async () => {
      await result.current.caixinhas.depositar(caixinha.id, { valor: '500,00' })
    })

    await waitFor(() => expect(result.current.saldo.saldoAcumulado).toBe(2830.5))
  })
})
