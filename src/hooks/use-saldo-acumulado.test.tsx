import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { CaixinhasProvider, useCaixinhas } from '@/state/caixinhas-context'
import { AuthProvider } from '@/state/auth-context'
import { LancamentosProvider, useLancamentos } from '@/state/lancamentos-context'
import {
  criarClienteCaixinhasTeste,
  criarClienteLancamentosTeste,
  criarEstadoLancamentosTeste,
} from '@/test/api-client-mocks'
import { criarClienteAuthTeste } from '@/test/test-utils'

import { useSaldoAcumulado } from './use-saldo-acumulado'

/** Monta CaixinhasProvider e LancamentosProvider compartilhando o mesmo estado fake de
 * lancamentos: um deposito "de_fora" na caixinha entra nesse estado, e useLancamentos()
 * enxerga a receita nova ao recarregar, sem os dois contextos se conhecerem de verdade. */
function criarWrapperComLancamentosCompartilhados() {
  const estadoLancamentos = criarEstadoLancamentosTeste([])
  const clienteCaixinhas = criarClienteCaixinhasTeste([], { lancamentosEstado: estadoLancamentos })
  const clienteLancamentos = criarClienteLancamentosTeste([], estadoLancamentos)

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <AuthProvider cliente={criarClienteAuthTeste()}>
        <LancamentosProvider cliente={clienteLancamentos}>
          <CaixinhasProvider cliente={clienteCaixinhas}>{children}</CaixinhasProvider>
        </LancamentosProvider>
      </AuthProvider>
    )
  }

  return Wrapper
}

describe('useSaldoAcumulado', () => {
  it('combina os totais de Receita e Despesa com o totalGuardado das Caixinhas', async () => {
    const Wrapper = criarWrapperComLancamentosCompartilhados()
    const { result } = renderHook(
      () => ({
        saldo: useSaldoAcumulado(6450, 3119.5),
        caixinhas: useCaixinhas(),
        lancamentos: useLancamentos(),
      }),
      { wrapper: Wrapper },
    )

    // useSaldoAcumulado e useCaixinhas leem o mesmo totalGuardado no mesmo render; o Wrapper
    // tambem monta useLancamentos para provar que os dois providers coexistem sem conflito.
    expect(result.current.saldo.totalGuardado).toBe(result.current.caixinhas.totalGuardado)
    await waitFor(() => expect(result.current.lancamentos.carregando).toBe(false))

    expect(result.current.saldo.saldoAcumulado).toBe(3330.5)

    await act(async () => {
      await result.current.caixinhas.criarCaixinha({ nome: 'Viagem', meta: '1.000,00' })
    })
    const caixinha = result.current.caixinhas.caixinhas[0]

    await act(async () => {
      await result.current.caixinhas.depositar(caixinha.id, { valor: '500,00', origem: 'saldo_atual' })
    })

    await waitFor(() => expect(result.current.saldo.saldoAcumulado).toBe(2830.5))
  })

  it('deposito de_fora tem efeito liquido zero no saldo, porque a receita vinculada compensa o totalGuardado', async () => {
    const Wrapper = criarWrapperComLancamentosCompartilhados()
    const { result } = renderHook(
      () => {
        const lancamentos = useLancamentos()
        return {
          saldo: useSaldoAcumulado(lancamentos.saldoReceita, lancamentos.saldoDespesa),
          caixinhas: useCaixinhas(),
          lancamentos,
        }
      },
      { wrapper: Wrapper },
    )

    await waitFor(() => expect(result.current.lancamentos.carregando).toBe(false))
    const saldoAntes = result.current.saldo.saldoAcumulado

    await act(async () => {
      await result.current.caixinhas.criarCaixinha({ nome: 'Viagem', meta: '1.000,00' })
    })
    const caixinha = result.current.caixinhas.caixinhas[0]

    await act(async () => {
      await result.current.caixinhas.depositar(caixinha.id, { valor: '500,00', origem: 'de_fora' })
    })
    await act(async () => {
      await result.current.lancamentos.recarregar()
    })

    await waitFor(() => expect(result.current.saldo.saldoAcumulado).toBe(saldoAntes))
    expect(result.current.caixinhas.totalGuardado).toBe(500)
    expect(result.current.saldo.saldoReceita).toBeGreaterThan(0)
  })
})
