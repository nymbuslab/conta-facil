import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { AnchorHTMLAttributes } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const entrar = vi.fn()
const navegar = vi.fn()

vi.mock('@/state/auth-context', () => ({
  useAuth: () => ({ entrar }),
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

import { TelaLogin } from './login'

describe('TelaLogin', () => {
  beforeEach(() => {
    entrar.mockReset()
    navegar.mockReset()
  })

  it('valida o e-mail antes de tentar autenticar', async () => {
    render(<TelaLogin />)

    fireEvent.change(screen.getByLabelText('E-mail'), {
      target: { value: 'email-invalido' },
    })
    fireEvent.change(screen.getByLabelText('Senha'), {
      target: { value: 'segredo123' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByText('Informe um e-mail válido')).toBeInTheDocument()
    expect(entrar).not.toHaveBeenCalled()
  })

  it('autentica credenciais validas e redireciona para o Inicio', async () => {
    entrar.mockResolvedValue(undefined)
    render(<TelaLogin />)

    fireEvent.change(screen.getByLabelText('E-mail'), {
      target: { value: 'ana@exemplo.com' },
    })
    fireEvent.change(screen.getByLabelText('Senha'), {
      target: { value: 'segredo123' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(entrar).toHaveBeenCalledWith('ana@exemplo.com', 'segredo123')
      expect(navegar).toHaveBeenCalledWith({ to: '/' })
    })
  })

  it('mantem o usuario na tela e explica uma falha de autenticacao', async () => {
    entrar.mockRejectedValue(new Error('Credenciais invalidas'))
    render(<TelaLogin />)

    fireEvent.change(screen.getByLabelText('E-mail'), {
      target: { value: 'ana@exemplo.com' },
    })
    fireEvent.change(screen.getByLabelText('Senha'), {
      target: { value: 'senha-errada' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(
      await screen.findByText(
        'E-mail ou senha incorretos. Verifique os dados digitados e tente novamente.',
      ),
    ).toBeInTheDocument()
    expect(navegar).not.toHaveBeenCalled()
  })
})
