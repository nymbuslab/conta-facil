import pg from 'pg'

import { garantirBranchDeTeste } from './guardar-branch-teste.ts'

garantirBranchDeTeste()

const databaseUrl = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL_UNPOOLED ou DATABASE_URL precisa estar definida')
}

const esperadas = new Map([
  [
    'lancamentos',
    new Map([
      ['id', 'uuid'],
      ['user_id', 'uuid'],
      ['valor', 'integer'],
      ['parcelamento_id', 'uuid'],
    ]),
  ],
  [
    'caixinhas',
    new Map([
      ['id', 'uuid'],
      ['user_id', 'uuid'],
      ['valor_guardado', 'integer'],
      ['meta', 'integer'],
    ]),
  ],
  [
    'idempotencias',
    new Map([
      ['id', 'uuid'],
      ['user_id', 'uuid'],
      ['chave', 'uuid'],
      ['operacao', 'text'],
      ['hash_requisicao', 'text'],
      ['status_resposta', 'integer'],
      ['corpo_resposta', 'jsonb'],
    ]),
  ],
])

const pool = new pg.Pool({ connectionString: databaseUrl })

try {
  const resultado = await pool.query<{
    table_name: string
    column_name: string
    data_type: string
    is_nullable: 'YES' | 'NO'
  }>(`
    select table_name, column_name, data_type, is_nullable
    from information_schema.columns
    where table_schema = 'public'
      and table_name in ('lancamentos', 'caixinhas', 'idempotencias')
  `)

  for (const [tabela, colunas] of esperadas) {
    for (const [coluna, tipo] of colunas) {
      const encontrada = resultado.rows.find(
        (item) => item.table_name === tabela && item.column_name === coluna,
      )

      if (!encontrada) throw new Error(`Coluna ausente: ${tabela}.${coluna}`)
      if (encontrada.data_type !== tipo) {
        throw new Error(`Tipo incorreto em ${tabela}.${coluna}: ${encontrada.data_type}`)
      }
      if (coluna !== 'parcelamento_id' && encontrada.is_nullable !== 'NO') {
        throw new Error(`Coluna deveria ser obrigatoria: ${tabela}.${coluna}`)
      }
    }
  }

  const usuarioA = '11111111-1111-4111-8111-111111111111'
  const usuarioB = '22222222-2222-4222-8222-222222222222'
  const chave = '33333333-3333-4333-8333-333333333333'
  await pool.query('delete from idempotencias where user_id = any($1::uuid[])', [[usuarioA, usuarioB]])
  await pool.query(
    `insert into idempotencias (user_id, chave, operacao, hash_requisicao, status_resposta, corpo_resposta)
     values ($1, $2, 'teste', 'hash-a', 200, '{}'), ($3, $2, 'teste', 'hash-b', 200, '{}')`,
    [usuarioA, chave, usuarioB],
  )
  await expectRejeicaoDuplicada(pool, usuarioA, chave)
  await pool.query('delete from idempotencias where user_id = any($1::uuid[])', [[usuarioA, usuarioB]])

  console.log('Schema financeiro e unicidade de idempotencia confirmados na branch de teste')
} finally {
  await pool.end()
}

async function expectRejeicaoDuplicada(pool: pg.Pool, userId: string, chave: string) {
  try {
    await pool.query(
      `insert into idempotencias (user_id, chave, operacao, hash_requisicao, status_resposta, corpo_resposta)
       values ($1, $2, 'teste', 'hash-c', 200, '{}')`,
      [userId, chave],
    )
    throw new Error('Unicidade de user_id e chave nao foi aplicada')
  } catch (erro) {
    if (erro instanceof Error && erro.message === 'Unicidade de user_id e chave nao foi aplicada') throw erro
    if (!erro || typeof erro !== 'object' || !('code' in erro) || erro.code !== '23505') throw erro
  }
}
