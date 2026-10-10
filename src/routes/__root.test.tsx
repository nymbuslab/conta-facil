import { waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderRoute } from '@/test/render-route'

describe('rota raiz', () => {
  it('nao lanca o erro de contexto ausente ao renderizar a rota /', async () => {
    const { getByText } = renderRoute('/')
    await waitFor(() => expect(getByText('Ana Souza')).toBeInTheDocument())
  })

  it('useLancamentos funciona dentro da rota / e retorna o saldoReceita mockado', async () => {
    const { getByText } = renderRoute('/')
    await waitFor(() => expect(getByText('R$ 6.450,00')).toBeInTheDocument())
  })

  it('redireciona para /login quando nao existe sessao', async () => {
    const { findByRole, router } = renderRoute('/', { usuario: null })

    expect(await findByRole('heading', { name: 'Entre na sua conta' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/login')
  })

  it('nao mostra a navegacao principal na rota publica', async () => {
    const { findByRole, queryByRole } = renderRoute('/login', { usuario: null })

    expect(await findByRole('heading', { name: 'Entre na sua conta' })).toBeInTheDocument()
    expect(queryByRole('navigation')).not.toBeInTheDocument()
  })
})
