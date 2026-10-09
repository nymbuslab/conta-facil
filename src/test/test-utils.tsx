import { render, type RenderOptions } from '@testing-library/react'
import type { ReactElement } from 'react'

import { CaixinhasProvider } from '@/state/caixinhas-context'
import { LancamentosProvider } from '@/state/lancamentos-context'

export function renderWithProviders(ui: ReactElement, options?: RenderOptions) {
  return render(
    <LancamentosProvider>
      <CaixinhasProvider>{ui}</CaixinhasProvider>
    </LancamentosProvider>,
    options,
  )
}

export * from '@testing-library/react'
