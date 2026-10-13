import { fileURLToPath } from 'node:url'
import pg from 'pg'

import { confirmarIdentidadeConexao, garantirBranchDeTeste } from '../src/test/guardar-branch-teste.ts'

export const PADRAO_EMAIL_TESTE = /@example\.test$/

export async function limparUsuariosDeTeste(pool, padraoEmail = PADRAO_EMAIL_TESTE) {
  const { rows } = await pool.query('select id, email from neon_auth."user"')
  const idsParaRemover = rows
    .filter((linha) => padraoEmail.test(linha.email))
    .map((linha) => linha.id)

  if (idsParaRemover.length === 0) return { removidos: 0 }

  await pool.query('delete from neon_auth."user" where id = any($1::uuid[])', [idsParaRemover])
  return { removidos: idsParaRemover.length }
}

async function executarCli() {
  garantirBranchDeTeste()
  const databaseUrl = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL
  if (!databaseUrl) throw new Error('DATABASE_URL_UNPOOLED ou DATABASE_URL precisa estar definida')
  await confirmarIdentidadeConexao({ databaseUrl })

  const pool = new pg.Pool({ connectionString: databaseUrl })
  try {
    const { removidos } = await limparUsuariosDeTeste(pool)
    console.log(`Usuarios de teste removidos (cascata limpa session/account/member): ${removidos}`)
  } finally {
    await pool.end()
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  executarCli().catch((erro) => {
    console.error(erro instanceof Error ? erro.message : erro)
    process.exitCode = 1
  })
}
