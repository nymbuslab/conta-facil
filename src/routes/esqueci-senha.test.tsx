import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { AnchorHTMLAttributes } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const solicitarRedefinicaoSenha = vi.fn()

vi.mock('@/state/auth-context', () => ({
  useAuth: () => ({ solicitarRedefinicaoSenha }),
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
  }
})

import { TelaEsqueciSenha } from './esqueci-senha'

describe('TelaEsqueciSenha', () => {
  beforeEach(() => {
    solicitarRedefinicaoSenha.mockReset()
  })

  it('valida o e-mail antes de enviar', async () => {
    render(<TelaEsqueciSenha />)

    fireEvent.change(screen.getByLabelText('E-mail'), {
      target: { value: 'email-invalido' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Enviar link de recuperação' }))

    expect(await screen.findByText('Informe um e-mail válido')).toBeInTheDocument()
    expect(solicitarRedefinicaoSenha).not.toHaveBeenCalled()
  })

  it('envia o e-mail e mostra a confirmacao', async () => {
    solicitarRedefinicaoSenha.mockResolvedValue(undefined)
    render(<TelaEsqueciSenha />)

    fireEvent.change(screen.getByLabelText('E-mail'), {
      target: { value: 'ana@exemplo.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Enviar link de recuperação' }))

    await waitFor(() => expect(solicitarRedefinicaoSenha).toHaveBeenCalledWith('ana@exemplo.com'))
    expect(await screen.findByRole('heading', { name: 'E-mail enviado' })).toBeInTheDocument()
  })

  it('mostra a mesma confirmacao mesmo quando o pedido falha, para nao revelar se o e-mail existe', async () => {
    solicitarRedefinicaoSenha.mockRejectedValue(new Error('falha de rede'))
    render(<TelaEsqueciSenha />)

    fireEvent.change(screen.getByLabelText('E-mail'), {
      target: { value: 'ana@exemplo.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Enviar link de recuperação' }))

    expect(await screen.findByRole('heading', { name: 'E-mail enviado' })).toBeInTheDocument()
  })
})
