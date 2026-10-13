import { pathToFileURL } from 'node:url'
import { Pool } from 'pg'

import { confirmarIdentidadeConexao, garantirBranchDeTeste } from './guardar-branch-teste.ts'

const MENSAGEM_DATABASE_URL_AUSENTE =
  'DATABASE_URL da branch Neon de teste nao definida. Rode: neon env pull --branch test --file .env.test.local -e DATABASE_URL'

export function getTestDb() {
  garantirBranchDeTeste()
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error(MENSAGEM_DATABASE_URL_AUSENTE)
  }

  return new Pool({
    connectionString,
    max: 1,
  })
}

async function verificarConexao() {
  const db = getTestDb()

  try {
    await confirmarIdentidadeConexao({ pool: db })
    const resultado = await db.query<{ valor: number }>('select 1 as valor')

    if (resultado.rows[0]?.valor !== 1) {
      throw new Error('SELECT 1 nao retornou o valor esperado')
    }

    console.log('Integracao Neon OK: SELECT 1 retornou uma linha na branch test.')
  } finally {
    await db.end()
  }
}

const executadoDiretamente =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href

if (executadoDiretamente) {
  await verificarConexao()
}
