import pg from 'pg'
import { renderHook, waitFor } from '@testing-library/react'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import app from '@/functions/api/index'
import { criarApiClient, type ApiClient } from '@/lib/api-client'

import { confirmarIdentidadeConexao, garantirBranchDeTeste } from '../test/guardar-branch-teste'
import { AuthProvider, type ClienteAuth } from './auth-context'
import { LancamentosProvider, useLancamentos } from './lancamentos-context'

if (process.env.NEON_AUTH_BASE_URL) garantirBranchDeTeste()

const authBaseUrl = process.env.NEON_AUTH_BASE_URL
const databaseUrl = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL

let userId = ''
let cliente: ApiClient
let clienteAuth: ClienteAuth

beforeAll(async () => {
  if (!authBaseUrl || !databaseUrl) return
  await confirmarIdentidadeConexao({ databaseUrl })

  const email = `provider-lancamentos-${Date.now()}@example.test`
  const respostaCadastro = await fetch(`${authBaseUrl}/sign-up/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:5173' },
    body: JSON.stringify({ name: 'Teste Provider', email, password: `Teste-${Date.now()}-A1!` }),
  })
  const cadastro = await respostaCadastro.json() as { user?: { id?: string } }
  const cookie = respostaCadastro.headers.getSetCookie().map((item) => item.split(';', 1)[0]).join('; ')
  const respostaToken = await fetch(`${authBaseUrl}/token`, {
    headers: { Cookie: cookie, Origin: 'http://localhost:5173' },
  })
  const token = await respostaToken.json() as { token?: string }
  if (!cadastro.user?.id || !token.token) throw new Error('Falha ao criar sessao de integracao')
  userId = cadastro.user.id

  cliente = criarApiClient({
    baseUrl: 'http://function.local',
    obterToken: async () => token.token ?? null,
    fetcher: async (entrada, init) => app.fetch(new Request(entrada, init)),
  })
  clienteAuth = {
    useSession: () => ({
      data: { user: { id: userId, name: 'Teste Provider', email }, session: {} },
      error: null,
      isPending: false,
    }),
    signIn: { email: async () => ({ error: null }) },
    signUp: { email: async () => ({ error: null }) },
    signOut: async () => ({ error: null }),
    token: async () => ({ data: { token: token.token } }),
    requestPasswordReset: async () => ({ error: null }),
    resetPassword: async () => ({ error: null }),
  }

  await cliente.post('/lancamentos', {
    tipo: 'receita', descricao: 'Receita persistida', valor: 98765, dataEmissao: '2026-10-10',
  })
})

afterAll(async () => {
  if (!databaseUrl || !userId) return
  const pool = new pg.Pool({ connectionString: databaseUrl })
  await pool.query('delete from lancamentos where user_id = $1', [userId])
  await pool.end()
})

describe.skipIf(!authBaseUrl || !databaseUrl)('LancamentosProvider com a Function real', () => {
  it('carrega os lancamentos persistidos do usuario autenticado', async () => {
    const { result } = renderHook(() => useLancamentos(), {
      wrapper: ({ children }) => (
        <AuthProvider cliente={clienteAuth}>
          <LancamentosProvider cliente={cliente}>{children}</LancamentosProvider>
        </AuthProvider>
      ),
    })

    await waitFor(() => expect(result.current.carregando).toBe(false))
    expect(result.current.receitas).toEqual([
      expect.objectContaining({ descricao: 'Receita persistida', valor: 987.65 }),
    ])
  })
})
