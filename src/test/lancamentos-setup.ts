import pg from 'pg'

import app from '../functions/api/index.ts'
import { garantirBranchDeTeste } from './guardar-branch-teste.ts'

garantirBranchDeTeste()

const authBaseUrl = process.env.NEON_AUTH_BASE_URL
const databaseUrl = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL

if (!authBaseUrl || !databaseUrl) {
  throw new Error('Variaveis de Auth ou Postgres ausentes')
}

async function criarUsuario(sufixo: string) {
  const email = `lancamentos-${sufixo}-${Date.now()}@example.test`
  const password = `Teste-${Date.now()}-${sufixo}-A1!`
  const respostaCadastro = await fetch(`${authBaseUrl}/sign-up/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:5173' },
    body: JSON.stringify({ name: `Teste ${sufixo}`, email, password }),
  })
  const cadastro = (await respostaCadastro.json()) as { user?: { id?: string } }
  const cookie = respostaCadastro.headers
    .getSetCookie()
    .map((item) => item.split(';', 1)[0])
    .join('; ')
  const respostaToken = await fetch(`${authBaseUrl}/token`, {
    headers: { Cookie: cookie, Origin: 'http://localhost:5173' },
  })
  const token = (await respostaToken.json()) as { token?: string }

  if (!cadastro.user?.id || !token.token) throw new Error('Falha ao preparar usuario de teste')
  return { id: cadastro.user.id, token: token.token }
}

const [usuarioA, usuarioB] = await Promise.all([criarUsuario('a'), criarUsuario('b')])
const pool = new pg.Pool({ connectionString: databaseUrl })

try {
  const criada = await app.request('/lancamentos', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${usuarioA.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tipo: 'despesa',
      descricao: 'Despesa de integração',
      valor: 12990,
      vencimento: '2026-10-20',
    }),
  })
  if (criada.status !== 201) throw new Error(`POST /lancamentos retornou ${criada.status}`)

  const [listaA, listaB] = await Promise.all([
    app.request('/lancamentos', {
      headers: { Authorization: `Bearer ${usuarioA.token}` },
    }),
    app.request('/lancamentos', {
      headers: { Authorization: `Bearer ${usuarioB.token}` },
    }),
  ])
  const dadosA = (await listaA.json()) as Array<{ userId?: string }>
  const dadosB = (await listaB.json()) as Array<{ userId?: string }>

  if (!dadosA.some((item) => item.userId === usuarioA.id)) {
    throw new Error('Usuario criador nao recebeu o proprio lancamento')
  }
  if (dadosB.some((item) => item.userId === usuarioA.id)) {
    throw new Error('Lancamento vazou para outro usuario')
  }

  console.log('Lancamentos reais isolados entre dois usuarios na branch de teste')
} finally {
  await pool.query('delete from lancamentos where user_id = any($1::uuid[])', [
    [usuarioA.id, usuarioB.id],
  ])
  await pool.end()
}
