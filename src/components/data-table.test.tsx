import { render } from '@testing-library/react'
import type { ColumnDef } from '@tanstack/react-table'
import { describe, expect, it } from 'vitest'

import { DataTable } from './data-table'

interface ItemTeste {
  nome: string
}

const columns: ColumnDef<ItemTeste, unknown>[] = [
  { accessorKey: 'nome', header: 'Nome' },
]

const data: ItemTeste[] = [{ nome: 'Item 1' }, { nome: 'Item 2' }]

function gradiente(container: HTMLElement) {
  return container.querySelector('[aria-hidden="true"].bg-gradient-to-l')
}

describe('DataTable — indicador de rolagem', () => {
  it('nao mostra o gradiente quando a tabela cabe na largura disponivel', () => {
    const { container } = render(<DataTable columns={columns} data={data} mensagemVazio="vazio" />)

    expect(gradiente(container)).not.toBeInTheDocument()
  })

  it('mostra o gradiente quando a tabela tem conteudo fora da tela', () => {
    const { container, rerender } = render(<DataTable columns={columns} data={data} mensagemVazio="vazio" />)
    const scrollDiv = container.querySelector('.overflow-auto') as HTMLElement
    Object.defineProperty(scrollDiv, 'scrollWidth', { configurable: true, value: 400 })
    Object.defineProperty(scrollDiv, 'clientWidth', { configurable: true, value: 300 })

    rerender(<DataTable columns={columns} data={data} mensagemVazio="vazio" />)

    expect(gradiente(container)).toBeInTheDocument()
  })
})
