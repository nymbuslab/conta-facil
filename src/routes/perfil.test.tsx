import { fireEvent, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderRoute } from '@/test/render-route'

describe('BottomNav montado no root', () => {
  it('aparece na rota /perfil tambem, nao so na /, e nao mostra Perfil no nav', async () => {
    const { getByText, queryByText } = renderRoute('/perfil')
    await waitFor(() => {
      expect(getByText('Perfil', { selector: 'h1' })).toBeInTheDocument()
      expect(getByText('Início')).toBeInTheDocument()
      expect(getByText('Extrato')).toBeInTheDocument()
      expect(getByText('Parcelas')).toBeInTheDocument()
      expect(getByText('Caixinhas')).toBeInTheDocument()
      expect(getByText('Mais')).toBeInTheDocument()
    })
    expect(queryByText('Perfil', { selector: 'a' })).not.toBeInTheDocument()
  })

  it('clicar no item Parcelas navega para a rota /parcelas', async () => {
    const { getByText, findByText } = renderRoute('/')
    await waitFor(() => expect(getByText('Ana Souza')).toBeInTheDocument())

    fireEvent.click(getByText('Parcelas'))

    expect(await findByText('Parcelas', { selector: 'h1' })).toBeInTheDocument()
  })
})

describe('rota /perfil — dados autenticados', () => {
  it('mostra o nome e o e-mail do usuario autenticado', async () => {
    const { getByText } = renderRoute('/perfil')
    await waitFor(() => {
      expect(getByText('Ana Souza')).toBeInTheDocument()
      expect(getByText('ana@exemplo.com')).toBeInTheDocument()
      expect(() => getByText('Alex Pereira')).toThrow()
    })
  })

  it('nao renderiza nenhum campo de formulario editavel', async () => {
    const { container, getByText } = renderRoute('/perfil')
    await waitFor(() => expect(getByText('Ana Souza')).toBeInTheDocument())

    expect(container.querySelector('input')).toBeNull()
    expect(container.querySelector('button[type="submit"]')).toBeNull()
  })

  it('mostra a acao de sair da conta', async () => {
    const { getByText } = renderRoute('/perfil')
    await waitFor(() => expect(getByText('Ana Souza')).toBeInTheDocument())

    expect(getByText('Sair da conta')).toBeInTheDocument()
  })
})
