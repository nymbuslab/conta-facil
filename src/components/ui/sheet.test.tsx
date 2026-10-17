import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Sheet, SheetContent, SheetTitle } from './sheet'

describe('Sheet', () => {
  it('mostra o conteudo quando open=true', () => {
    render(
      <Sheet open onOpenChange={vi.fn()}>
        <SheetContent>
          <SheetTitle>Mais</SheetTitle>
        </SheetContent>
      </Sheet>,
    )

    expect(screen.getByText('Mais')).toBeInTheDocument()
  })

  it('nao mostra o conteudo quando open=false', () => {
    render(
      <Sheet open={false} onOpenChange={vi.fn()}>
        <SheetContent>
          <SheetTitle>Mais</SheetTitle>
        </SheetContent>
      </Sheet>,
    )

    expect(screen.queryByText('Mais')).not.toBeInTheDocument()
  })

  it('chama onOpenChange(false) ao clicar no botao de fechar', () => {
    const aoMudar = vi.fn()
    render(
      <Sheet open onOpenChange={aoMudar}>
        <SheetContent>
          <SheetTitle>Mais</SheetTitle>
        </SheetContent>
      </Sheet>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }))

    expect(aoMudar).toHaveBeenCalledWith(false)
  })
})
