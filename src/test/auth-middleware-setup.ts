import { Hono } from 'hono'

import {
  authMiddleware,
  type VariaveisAuth,
} from '../functions/api/auth-middleware.ts'
import { confirmarIdentidadeConexao, garantirBranchDeTeste } from './guardar-branch-teste.ts'

garantirBranchDeTeste()

const authBaseUrl = process.env.NEON_AUTH_BASE_URL

if (!authBaseUrl || !process.env.NEON_AUTH_JWKS_URL) {
  throw new Error('Variaveis do Neon Auth ausentes')
}

await confirmarIdentidadeConexao()

const email = `middleware-${Date.now()}@example.test`
const password = `Teste-${Date.now()}-A1!`
const respostaCadastro = await fetch(`${authBaseUrl}/sign-up/email`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:5173' },
  body: JSON.stringify({ name: 'Teste Middleware', email, password }),
})
const cadastro = (await respostaCadastro.json()) as { user?: { id?: string } }

if (!respostaCadastro.ok || !cadastro.user?.id) {
  throw new Error(`Nao foi possivel cadastrar usuario de teste (status ${respostaCadastro.status})`)
}

const cookie = respostaCadastro.headers
  .getSetCookie()
  .map((item) => item.split(';', 1)[0])
  .join('; ')
const respostaToken = await fetch(`${authBaseUrl}/token`, {
  headers: { Cookie: cookie, Origin: 'http://localhost:5173' },
})
const resultadoToken = (await respostaToken.json()) as { token?: string }

if (!respostaToken.ok || !resultadoToken.token) {
  throw new Error(`Nao foi possivel emitir JWT de teste (status ${respostaToken.status})`)
}

const app = new Hono<{ Variables: VariaveisAuth }>()
app.use('/protegida', authMiddleware)
app.get('/protegida', (contexto) => contexto.json({ userId: contexto.get('userId') }))

const semToken = await app.request('/protegida')
if (semToken.status !== 401) throw new Error('Rota sem token nao retornou 401')

const comToken = await app.request('/protegida', {
  headers: { Authorization: `Bearer ${resultadoToken.token}` },
})
const corpo = (await comToken.json()) as { userId?: string }

if (comToken.status !== 200 || corpo.userId !== cadastro.user.id) {
  throw new Error(`JWT valido nao populou o userId esperado (status ${comToken.status})`)
}

console.log('Middleware validou JWT real e propagou o sub como userId')
