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
      and table_name in ('lancamentos', 'caixinhas')
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

  console.log('Schema de lancamentos e caixinhas confirmado na branch de teste')
} finally {
  await pool.end()
}
