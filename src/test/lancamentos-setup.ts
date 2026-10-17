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
    return (await resposta.json()) as Array<{ id: string; parcelamentoId: string | null }>
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

  // --- PATCH e DELETE /lancamentos/:id (editar-excluir-lancamentos) ---
  const editar = (token: string, id: string, chave: string, corpoJson: Record<string, unknown>) =>
    app.request(`/lancamentos/${id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'Idempotency-Key': chave },
      body: JSON.stringify(corpoJson),
    })
  const excluir = (token: string, id: string, chave: string, alcance?: 'futuras') =>
    app.request(`/lancamentos/${id}${alcance ? `?alcance=${alcance}` : ''}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}`, 'Idempotency-Key': chave },
    })

  // Parcelamento de 4, nenhuma paga: edita a 3a com alcance 'futuras' e prova que o filtro e
  // por INDICE da parcela (>= atual), nao por status de pago — as duas anteriores (1 e 2, nao
  // pagas) ficam de fora mesmo sendo igualmente nao pagas (achado da auditoria F5, T-02.03).
  const parcelasEdicao = await criarSemIdempotencia(usuarioA.token, {
    tipo: 'despesa', descricao: 'Parcelamento edicao', valor: 100, vencimento: emDias(5),
    parcelado: true, quantidadeParcelas: 4,
  })
  if (parcelasEdicao.length !== 4) throw new Error('Fixture de parcelamento para editar nao criou 4 parcelas')
  const respostaEdicao = await editar(
    usuarioA.token, parcelasEdicao[2].id,
    '10101010-1010-4101-8101-101010101010',
    { tipo: 'despesa', descricao: 'Parcelamento editado', valor: 150, vencimento: emDias(5), alcance: 'futuras' },
  )
  if (respostaEdicao.status !== 200) throw new Error(`PATCH com alcance futuras retornou ${respostaEdicao.status}`)
  const linhasPosEdicao = await pool.query<{ id: string; descricao: string; valor: number }>(
    'select id, descricao, valor from lancamentos where parcelamento_id = $1 order by parcela_atual',
    [parcelasEdicao[0].parcelamentoId ?? parcelasEdicao[0].id],
  )
  const [p1, p2, p3, p4] = linhasPosEdicao.rows
  if (p1.descricao !== 'Parcelamento edicao' || p2.descricao !== 'Parcelamento edicao') {
    throw new Error('Editar com alcance futuras alterou parcela anterior a atual')
  }
  if (p3.descricao !== 'Parcelamento editado' || p4.descricao !== 'Parcelamento editado') {
    throw new Error('Editar com alcance futuras nao propagou para a atual e as seguintes')
  }
  if (Number(p3.valor) !== 150 || Number(p4.valor) !== 150) {
    throw new Error('Editar com alcance futuras nao propagou o valor novo')
  }
  console.log('PATCH com alcance futuras provou filtro por indice de parcela, nao por status de pago')

  // Exclui a parcela do MEIO (nao a ultima) de um grupo de 3, com alcance 'somente' — prova que
  // totalParcelas e corrigido mesmo quando a excluida nao e a ultima do grupo (achado da
  // auditoria F5, T-02.05).
  const parcelasExclusao = await criarSemIdempotencia(usuarioA.token, {
    tipo: 'despesa', descricao: 'Parcelamento exclusao', valor: 200, vencimento: emDias(6),
    parcelado: true, quantidadeParcelas: 3,
  })
  if (parcelasExclusao.length !== 3) throw new Error('Fixture de parcelamento para excluir nao criou 3 parcelas')
  const respostaExclusao = await excluir(
    usuarioA.token, parcelasExclusao[1].id, '20202020-2020-4202-8202-202020202020',
  )
  if (respostaExclusao.status !== 200) throw new Error(`DELETE da parcela do meio retornou ${respostaExclusao.status}`)
  const restantesExclusao = await pool.query<{ id: string; total_parcelas: number }>(
    'select id, total_parcelas from lancamentos where parcelamento_id = $1',
    [parcelasExclusao[0].parcelamentoId ?? parcelasExclusao[0].id],
  )
  if (restantesExclusao.rows.length !== 2) throw new Error('Excluir a parcela do meio nao removeu exatamente uma linha')
  if (restantesExclusao.rows.some((linha) => Number(linha.total_parcelas) !== 2)) {
    throw new Error('Excluir a parcela do meio nao corrigiu totalParcelas das remanescentes para 2')
  }
  console.log('DELETE de parcela do meio provou a correcao de totalParcelas nas remanescentes')

  // Isolamento entre usuarios: usuarioB tentando editar/excluir um lancamento de usuarioA leva
  // a 404 (buscarPorId filtra por userId), nunca expondo nem alterando o dado de outra conta
  // (achado da auditoria F5, T-02.01).
  const respostaEdicaoCruzada = await editar(
    usuarioB.token, parcelasEdicao[0].id, '30303030-3030-4303-8303-303030303030',
    { tipo: 'despesa', descricao: 'Tentativa indevida', valor: 1, vencimento: emDias(5) },
  )
  if (respostaEdicaoCruzada.status !== 404) {
    throw new Error(`PATCH entre usuarios deveria devolver 404, devolveu ${respostaEdicaoCruzada.status}`)
  }
  const respostaExclusaoCruzada = await excluir(usuarioB.token, parcelasEdicao[0].id, '40404040-4040-4404-8404-404040404040')
  if (respostaExclusaoCruzada.status !== 404) {
    throw new Error(`DELETE entre usuarios deveria devolver 404, devolveu ${respostaExclusaoCruzada.status}`)
  }
  console.log('PATCH/DELETE entre usuarios provaram isolamento por userId (404, nunca vazamento)')

  // Bloqueio de receita vinculada a uma caixinha: insere diretamente a linha de vinculo (sem
  // depender da rota de caixinhas) e confirma que editar/excluir recusam com 409.
  const [receitaVinculo] = await criarSemIdempotencia(usuarioA.token, {
    tipo: 'receita', descricao: 'Receita de caixinha (integracao)', valor: 5000, dataEmissao: emDias(0),
  })
  await pool.query(
    `insert into caixinha_movimentacoes (user_id, caixinha_id, tipo, origem, valor, lancamento_id)
     values ($1, gen_random_uuid(), 'deposito', 'de_fora', $2, $3)`,
    [usuarioA.id, 5000, receitaVinculo.id],
  )
  try {
    const respostaEdicaoVinculo = await editar(
      usuarioA.token, receitaVinculo.id, '50505050-5050-4505-8505-505050505050',
      { tipo: 'receita', descricao: 'Tentativa indevida', valor: 1, dataEmissao: emDias(0) },
    )
    if (respostaEdicaoVinculo.status !== 409) {
      throw new Error(`PATCH de receita vinculada a caixinha deveria devolver 409, devolveu ${respostaEdicaoVinculo.status}`)
    }
    const respostaExclusaoVinculo = await excluir(usuarioA.token, receitaVinculo.id, '60606060-6060-4606-8606-606060606060')
    if (respostaExclusaoVinculo.status !== 409) {
      throw new Error(`DELETE de receita vinculada a caixinha deveria devolver 409, devolveu ${respostaExclusaoVinculo.status}`)
    }
    console.log('PATCH/DELETE de receita vinculada a caixinha provaram o bloqueio 409 (D-04)')
  } finally {
    await pool.query('delete from caixinha_movimentacoes where lancamento_id = $1', [receitaVinculo.id])
  }
} finally {
  await pool.query('delete from idempotencias where user_id = any($1::uuid[])', [
    [usuarioA.id, usuarioB.id],
  ])
  await pool.query('delete from lancamentos where user_id = any($1::uuid[])', [
    [usuarioA.id, usuarioB.id],
  ])
  await pool.end()
}
