import { attachDatabasePool } from '@neon/functions'
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres'
import pg from 'pg'

import * as schema from '../../db/schema.ts'

let banco: NodePgDatabase<typeof schema> | null = null

export function obterBanco() {
  if (banco) return banco

  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) throw new Error('DATABASE_URL nao definida')

  const pool = new pg.Pool({ connectionString: databaseUrl, max: 5 })
  attachDatabasePool(pool)
  banco = drizzle(pool, { schema })
  return banco
}
