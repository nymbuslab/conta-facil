import { describe, expect, it } from 'vitest'

import app from './index.ts'

describe('cabecalhos de seguranca', () => {
  it('rota publica responde com HSTS, X-Frame-Options, X-Content-Type-Options, CSP e Referrer-Policy', async () => {
    const resposta = await app.request('/health')

    expect(resposta.headers.get('strict-transport-security')).toMatch(/max-age=\d+/)
    expect(resposta.headers.get('x-frame-options')).toBeTruthy()
    expect(resposta.headers.get('x-content-type-options')).toBe('nosniff')
    expect(resposta.headers.get('content-security-policy')).toBeTruthy()
    expect(resposta.headers.get('referrer-policy')).toBeTruthy()
  })

  it('rota autenticada sem token tambem responde com os cabecalhos de seguranca', async () => {
    const resposta = await app.request('/lancamentos')

    expect(resposta.status).toBe(401)
    expect(resposta.headers.get('strict-transport-security')).toMatch(/max-age=\d+/)
    expect(resposta.headers.get('content-security-policy')).toBeTruthy()
  })
})
