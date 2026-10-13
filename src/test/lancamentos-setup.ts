import pg from 'pg'
import { isDeepStrictEqual } from 'node:util'

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
  const chave = crypto.randomUUID()
  const corpo = JSON.stringify({
    tipo: 'despesa',
    descricao: 'Despesa idempotente de integração',
    valor: 100000,
    vencimento: '2026-10-20',
    parcelado: true,
    quantidadeParcelas: 3,
  })
  const criar = (token: string, body = corpo) => app.request('/lancamentos', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': chave,
    },
    body,
  })

  const [primeira, concorrente] = await Promise.all([
    criar(usuarioA.token),
    criar(usuarioA.token),
  ])
  const [corpoPrimeira, corpoConcorrente] = await Promise.all([
    primeira.json(),
    concorrente.json(),
  ])
  if (primeira.status !== 201 || concorrente.status !== 201) {
    throw new Error(`POST /lancamentos concorrente retornou ${primeira.status}/${concorrente.status}`)
  }
  if (!isDeepStrictEqual(corpoPrimeira, corpoConcorrente)) {
    throw new Error('Replay concorrente nao preservou o lote original')
  }

  const conflito = await criar(usuarioA.token, JSON.stringify({
    tipo: 'receita', descricao: 'Payload diferente', valor: 1, dataEmissao: '2026-10-11',
  }))
  if (conflito.status !== 409) throw new Error('Reuso da chave com outro payload nao retornou 409')

  const mesmaChaveOutroUsuario = await criar(usuarioB.token)
  if (mesmaChaveOutroUsuario.status !== 201) {
    throw new Error('A mesma chave nao ficou isolada por usuario')
  }

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

  const contagens = await pool.query<{ user_id: string; total: string }>(
    `select user_id, count(*)::text as total
       from lancamentos
      where user_id = any($1::uuid[]) and descricao = $2
      group by user_id`,
    [[usuarioA.id, usuarioB.id], 'Despesa idempotente de integração'],
  )
  const porUsuario = new Map(contagens.rows.map((item) => [item.user_id, Number(item.total)]))
  if (porUsuario.get(usuarioA.id) !== 3 || porUsuario.get(usuarioB.id) !== 3) {
    throw new Error('Lote idempotente nao preservou exatamente tres parcelas por usuario')
  }

  console.log('Lancamentos reais provaram replay concorrente, conflito e isolamento por usuario')
} finally {
  await pool.query('delete from idempotencias where user_id = any($1::uuid[])', [
    [usuarioA.id, usuarioB.id],
  ])
  await pool.query('delete from lancamentos where user_id = any($1::uuid[])', [
    [usuarioA.id, usuarioB.id],
  ])
  await pool.end()
}
