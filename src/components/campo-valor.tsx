import { forwardRef, type ChangeEvent, type ComponentProps } from 'react'

import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const MAX_DIGITOS = 12

/** Converte os dígitos digitados (tratados como centavos) em texto formatado pt-BR,
 * preenchendo da direita para a esquerda: "2" -> "0,02", "25" -> "0,25", "250" -> "2,50". */
function formatarDigitosComoMoeda(digitos: string) {
  if (digitos === '') return ''
  const centavos = Number(digitos)
  return (centavos / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

type CampoValorProps = Omit<ComponentProps<typeof Input>, 'onChange' | 'type' | 'inputMode'> & {
  onChange?: (valor: string) => void
}

export const CampoValor = forwardRef<HTMLInputElement, CampoValorProps>(function CampoValor(
  { className, onChange, ...props },
  ref,
) {
  function lidarComMudanca(evento: ChangeEvent<HTMLInputElement>) {
    const digitos = evento.target.value.replace(/\D/g, '').replace(/^0+(?=\d)/, '').slice(0, MAX_DIGITOS)
    onChange?.(formatarDigitosComoMoeda(digitos))
  }

  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-display text-sm text-muted-foreground">
        R$
      </span>
      <Input
        ref={ref}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        placeholder="0,00"
        className={cn('pl-9', className)}
        onChange={lidarComMudanca}
        {...props}
      />
    </div>
  )
})
