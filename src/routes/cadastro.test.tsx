import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { AnchorHTMLAttributes } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const cadastrar = vi.fn()
const navegar = vi.fn()

vi.mock('@/state/auth-context', () => ({
  useAuth: () => ({ cadastrar }),
}))

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const original = await importOriginal<typeof import('@tanstack/react-router')>()

  return {
    ...original,
    Link: ({ children, to, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
    useNavigate: () => navegar,
  }
})

import { TelaCadastro } from './cadastro'

function preencherFormulario(email = 'ana@exemplo.com') {
  fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Ana Souza' } })
  fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: email } })
  fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'segredo123' } })
  fireEvent.change(screen.getByLabelText('Confirmar senha'), {
    target: { value: 'segredo123' },
  })
}

describe('TelaCadastro', () => {
  beforeEach(() => {
    cadastrar.mockReset()
    navegar.mockReset()
  })

  it('cadastra os dados validos e redireciona para o Inicio', async () => {
    cadastrar.mockResolvedValue(undefined)
    render(<TelaCadastro />)
    preencherFormulario()

    fireEvent.click(screen.getByRole('button', { name: 'Criar conta' }))

    await waitFor(() => {
      expect(cadastrar).toHaveBeenCalledWith(
        'Ana Souza',
        'ana@exemplo.com',
        'segredo123',
      )
      expect(navegar).toHaveBeenCalledWith({ to: '/' })
    })
  })

  it('explica quando o e-mail ja esta cadastrado sem quebrar a tela', async () => {
    cadastrar.mockRejectedValue(new Error('User already exists'))
    render(<TelaCadastro />)
    preencherFormulario('existente@exemplo.com')

    fireEvent.click(screen.getByRole('button', { name: 'Criar conta' }))

    expect(
      await screen.findByText('Este e-mail já está cadastrado. Entre na sua conta para continuar.'),
    ).toBeInTheDocument()
    expect(navegar).not.toHaveBeenCalled()
  })

  it('nao envia quando a confirmacao da senha e diferente', async () => {
    render(<TelaCadastro />)
    preencherFormulario()
    fireEvent.change(screen.getByLabelText('Confirmar senha'), {
      target: { value: 'outra-senha' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Criar conta' }))

    expect(await screen.findByText('As senhas precisam ser iguais')).toBeInTheDocument()
    expect(cadastrar).not.toHaveBeenCalled()
  })
})
