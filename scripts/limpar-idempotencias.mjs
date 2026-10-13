import { fileURLToPath } from 'node:url'
import pg from 'pg'

export const DIAS_RETENCAO_PADRAO = 90

export async function limparIdempotenciasExpiradas(pool, diasRetencao = DIAS_RETENCAO_PADRAO) {
  if (!Number.isFinite(diasRetencao) || diasRetencao <= 0) {
    throw new Error(`diasRetencao precisa ser um numero positivo, recebido: ${diasRetencao}`)
  }

  const { rowCount } = await pool.query(
    "delete from idempotencias where criado_em < now() - ($1 || ' days')::interval",
    [diasRetencao],
  )
  return { removidos: rowCount ?? 0 }
}

async function executarCli() {
  const databaseUrl = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL
  if (!databaseUrl) throw new Error('DATABASE_URL_UNPOOLED ou DATABASE_URL precisa estar definida')

  const diasRetencao = process.argv.includes('--dias')
    ? Number(process.argv[process.argv.indexOf('--dias') + 1])
    : DIAS_RETENCAO_PADRAO

  const pool = new pg.Pool({ connectionString: databaseUrl })
  try {
    const { removidos } = await limparIdempotenciasExpiradas(pool, diasRetencao)
    console.log(`Registros de idempotencia com mais de ${diasRetencao} dias removidos: ${removidos}`)
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
