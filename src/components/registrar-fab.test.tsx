import { describe, expect, it } from 'vitest'

import { renderWithProviders } from '@/test/test-utils'

import { RegistrarFab } from './registrar-fab'

describe('RegistrarFab', () => {
  it('fica posicionado acima da altura do BottomNav, nao mais em bottom-6', () => {
    const { container } = renderWithProviders(<RegistrarFab />)
    const wrapper = container.querySelector('.fixed')
    expect(wrapper).not.toBeNull()
    expect(wrapper?.className).not.toMatch(/\bbottom-6\b/)
    expect(wrapper?.className).toMatch(/\bbottom-(1[6-9]|2\d|3\d)\b/)
  })
})
