import type { ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function Bloco({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn('animate-pulse rounded-lg bg-muted', className)} />
}

function MolduraCarregando({ children }: { children: ReactNode }) {
  return (
    <div role="status" aria-label="Carregando dados" className="space-y-3 py-2">
      <span className="sr-only">Carregando seus dados...</span>
      {children}
    </div>
  )
}

/** Fallback generico; prefira o skeleton especifico da tela. */
export function EstadoCarregando() {
  return (
    <MolduraCarregando>
      <Bloco className="h-24" />
      <Bloco className="h-16" />
      <Bloco className="h-16" />
    </MolduraCarregando>
  )
}

/** Inicio: barra de sobra prevista + tres cards + linhas das tabelas. */
export function EstadoCarregandoInicio() {
  return (
    <MolduraCarregando>
      <Bloco className="h-20" />
      <div className="grid grid-cols-3 gap-3">
        <Bloco className="h-16" />
        <Bloco className="h-16" />
        <Bloco className="h-16" />
      </div>
      <div className="space-y-2 pt-3">
        <Bloco className="h-4 w-24" />
        <Bloco className="h-12" />
        <Bloco className="h-12" />
        <Bloco className="h-12" />
      </div>
    </MolduraCarregando>
  )
}

/** Caixinhas: cards altos com barra de progresso. */
export function EstadoCarregandoCaixinhas() {
  return (
    <MolduraCarregando>
      <Bloco className="h-36" />
      <Bloco className="h-36" />
    </MolduraCarregando>
  )
}

/** Parcelas: cards de resumo do parcelamento. */
export function EstadoCarregandoParcelas() {
  return (
    <MolduraCarregando>
      <Bloco className="h-28" />
      <Bloco className="h-28" />
    </MolduraCarregando>
  )
}

export function EstadoErro({ tentarNovamente }: { tentarNovamente: () => void | Promise<void> }) {
  return (
    <div role="alert" className="rounded-lg border border-destructive/30 bg-card px-5 py-6 text-center">
      <AlertCircle className="mx-auto size-6 text-destructive" aria-hidden="true" />
      <p className="mt-3 font-display text-base font-semibold text-foreground">
        Não foi possível carregar seus dados.
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Confira sua conexão e tente de novo.
      </p>
      <Button className="mt-4" variant="outline" onClick={() => void tentarNovamente()}>
        Tentar novamente
      </Button>
    </div>
  )
}
