import { and, eq, sql } from 'drizzle-orm'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import pg from 'pg'

import * as schema from '../db/schema.ts'
import { caixinhas } from '../db/schema.ts'
import { criarExecutorIdempotencia } from '../functions/api/idempotencia.ts'
import { confirmarIdentidadeConexao, garantirBranchDeTeste } from './guardar-branch-teste.ts'

garantirBranchDeTeste()

const databaseUrl = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL
if (!databaseUrl) throw new Error('DATABASE_URL_UNPOOLED ou DATABASE_URL precisa estar definida')

const userId = '44444444-4444-4444-8444-444444444444'
const caixinhaId = '55555555-5555-4555-8555-555555555555'
const chaveConcorrente = '66666666-6666-4666-8666-666666666666'
const chaveRollback = '77777777-7777-4777-8777-777777777777'
const pool = new pg.Pool({ connectionString: databaseUrl })
await confirmarIdentidadeConexao({ pool })
const eventos: Array<Record<string, unknown>> = []
const executar = criarExecutorIdempotencia(undefined, (evento) => eventos.push(evento))

async function limpar() {
  await pool.query('delete from idempotencias where user_id = $1', [userId])
  await pool.query('delete from caixinhas where id = $1', [caixinhaId])
}

try {
  await limpar()
  await pool.query(
    `insert into caixinhas (id, user_id, nome, valor_guardado, meta)
     values ($1, $2, 'Integração idempotência', 0, 100000)`,
    [caixinhaId, userId],
  )

  const entrada = {
    userId,
    chave: chaveConcorrente,
    operacao: 'caixinhas.depositar',
    payload: { id: caixinhaId, valor: 50000 },
  }
  const mutacao = async (transacao: unknown) => {
    const banco = transacao as NodePgDatabase<typeof schema>
    const [atualizada] = await banco.update(caixinhas)
      .set({ valorGuardado: sql`${caixinhas.valorGuardado} + 50000` })
      .where(and(eq(caixinhas.id, caixinhaId), eq(caixinhas.userId, userId)))
      .returning({ valorGuardado: caixinhas.valorGuardado })
    return { status: 200, corpo: atualizada }
  }

  const respostas = await Promise.all([executar(entrada, mutacao), executar(entrada, mutacao)])
  if (JSON.stringify(respostas[0]).replace('executada', 'replay') !== JSON.stringify(respostas[1])) {
    throw new Error('Concorrencia nao devolveu status e corpo equivalentes')
  }
  const saldoConcorrente = await pool.query<{ valor_guardado: number }>(
    'select valor_guardado from caixinhas where id = $1', [caixinhaId],
  )
  if (saldoConcorrente.rows[0]?.valor_guardado !== 50000) {
    throw new Error('Concorrencia produziu mais de um efeito financeiro')
  }

  const entradaRollback = { ...entrada, chave: chaveRollback, payload: { id: caixinhaId, valor: 10000 } }
  try {
    await executar(entradaRollback, async (transacao) => {
      const banco = transacao as NodePgDatabase<typeof schema>
      await banco.update(caixinhas)
        .set({ valorGuardado: sql`${caixinhas.valorGuardado} + 10000` })
        .where(eq(caixinhas.id, caixinhaId))
      throw new Error('falha provocada depois do efeito')
    })
  } catch (erro) {
    if (!(erro instanceof Error) || !erro.message.includes('falha provocada')) throw erro
  }

  const aposFalha = await pool.query<{ valor_guardado: number; chaves: string }>(
    `select c.valor_guardado,
       (select count(*)::text from idempotencias i where i.user_id = $2 and i.chave = $3) as chaves
     from caixinhas c where c.id = $1`,
    [caixinhaId, userId, chaveRollback],
  )
  if (aposFalha.rows[0]?.valor_guardado !== 50000 || aposFalha.rows[0]?.chaves !== '0') {
    throw new Error('Rollback nao removeu efeito e registro de idempotencia')
  }

  const repetidaComSucesso = await executar(entradaRollback, async (transacao) => {
    const banco = transacao as NodePgDatabase<typeof schema>
    const [atualizada] = await banco.update(caixinhas)
      .set({ valorGuardado: sql`${caixinhas.valorGuardado} + 10000` })
      .where(eq(caixinhas.id, caixinhaId))
      .returning({ valorGuardado: caixinhas.valorGuardado })
    return { status: 200, corpo: atualizada }
  })
  if (repetidaComSucesso.tipo !== 'executada') throw new Error('Chave com rollback nao foi reutilizavel')

  if (eventos.some((evento) => Object.keys(evento).some((chave) =>
    !['evento', 'operacao', 'resultado', 'replay'].includes(chave)))) {
    throw new Error('Log de idempotencia contem metadado nao permitido')
  }

  console.log('Idempotencia concorrente e rollback confirmados no Postgres de teste')
} finally {
  await limpar()
  await pool.end()
}
