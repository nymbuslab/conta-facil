import app from '../functions/api/index.ts'
import { criarApiClient } from '../lib/api-client.ts'
import { garantirBranchDeTeste } from './guardar-branch-teste.ts'

garantirBranchDeTeste()

const authBaseUrl = process.env.NEON_AUTH_BASE_URL

if (!authBaseUrl) throw new Error('Variavel NEON_AUTH_BASE_URL ausente')

const email = `api-client-${Date.now()}@example.test`
const password = `Teste-${Date.now()}-A1!`
const respostaCadastro = await fetch(`${authBaseUrl}/sign-up/email`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:5173' },
  body: JSON.stringify({ name: 'Teste API Client', email, password }),
})
const cookie = respostaCadastro.headers
  .getSetCookie()
  .map((item) => item.split(';', 1)[0])
  .join('; ')
const respostaToken = await fetch(`${authBaseUrl}/token`, {
  headers: { Cookie: cookie, Origin: 'http://localhost:5173' },
})
const resultadoToken = (await respostaToken.json()) as { token?: string }

if (!respostaCadastro.ok || !resultadoToken.token) {
  throw new Error('Nao foi possivel preparar a sessao de integracao')
}

const cliente = criarApiClient({
  baseUrl: 'http://function.local',
  obterToken: async () => resultadoToken.token ?? null,
  fetcher: async (entrada, init) => app.fetch(new Request(entrada, init)),
})

const lancamentos = await cliente.get<unknown[]>('/lancamentos')

if (!Array.isArray(lancamentos)) {
  throw new Error('A Function autenticada nao retornou uma lista de lancamentos')
}

console.log('apiClient chamou a Function local com JWT real e recebeu 200')
