import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { authMiddleware, type VariaveisAuth } from './auth-middleware.ts'
import { rotasCaixinhas } from './caixinhas.ts'
import { rotasLancamentos } from './lancamentos.ts'

const app = new Hono<{ Variables: VariaveisAuth }>()

const origensPermitidas = (process.env.FUNCTION_ALLOWED_ORIGINS ?? 'http://localhost:5173')
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean)

app.use(
  '*',
  cors({
    origin: (origin) => (origensPermitidas.includes(origin) ? origin : undefined),
    allowHeaders: ['Authorization', 'Content-Type', 'Idempotency-Key'],
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  }),
)
app.get('/health', (contexto) => contexto.json({ ok: true }))
app.use('*', authMiddleware)
app.route('/lancamentos', rotasLancamentos)
app.route('/caixinhas', rotasCaixinhas)

export default app
