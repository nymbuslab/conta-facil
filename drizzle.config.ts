import { defineConfig } from 'drizzle-kit'

const databaseUrl = process.env.DATABASE_URL_UNPOOLED

if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL_UNPOOLED precisa estar definida para migrations (conexao pooled nao suporta DDL/controle de migration)',
  )
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: databaseUrl,
  },
})
