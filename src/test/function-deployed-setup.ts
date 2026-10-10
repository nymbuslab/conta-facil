import { garantirBranchDeTeste } from './guardar-branch-teste.ts'

garantirBranchDeTeste()

const authBaseUrl = process.env.NEON_AUTH_BASE_URL
const functionBaseUrl = process.env.NEON_FUNCTION_API_BASE_URL

if (!authBaseUrl || !functionBaseUrl) throw new Error('Variaveis da integracao remota ausentes')

const email = `function-remota-${Date.now()}@example.test`
const respostaCadastro = await fetch(`${authBaseUrl}/sign-up/email`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:5173' },
  body: JSON.stringify({ name: 'Teste Function Remota', email, password: `Teste-${Date.now()}-A1!` }),
})
const cookie = respostaCadastro.headers.getSetCookie().map((item) => item.split(';', 1)[0]).join('; ')
const respostaToken = await fetch(`${authBaseUrl}/token`, {
  headers: { Cookie: cookie, Origin: 'http://localhost:5173' },
})
const token = await respostaToken.json() as { token?: string }
if (!token.token) throw new Error('Nao foi possivel emitir o JWT remoto')

const resposta = await fetch(`${functionBaseUrl.replace(/\/$/, '')}/lancamentos`, {
  headers: { Authorization: `Bearer ${token.token}` },
})
const corpo = await resposta.json()

if (!resposta.ok || !Array.isArray(corpo)) {
  throw new Error(`Function implantada retornou ${resposta.status}`)
}

console.log('Function implantada na branch test respondeu 200 com JWT real')
