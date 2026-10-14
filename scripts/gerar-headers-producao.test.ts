import { describe, expect, it } from 'vitest'

import { montarCabecalhosProducao } from './gerar-headers-producao.mjs'

describe('montarCabecalhosProducao', () => {
  const opcoes = {
    functionBaseUrl: 'https://minha-function.neon.tech/api',
    authBaseUrl: 'https://meu-auth.neonauth.neon.tech/auth',
  }

  it('inclui os cabecalhos basicos de seguranca', () => {
    const conteudo = montarCabecalhosProducao(opcoes)
    expect(conteudo).toContain('Strict-Transport-Security: max-age=31536000; includeSubDomains')
    expect(conteudo).toContain('X-Frame-Options: DENY')
    expect(conteudo).toContain('X-Content-Type-Options: nosniff')
    expect(conteudo).toContain('Referrer-Policy: strict-origin-when-cross-origin')
  })

  it('o connect-src da CSP usa so a origem (sem o caminho) da Function e do Auth', () => {
    const conteudo = montarCabecalhosProducao(opcoes)
    expect(conteudo).toContain(
      "connect-src 'self' https://minha-function.neon.tech https://meu-auth.neonauth.neon.tech",
    )
    expect(conteudo).not.toContain('/api')
    expect(conteudo).not.toContain('/auth')
  })

  it('permite fonte do Google Fonts e nenhuma outra origem de estilo/script', () => {
    const conteudo = montarCabecalhosProducao(opcoes)
    expect(conteudo).toContain("style-src 'self' https://fonts.googleapis.com")
    expect(conteudo).toContain("font-src 'self' https://fonts.gstatic.com")
    expect(conteudo).toContain("script-src 'self'")
  })

  it('lanca erro se a URL da Function ou do Auth estiver ausente', () => {
    expect(() => montarCabecalhosProducao({ authBaseUrl: opcoes.authBaseUrl })).toThrow()
    expect(() => montarCabecalhosProducao({ functionBaseUrl: opcoes.functionBaseUrl })).toThrow()
  })
})
