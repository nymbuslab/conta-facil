import pg from 'pg'
import { isDeepStrictEqual } from 'node:util'

import app from '../functions/api/index.ts'
import { confirmarIdentidadeConexao, garantirBranchDeTeste } from './guardar-branch-teste.ts'

garantirBranchDeTeste()

const authBaseUrl = process.env.NEON_AUTH_BASE_URL
const databaseUrl = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL

if (!authBaseUrl || !databaseUrl) {
  throw new Error('Variaveis de Auth ou Postgres ausentes')
}
await confirmarIdentidadeConexao({ databaseUrl })

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

  const listaA = await app.request('/lancamentos', {
    headers: { Authorization: `Bearer ${usuarioA.token}` },
  })
  const listaB = await app.request('/lancamentos', {
    headers: { Authorization: `Bearer ${usuarioB.token}` },
  })
  const dadosA = (await listaA.json()) as { itens: Array<Record<string, unknown>> }
  const dadosB = (await listaB.json()) as { itens: Array<Record<string, unknown>> }

  // A listagem nunca deve expor colunas internas da tabela (a tela nao usa nenhuma delas).
  for (const [rotulo, dados] of [['A', dadosA], ['B', dadosB]] as const) {
    for (const campo of ['userId', 'criadoEm', 'atualizadoEm']) {
      if (dados.itens.some((item) => campo in item)) {
        throw new Error(`Lista do usuario ${rotulo} expos o campo interno ${campo}`)
      }
    }
  }
  if (!dadosA.itens.some((item) => item.descricao === 'Despesa idempotente de integração')) {
    throw new Error('Usuario criador nao recebeu o proprio lancamento')
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

  // --- /lancamentos/vencendo e /lancamentos/recentes (dashboard-extrato) ---
  function emDias(deslocamento: number) {
    const data = new Date()
    data.setDate(data.getDate() + deslocamento)
    return data.toISOString().slice(0, 10)
  }

  const criarSemIdempotencia = async (token: string, corpoJson: Record<string, unknown>) => {
    const resposta = await app.request('/lancamentos', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(corpoJson),
    })
    return (await resposta.json()) as Array<{ id: string }>
  }

  const [[despesaProximaA], [despesaPagaA], [despesaProximaB]] = await Promise.all([
    criarSemIdempotencia(usuarioA.token, {
      tipo: 'despesa', descricao: 'Vencendo integracao A', valor: 500, vencimento: emDias(1),
    }),
    criarSemIdempotencia(usuarioA.token, {
      tipo: 'despesa', descricao: 'Paga integracao A', valor: 700, vencimento: emDias(1),
    }),
    criarSemIdempotencia(usuarioB.token, {
      tipo: 'despesa', descricao: 'Vencendo integracao B', valor: 900, vencimento: emDias(1),
    }),
  ])
  await app.request(`/lancamentos/${despesaPagaA.id}/pagar`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${usuarioA.token}` },
  })
  await criarSemIdempotencia(usuarioA.token, {
    tipo: 'receita', descricao: 'Receita recente integracao', valor: 1234, dataEmissao: emDias(0),
  })

  const vencendoA = await app.request('/lancamentos/vencendo?dias=2', {
    headers: { Authorization: `Bearer ${usuarioA.token}` },
  })
  const dadosVencendoA = (await vencendoA.json()) as { itens: Array<Record<string, unknown>> }
  if (!dadosVencendoA.itens.some((item) => item.descricao === 'Vencendo integracao A')) {
    throw new Error('Vencendo nao trouxe a despesa nao paga dentro da janela')
  }
  if (dadosVencendoA.itens.some((item) => item.descricao === 'Paga integracao A')) {
    throw new Error('Vencendo trouxe despesa ja paga')
  }
  if (dadosVencendoA.itens.some((item) => item.descricao === 'Vencendo integracao B')) {
    throw new Error('Vencendo nao isolou por usuario')
  }
  if (despesaProximaA.id === undefined || despesaProximaB.id === undefined) {
    throw new Error('Falha ao preparar fixtures de vencendo')
  }

  const recentesA = await app.request('/lancamentos/recentes?limite=5', {
    headers: { Authorization: `Bearer ${usuarioA.token}` },
  })
  const dadosRecentesA = (await recentesA.json()) as { itens: Array<Record<string, unknown>> }
  if (dadosRecentesA.itens.length === 0 || dadosRecentesA.itens.length > 5) {
    throw new Error('Recentes nao respeitou o limite pedido')
  }
  if (!dadosRecentesA.itens.some((item) => item.tipo === 'receita')) {
    throw new Error('Recentes nao misturou receita entre os tipos')
  }
  if (!dadosRecentesA.itens.some((item) => item.descricao === 'Receita recente integracao')) {
    throw new Error('Recentes nao trouxe o lancamento mais recente de usuarioA')
  }
  if (dadosRecentesA.itens.some((item) => item.descricao === 'Vencendo integracao B')) {
    throw new Error('Recentes nao isolou por usuario')
  }

  console.log('Vencendo e recentes provaram janela de dias, exclusao de pagas, mistura de tipo e isolamento por usuario')
} finally {
  await pool.query('delete from idempotencias where user_id = any($1::uuid[])', [
    [usuarioA.id, usuarioB.id],
  ])
  await pool.query('delete from lancamentos where user_id = any($1::uuid[])', [
    [usuarioA.id, usuarioB.id],
  ])
  await pool.end()
}
