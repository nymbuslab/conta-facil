/** Monta o conteudo de `_headers` (padrao Cloudflare Pages) para o build de producao do
 * frontend. A CSP precisa do connect-src apontando para a Function real — varia por ambiente
 * (producao/preview), por isso o arquivo e gerado no build (vite.config.ts) em vez de ficar
 * estatico em public/. O Auth passou a ser acessado via proxy same-origin (functions/auth/),
 * entao `'self'` ja cobre: `authBaseUrl` continua obrigatorio como guard de env var ausente no
 * build (createAuthClient tambem depende dela), mas nao entra mais no array do connect-src. */
export function montarCabecalhosProducao({ functionBaseUrl, authBaseUrl }) {
  if (!functionBaseUrl) throw new Error('functionBaseUrl ausente ao montar _headers de produção')
  if (!authBaseUrl) throw new Error('authBaseUrl ausente ao montar _headers de produção')

  const origemFunction = new URL(functionBaseUrl).origin

  const csp = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data:",
    `connect-src 'self' ${origemFunction}`,
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
