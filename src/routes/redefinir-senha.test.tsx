import { fireEvent, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { renderRoute } from '@/test/render-route'
import { criarClienteAuthTeste } from '@/test/test-utils'

describe('TelaRedefinirSenha', () => {
  it('mostra link invalido quando nao ha token na URL', async () => {
    const { findByRole } = renderRoute('/redefinir-senha', { usuario: null })

    expect(await findByRole('heading', { name: 'Link inválido ou expirado' })).toBeInTheDocument()
    expect(await findByRole('link', { name: 'Solicitar novo link' })).toBeInTheDocument()
  })

  it('mostra link invalido quando o Neon Auth redireciona com erro', async () => {
    const { findByRole } = renderRoute('/redefinir-senha?error=INVALID_TOKEN', { usuario: null })

    expect(await findByRole('heading', { name: 'Link inválido ou expirado' })).toBeInTheDocument()
  })

  it('valida que as senhas precisam ser iguais', async () => {
    const { findByLabelText, findByText, getByRole } = renderRoute(
      '/redefinir-senha?token=token-valido',
      { usuario: null },
    )

    fireEvent.change(await findByLabelText('Nova senha'), { target: { value: 'senha12345' } })
    fireEvent.change(await findByLabelText('Confirmar nova senha'), {
      target: { value: 'outra-senha' },
    })
    fireEvent.click(getByRole('button', { name: 'Salvar nova senha' }))

    expect(await findByText('As senhas precisam ser iguais')).toBeInTheDocument()
  })

  it('redefine a senha e mostra a confirmacao', async () => {
    const resetPassword = vi.fn().mockResolvedValue({ data: {}, error: null })
    const clienteAuth = { ...criarClienteAuthTeste(null), resetPassword }
    const { findByLabelText, findByRole, getByRole } = renderRoute(
      '/redefinir-senha?token=token-valido',
      { usuario: null, clienteAuth },
    )

    fireEvent.change(await findByLabelText('Nova senha'), { target: { value: 'senha12345' } })
    fireEvent.change(await findByLabelText('Confirmar nova senha'), {
      target: { value: 'senha12345' },
    })
    fireEvent.click(getByRole('button', { name: 'Salvar nova senha' }))

    await waitFor(() =>
      expect(resetPassword).toHaveBeenCalledWith({ newPassword: 'senha12345', token: 'token-valido' }),
    )
    expect(await findByRole('heading', { name: 'Senha redefinida' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Ir para o login' })).toBeInTheDocument()
  })

  it('mostra erro quando o token e invalido ou expirado no servidor', async () => {
    const resetPassword = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'Token invalido' },
    })
    const clienteAuth = { ...criarClienteAuthTeste(null), resetPassword }
    const { findByLabelText, findByText, getByRole } = renderRoute(
      '/redefinir-senha?token=token-expirado',
      { usuario: null, clienteAuth },
    )

    fireEvent.change(await findByLabelText('Nova senha'), { target: { value: 'senha12345' } })
    fireEvent.change(await findByLabelText('Confirmar nova senha'), {
      target: { value: 'senha12345' },
    })
    fireEvent.click(getByRole('button', { name: 'Salvar nova senha' }))

    expect(
      await findByText('Não foi possível redefinir sua senha. O link pode ter expirado.'),
    ).toBeInTheDocument()
  })
})
