import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { deslocarMes, rotuloMes } from '@/lib/datas'

interface FiltrosLancamentosProps {
  mes: string
  busca: string
  onChange: (parcial: { mes?: string; busca?: string }) => void
}

/** Navegacao de mes + busca por descricao. A busca so sobe para o estado global depois de uma
 * pausa na digitacao, para nao disparar uma consulta por tecla. */
export function FiltrosLancamentos({ mes, busca, onChange }: FiltrosLancamentosProps) {
  const [textoBusca, setTextoBusca] = useState(busca)

  useEffect(() => {
    setTextoBusca(busca)
  }, [busca])

  useEffect(() => {
    if (textoBusca === busca) return
    const temporizador = setTimeout(() => onChange({ busca: textoBusca }), 300)
    return () => clearTimeout(temporizador)
  }, [textoBusca, busca, onChange])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Mês anterior"
          onClick={() => onChange({ mes: deslocarMes(mes, -1) })}
        >
          <ChevronLeft />
        </Button>
        <p aria-live="polite" className="font-display text-sm font-semibold text-foreground">
          {rotuloMes(mes)}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Próximo mês"
          onClick={() => onChange({ mes: deslocarMes(mes, 1) })}
        >
          <ChevronRight />
        </Button>
      </div>

      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={textoBusca}
          onChange={(evento) => setTextoBusca(evento.target.value)}
          placeholder="Buscar por descrição"
          aria-label="Buscar lançamentos"
          className="pl-9"
        />
      </div>
    </div>
  )
}
