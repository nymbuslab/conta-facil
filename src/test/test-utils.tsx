import { render, type RenderOptions } from '@testing-library/react'
import type { ReactElement } from 'react'

import type { ApiClient } from '@/lib/api-client'
import { CaixinhasProvider } from '@/state/caixinhas-context'
import { LancamentosProvider } from '@/state/lancamentos-context'
import { AuthProvider, type ClienteAuth } from '@/state/auth-context'
import { criarClienteCaixinhasTeste, criarClienteLancamentosTeste } from '@/test/api-client-mocks'

type UsuarioTeste = {
  id: string
  nome: string
  email: string
}

export const usuarioTestePadrao: UsuarioTeste = {
  id: 'usuario-teste-1',
  nome: 'Ana Souza',
  email: 'ana@exemplo.com',
}

export function criarClienteAuthTeste(usuario: UsuarioTeste | null = usuarioTestePadrao): ClienteAuth {
  return {
    useSession: () => ({
      data: usuario
        ? {
            user: { id: usuario.id, name: usuario.nome, email: usuario.email },
            session: { id: 'sessao-teste-1' },
          }
        : null,
      error: null,
      isPending: false,
    }),
    signIn: { email: async () => ({ data: {}, error: null }) },
    signUp: { email: async () => ({ data: {}, error: null }) },
    signOut: async () => ({ data: {}, error: null }),
    token: async () => ({ data: { token: 'token-teste' } }),
    requestPasswordReset: async () => ({ data: {}, error: null }),
    resetPassword: async () => ({ data: {}, error: null }),
  }
}

/** Cliente cuja verificacao de sessao falha (ex.: JWKS fora do ar), mas com um refetch
 * controlavel para testar o "Tentar novamente". */
export function criarClienteAuthErro(refetch: () => unknown = () => {}): ClienteAuth {
  return {
    useSession: () => ({
      data: null,
      error: { message: 'Nao foi possivel verificar a sessao' },
      isPending: false,
      refetch,
    }),
    signIn: { email: async () => ({ data: {}, error: null }) },
    signUp: { email: async () => ({ data: {}, error: null }) },
    signOut: async () => ({ data: {}, error: null }),
    token: async () => null,
    requestPasswordReset: async () => ({ data: {}, error: null }),
    resetPassword: async () => ({ data: {}, error: null }),
  }
}

type OpcoesRender = RenderOptions & {
  clienteLancamentos?: ApiClient
  clienteCaixinhas?: ApiClient
}

export function renderWithProviders(ui: ReactElement, options: OpcoesRender = {}) {
  const { clienteLancamentos, clienteCaixinhas, ...renderOptions } = options
  return render(
    <AuthProvider cliente={criarClienteAuthTeste()}>
      <LancamentosProvider cliente={clienteLancamentos ?? criarClienteLancamentosTeste()}>
        <CaixinhasProvider cliente={clienteCaixinhas ?? criarClienteCaixinhasTeste()}>{ui}</CaixinhasProvider>
      </LancamentosProvider>
    </AuthProvider>,
    renderOptions,
  )
}

export * from '@testing-library/react'
