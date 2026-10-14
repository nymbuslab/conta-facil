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

export class ConfiguracaoAuthAusente extends Error {}

/** Codigos do `jose` que indicam que o proprio token/JWT e invalido, expirado, usa um
 * algoritmo nao permitido pela JWKS ou nao corresponde a nenhuma chave dela — o cliente
 * precisa se reautenticar (401). `ERR_JOSE_ALG_NOT_ALLOWED`/`ERR_JOSE_NOT_SUPPORTED` cobrem
 * um token com `alg` incompativel com as chaves do Neon Auth (ex.: HS256 contra JWKS so
 * assimetrica) — sem isso, esse caso caia no 503 generico de servico indisponivel, como se
 * o problema fosse nosso em vez do token. */
const CODIGOS_TOKEN_INVALIDO =
  /^ERR_(JWT|JWS)|^ERR_JWKS_(NO_MATCHING_KEY|MULTIPLE_MATCHING_KEYS)|^ERR_JOSE_(ALG_NOT_ALLOWED|NOT_SUPPORTED)/

/** Diferencia "token invalido" (401) de indisponibilidade do servico de autenticacao
 * (JWKS fora do ar, erro de rede) — a segunda e transitoria e nao deve ser tratada como
 * sessao encerrada. */
function ehTokenInvalido(falha: unknown) {
  const codigo = (falha as { code?: unknown } | null)?.code
  return typeof codigo === 'string' && CODIGOS_TOKEN_INVALIDO.test(codigo)
}

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
  // O Neon Auth emite `aud` igual ao proprio endpoint (mesmo valor do `issuer`); validar os
  // dois impede que um JWT emitido por outra instancia do Neon Auth, mas que por algum motivo
  // compartilhasse a mesma JWKS, seja aceito aqui.
  const { payload } = await jwtVerify(token, jwks, { issuer, audience: issuer })
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
      if (ehTokenInvalido(falha)) {
        return contexto.json({ erro: 'Não autorizado' }, 401)
      }
      return contexto.json({ erro: 'Servico de autenticacao indisponivel' }, 503)
    }

    contexto.set('userId', userId)
    await next()
  }
}

export const authMiddleware = criarAuthMiddleware()
