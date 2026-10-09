import { waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { perfilMock } from '@/lib/perfil-mock'
import { renderRoute } from '@/test/render-route'

describe('rota raiz', () => {
  it('nao lanca o erro de contexto ausente ao renderizar a rota /', async () => {
    const { getByText } = renderRoute('/')
    await waitFor(() => expect(getByText(perfilMock.nome)).toBeInTheDocument())
  })

  it('useLancamentos funciona dentro da rota / e retorna o saldoReceita mockado', async () => {
    const { getByText } = renderRoute('/')
    await waitFor(() => expect(getByText('R$ 6.450,00')).toBeInTheDocument())
  })
})
