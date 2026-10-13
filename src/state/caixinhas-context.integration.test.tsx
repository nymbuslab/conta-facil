import pg from 'pg'
import { renderHook, waitFor } from '@testing-library/react'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import app from '@/functions/api/index'
import { criarApiClient, type ApiClient } from '@/lib/api-client'

import { confirmarIdentidadeConexao, garantirBranchDeTeste } from '../test/guardar-branch-teste'
import { AuthProvider, type ClienteAuth } from './auth-context'
import { CaixinhasProvider, useCaixinhas } from './caixinhas-context'

if (process.env.NEON_AUTH_BASE_URL) garantirBranchDeTeste()

const authBaseUrl = process.env.NEON_AUTH_BASE_URL
const databaseUrl = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL

let userId = ''
let cliente: ApiClient
let clienteAuth: ClienteAuth

beforeAll(async () => {
  if (!authBaseUrl || !databaseUrl) return
  await confirmarIdentidadeConexao({ databaseUrl })

  const email = `provider-caixinhas-${Date.now()}@example.test`
  const respostaCadastro = await fetch(`${authBaseUrl}/sign-up/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:5173' },
    body: JSON.stringify({ name: 'Teste Caixinhas', email, password: `Teste-${Date.now()}-A1!` }),
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
      data: { user: { id: userId, name: 'Teste Caixinhas', email }, session: {} },
      error: null,
      isPending: false,
    }),
    signIn: { email: async () => ({ error: null }) },
    signUp: { email: async () => ({ error: null }) },
    signOut: async () => ({ error: null }),
    token: async () => ({ data: { token: token.token } }),
  }

  await cliente.post('/caixinhas', { nome: 'Reserva persistida', meta: 500000 })
})

afterAll(async () => {
  if (!databaseUrl || !userId) return
  const pool = new pg.Pool({ connectionString: databaseUrl })
  await pool.query('delete from caixinhas where user_id = $1', [userId])
  await pool.end()
})

describe.skipIf(!authBaseUrl || !databaseUrl)('CaixinhasProvider com a Function real', () => {
  it('carrega as caixinhas persistidas do usuario autenticado', async () => {
    const { result } = renderHook(() => useCaixinhas(), {
      wrapper: ({ children }) => (
        <AuthProvider cliente={clienteAuth}>
          <CaixinhasProvider cliente={cliente}>{children}</CaixinhasProvider>
        </AuthProvider>
      ),
    })

    await waitFor(() => expect(result.current.carregando).toBe(false))
    expect(result.current.caixinhas).toEqual([
      expect.objectContaining({ nome: 'Reserva persistida', meta: 5000 }),
    ])
  })
})
