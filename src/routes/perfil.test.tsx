import { fireEvent, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderRoute } from '@/test/render-route'
import { perfilMock } from '@/lib/perfil-mock'

describe('BottomNav montado no root', () => {
  it('aparece na rota /perfil tambem, nao so na /', async () => {
    const { getByText } = renderRoute('/perfil')
    await waitFor(() => {
      expect(getByText('Perfil', { selector: 'h1' })).toBeInTheDocument()
      expect(getByText('Início')).toBeInTheDocument()
      expect(getByText('Parcelas')).toBeInTheDocument()
    })
  })

  it('clicar no item Parcelas navega para a rota /parcelas', async () => {
    const { getByText, findByText } = renderRoute('/')
    await waitFor(() => expect(getByText(perfilMock.nome)).toBeInTheDocument())

    fireEvent.click(getByText('Parcelas'))

    expect(await findByText('Parcelas', { selector: 'h1' })).toBeInTheDocument()
  })
})

describe('rota /perfil — dados ficticios', () => {
  it('mostra o nome e o email ficticios definidos em perfil-mock', async () => {
    const { getByText } = renderRoute('/perfil')
    await waitFor(() => {
      expect(getByText(perfilMock.nome)).toBeInTheDocument()
      expect(getByText(perfilMock.email)).toBeInTheDocument()
    })
  })

  it('nao renderiza nenhum campo de formulario editavel', async () => {
    const { container, getByText } = renderRoute('/perfil')
    await waitFor(() => expect(getByText(perfilMock.nome)).toBeInTheDocument())

    expect(container.querySelector('input')).toBeNull()
    expect(container.querySelector('button[type="submit"]')).toBeNull()
  })
})
