import { AlertCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function EstadoCarregando() {
  return (
    <div role="status" aria-label="Carregando dados" className="space-y-3 py-2">
      <span className="sr-only">Carregando seus dados...</span>
      <div className="h-24 animate-pulse rounded-lg bg-muted" />
      <div className="h-16 animate-pulse rounded-lg bg-muted" />
      <div className="h-16 animate-pulse rounded-lg bg-muted" />
    </div>
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
