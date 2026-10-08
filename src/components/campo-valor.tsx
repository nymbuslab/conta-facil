import { forwardRef, type ComponentProps } from 'react'

import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export const CampoValor = forwardRef<HTMLInputElement, ComponentProps<typeof Input>>(
  function CampoValor({ className, ...props }, ref) {
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
          {...props}
        />
      </div>
    )
  },
)
