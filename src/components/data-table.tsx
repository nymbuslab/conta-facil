import { useLayoutEffect, useRef, useState } from 'react'
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'

/** So mostra o indicador quando a tabela realmente tem conteudo fora da tela — sem isso, o
 * gradiente aparecia tambem em tabelas de 2 colunas que ja cabem na largura do mobile,
 * prometendo uma rolagem que nao existe. */
function useTemRolagemHorizontal<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [temRolagem, setTemRolagem] = useState(false)

  useLayoutEffect(() => {
    const elemento = ref.current
    if (!elemento) return

    const verificar = () => setTemRolagem(elemento.scrollWidth > elemento.clientWidth)
    verificar()

    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(verificar)
    observer.observe(elemento)
    return () => observer.disconnect()
  })

  return { ref, temRolagem }
}

interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[]
  data: TData[]
  mensagemVazio: string
  /** Nome acessivel da tabela (ex.: "Receitas do mes"). */
  ariaLabel?: string
  onRowClick?: (linha: TData) => void
  linhaDesabilitada?: (linha: TData) => boolean
  /** Nome acessivel da linha clicavel (ex.: "Vencido, marcar 'Luz' como paga") — sem isso, uma
   * linha com onRowClick fica focavel mas sem contexto nenhum pra quem usa leitor de tela. */
  rotuloLinha?: (linha: TData) => string
}

export function DataTable<TData>({
  columns,
  data,
  mensagemVazio,
  ariaLabel,
  onRowClick,
  linhaDesabilitada,
  rotuloLinha,
}: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })
  const { ref: containerRef, temRolagem } = useTemRolagemHorizontal<HTMLDivElement>()

  if (data.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border py-6 text-center text-sm text-muted-foreground">
        {mensagemVazio}
      </p>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-lg border border-border">
      {temRolagem && (
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-card to-transparent"
          aria-hidden="true"
        />
      )}
      <Table aria-label={ariaLabel} containerRef={containerRef}>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => {
            const desabilitada = linhaDesabilitada?.(row.original) ?? false
            const clicavel = Boolean(onRowClick) && !desabilitada

            return (
              <TableRow
                key={row.id}
                onClick={clicavel ? () => onRowClick?.(row.original) : undefined}
                onKeyDown={
                  clicavel
                    ? (evento) => {
                        if (evento.key === 'Enter' || evento.key === ' ') {
                          evento.preventDefault()
                          onRowClick?.(row.original)
                        }
                      }
                    : undefined
                }
                tabIndex={clicavel ? 0 : undefined}
                aria-label={clicavel ? rotuloLinha?.(row.original) : undefined}
                className={cn(clicavel && 'cursor-pointer')}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
