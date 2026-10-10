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
