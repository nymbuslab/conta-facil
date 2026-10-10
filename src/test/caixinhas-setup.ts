import pg from 'pg'

import app from '../functions/api/index.ts'
import { garantirBranchDeTeste } from './guardar-branch-teste.ts'

garantirBranchDeTeste()

const authBaseUrl = process.env.NEON_AUTH_BASE_URL
const databaseUrl = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL

if (!authBaseUrl || !databaseUrl) throw new Error('Variaveis de Auth ou Postgres ausentes')

async function criarUsuario(sufixo: string) {
  const respostaCadastro = await fetch(`${authBaseUrl}/sign-up/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:5173' },
    body: JSON.stringify({
      name: `Teste ${sufixo}`,
      email: `caixinhas-${sufixo}-${Date.now()}@example.test`,
      password: `Teste-${Date.now()}-${sufixo}-A1!`,
    }),
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
  const criada = await app.request('/caixinhas', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${usuarioA.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ nome: 'Reserva de teste', meta: 50000 }),
  })
  const caixinha = (await criada.json()) as { id?: string }
  if (criada.status !== 201 || !caixinha.id) throw new Error('Falha ao criar caixinha real')

  const deposito = await app.request(`/caixinhas/${caixinha.id}/depositar`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${usuarioA.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ valor: 10000 }),
  })
  const aposDeposito = (await deposito.json()) as { valorGuardado?: number }
  if (aposDeposito.valorGuardado !== 10000) throw new Error('Deposito nao somou em centavos')

  const resgate = await app.request(`/caixinhas/${caixinha.id}/resgatar`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${usuarioA.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ valor: 10001 }),
  })
  if (resgate.status !== 400) throw new Error('Resgate acima do saldo nao retornou 400')

  const acessoCruzado = await app.request(`/caixinhas/${caixinha.id}/depositar`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${usuarioB.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ valor: 1 }),
  })
  if (acessoCruzado.status !== 404) throw new Error('Outro usuario operou a caixinha')

  const { rows } = await pool.query<{ valor_guardado: number }>(
    'select valor_guardado from caixinhas where id = $1 and user_id = $2',
    [caixinha.id, usuarioA.id],
  )
  if (rows[0]?.valor_guardado !== 10000) throw new Error('Resgate invalido alterou o saldo')

  console.log('Caixinha real preservou saldo e isolamento entre usuarios')
} finally {
  await pool.query('delete from caixinhas where user_id = any($1::uuid[])', [
    [usuarioA.id, usuarioB.id],
  ])
  await pool.end()
}
