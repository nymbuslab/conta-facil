import type { MiddlewareHandler } from 'hono'
import { createRemoteJWKSet, jwtVerify } from 'jose'

export type VariaveisAuth = {
  userId: string
}

type PayloadVerificado = {
  sub?: string
}

type OpcoesAuthMiddleware = {
  verificarToken?: (token: string) => Promise<PayloadVerificado>
}

class ConfiguracaoAuthAusente extends Error {}

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null
let jwksUrlAtual: string | null = null

async function verificarTokenNeon(token: string): Promise<PayloadVerificado> {
  const jwksUrl = process.env.NEON_AUTH_JWKS_URL
  const authBaseUrl = process.env.NEON_AUTH_BASE_URL

  if (!jwksUrl || !authBaseUrl) {
    throw new ConfiguracaoAuthAusente('Variaveis do Neon Auth nao configuradas')
  }

  if (!jwks || jwksUrlAtual !== jwksUrl) {
    jwks = createRemoteJWKSet(new URL(jwksUrl))
    jwksUrlAtual = jwksUrl
  }

  const issuer = new URL(authBaseUrl).origin
  const { payload } = await jwtVerify(token, jwks, { issuer })
  return payload
}

export function criarAuthMiddleware(
  opcoes: OpcoesAuthMiddleware = {},
): MiddlewareHandler<{ Variables: VariaveisAuth }> {
  const verificarToken = opcoes.verificarToken ?? verificarTokenNeon

  return async (contexto, next) => {
    const authorization = contexto.req.header('Authorization')
    const correspondencia = authorization?.match(/^Bearer\s+(.+)$/i)

    if (!correspondencia) {
      return contexto.json({ erro: 'Não autorizado' }, 401)
    }

    let userId: string
    try {
      const payload = await verificarToken(correspondencia[1])
      if (!payload.sub) return contexto.json({ erro: 'Não autorizado' }, 401)
      userId = payload.sub
    } catch (falha) {
      if (falha instanceof ConfiguracaoAuthAusente) {
        return contexto.json({ erro: 'Servico de autenticacao mal configurado' }, 500)
      }
      return contexto.json({ erro: 'Não autorizado' }, 401)
    }

    contexto.set('userId', userId)
    await next()
  }
}

export const authMiddleware = criarAuthMiddleware()
