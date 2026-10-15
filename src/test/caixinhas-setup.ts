import pg from 'pg'

import app from '../functions/api/index.ts'
import { confirmarIdentidadeConexao, garantirBranchDeTeste } from './guardar-branch-teste.ts'

garantirBranchDeTeste()

const authBaseUrl = process.env.NEON_AUTH_BASE_URL
const databaseUrl = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL

if (!authBaseUrl || !databaseUrl) throw new Error('Variaveis de Auth ou Postgres ausentes')
await confirmarIdentidadeConexao({ databaseUrl })

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
  const criarCaixinha = (token: string, nome: string) => app.request('/caixinhas', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ nome, meta: 100000 }),
  })
  const criada = await criarCaixinha(usuarioA.token, 'Reserva idempotente A')
  const caixinha = (await criada.json()) as { id?: string }
  if (criada.status !== 201 || !caixinha.id) throw new Error('Falha ao criar caixinha real')

  const criadaB = await criarCaixinha(usuarioB.token, 'Reserva idempotente B')
  const caixinhaB = (await criadaB.json()) as { id?: string }
  if (criadaB.status !== 201 || !caixinhaB.id) throw new Error('Falha ao criar caixinha do segundo usuario')

  const chaveDeposito = crypto.randomUUID()
  const movimentar = (
    token: string,
    id: string,
    acao: 'depositar' | 'resgatar',
    valor: number,
    chave: string,
  ) => app.request(`/caixinhas/${id}/${acao}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': chave,
    },
    body: JSON.stringify({ valor }),
  })

  const [deposito, depositoConcorrente] = await Promise.all([
    movimentar(usuarioA.token, caixinha.id, 'depositar', 50000, chaveDeposito),
    movimentar(usuarioA.token, caixinha.id, 'depositar', 50000, chaveDeposito),
  ])
  const [aposDeposito, replayDeposito] = await Promise.all([
    deposito.json() as Promise<{ valorGuardado?: number }>,
    depositoConcorrente.json() as Promise<{ valorGuardado?: number }>,
  ])
  if (deposito.status !== 200 || depositoConcorrente.status !== 200
    || aposDeposito.valorGuardado !== 50000 || replayDeposito.valorGuardado !== 50000) {
    throw new Error('Deposito concorrente nao preservou um unico efeito')
  }

  const conflito = await movimentar(usuarioA.token, caixinha.id, 'depositar', 1, chaveDeposito)
  if (conflito.status !== 409) throw new Error('Deposito com chave e payload divergentes nao retornou 409')

  const chaveResgate = crypto.randomUUID()
  const [resgate, resgateConcorrente] = await Promise.all([
    movimentar(usuarioA.token, caixinha.id, 'resgatar', 20000, chaveResgate),
    movimentar(usuarioA.token, caixinha.id, 'resgatar', 20000, chaveResgate),
  ])
  const [aposResgate, replayResgate] = await Promise.all([
    resgate.json() as Promise<{ valorGuardado?: number }>,
    resgateConcorrente.json() as Promise<{ valorGuardado?: number }>,
  ])
  if (resgate.status !== 200 || resgateConcorrente.status !== 200
    || aposResgate.valorGuardado !== 30000 || replayResgate.valorGuardado !== 30000) {
    throw new Error('Resgate concorrente nao preservou um unico efeito')
  }

  const chaveFalha = crypto.randomUUID()
  const resgateInvalido = await movimentar(usuarioA.token, caixinha.id, 'resgatar', 30001, chaveFalha)
  if (resgateInvalido.status !== 400) throw new Error('Resgate acima do saldo nao retornou 400')
  const reutilizacaoAposFalha = await movimentar(usuarioA.token, caixinha.id, 'resgatar', 10000, chaveFalha)
  if (reutilizacaoAposFalha.status !== 200) throw new Error('Falha de negocio reservou a chave indevidamente')

  const mesmaChaveOutroUsuario = await movimentar(
    usuarioB.token, caixinhaB.id, 'depositar', 50000, chaveDeposito,
  )
  if (mesmaChaveOutroUsuario.status !== 200) throw new Error('A chave nao ficou isolada por usuario')

  const { rows } = await pool.query<{ valor_guardado: number }>(
    'select valor_guardado from caixinhas where id = $1 and user_id = $2',
    [caixinha.id, usuarioA.id],
  )
  if (rows[0]?.valor_guardado !== 20000) throw new Error('Movimentacoes idempotentes deixaram saldo incorreto')

  const registros = await pool.query<{ total: string }>(
    'select count(*)::text as total from idempotencias where user_id = any($1::uuid[])',
    [[usuarioA.id, usuarioB.id]],
  )
  if (Number(registros.rows[0]?.total) !== 4) {
    throw new Error('Quantidade de registros idempotentes divergiu do esperado')
  }

  console.log('Caixinhas reais provaram replay concorrente, rollback e isolamento por usuario')

  // origem-deposito-caixinha: deposito "de_fora" real cria lancamento de receita e movimentacao
  // vinculados, e o replay da chave nao duplica nenhum dos dois.
  const movimentarComOrigem = (
    token: string,
    id: string,
    valor: number,
    origem: 'saldo_atual' | 'de_fora',
    chave: string,
  ) => app.request(`/caixinhas/${id}/depositar`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': chave,
    },
    body: JSON.stringify({ valor, origem }),
  })

  const chaveDeFora = crypto.randomUUID()
  const [depositoDeFora, replayDeFora] = await Promise.all([
    movimentarComOrigem(usuarioA.token, caixinha.id, 70000, 'de_fora', chaveDeFora),
    movimentarComOrigem(usuarioA.token, caixinha.id, 70000, 'de_fora', chaveDeFora),
  ])
  if (depositoDeFora.status !== 200 || replayDeFora.status !== 200) {
    throw new Error('Deposito de_fora ou seu replay nao retornaram 200')
  }
  const [aposDeFora, aposReplayDeFora] = await Promise.all([
    depositoDeFora.json() as Promise<{ valorGuardado?: number }>,
    replayDeFora.json() as Promise<{ valorGuardado?: number }>,
  ])
  if (aposDeFora.valorGuardado !== 90000 || aposReplayDeFora.valorGuardado !== 90000) {
    throw new Error('Deposito de_fora nao somou 70000 ao valorGuardado de forma idempotente')
  }

  const lancamentosReceita = await pool.query<{ valor: number; tipo: string }>(
    'select valor, tipo from lancamentos where user_id = $1 and descricao = $2',
    [usuarioA.id, 'Depósito em caixinha'],
  )
  if (lancamentosReceita.rowCount !== 1
    || lancamentosReceita.rows[0]?.tipo !== 'receita'
    || lancamentosReceita.rows[0]?.valor !== 70000) {
    throw new Error('Replay do deposito de_fora duplicou ou nao criou o lancamento de receita vinculado')
  }

  const movimentacoesDeFora = await pool.query<{ tipo: string; origem: string | null; lancamento_id: string | null }>(
    'select tipo, origem, lancamento_id from caixinha_movimentacoes where caixinha_id = $1 and origem = $2',
    [caixinha.id, 'de_fora'],
  )
  if (movimentacoesDeFora.rowCount !== 1
    || movimentacoesDeFora.rows[0]?.tipo !== 'deposito'
    || !movimentacoesDeFora.rows[0]?.lancamento_id) {
    throw new Error('Replay do deposito de_fora duplicou ou nao vinculou a movimentacao ao lancamento')
  }

  console.log('Caixinhas reais provaram deposito de_fora com lancamento vinculado e replay sem duplicacao')
} finally {
  await pool.query('delete from caixinha_movimentacoes where user_id = any($1::uuid[])', [
    [usuarioA.id, usuarioB.id],
  ])
  await pool.query('delete from lancamentos where user_id = any($1::uuid[])', [
    [usuarioA.id, usuarioB.id],
  ])
  await pool.query('delete from idempotencias where user_id = any($1::uuid[])', [
    [usuarioA.id, usuarioB.id],
  ])
  await pool.query('delete from caixinhas where user_id = any($1::uuid[])', [
    [usuarioA.id, usuarioB.id],
  ])
  await pool.end()
}
