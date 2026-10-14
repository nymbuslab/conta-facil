/** Monta o conteudo de `_headers` (padrao Cloudflare Pages) para o build de producao do
 * frontend. A CSP precisa do connect-src apontando para a Function e o Neon Auth reais —
 * esses dois variam por ambiente (producao/preview), por isso o arquivo e gerado no build
 * (vite.config.ts) em vez de ficar estatico em public/. */
export function montarCabecalhosProducao({ functionBaseUrl, authBaseUrl }) {
  if (!functionBaseUrl) throw new Error('functionBaseUrl ausente ao montar _headers de produção')
  if (!authBaseUrl) throw new Error('authBaseUrl ausente ao montar _headers de produção')

  const origemFunction = new URL(functionBaseUrl).origin
  const origemAuth = new URL(authBaseUrl).origin

  const csp = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data:",
    `connect-src 'self' ${origemFunction} ${origemAuth}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')

  return `/*
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Content-Security-Policy: ${csp}
`
}
