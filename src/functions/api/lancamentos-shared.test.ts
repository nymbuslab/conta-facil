import { describe, expect, it } from 'vitest'

import { criarLancamentoReceita } from './lancamentos-shared.ts'

function criarBancoFake() {
  const chamadas: { tabela: unknown; valores: unknown }[] = []
  const banco = {
    insert(tabela: unknown) {
      return {
        values(valores: unknown) {
          chamadas.push({ tabela, valores })
          return {
            async returning() {
              return [{ id: 'lancamento-fake-1', ...(valores as Record<string, unknown>) }]
            },
          }
        },
      }
    },
  }
  return { banco, chamadas }
}

describe('criarLancamentoReceita', () => {
  it('insere um lancamento tipo receita com os dados informados, dentro da transacao passada', async () => {
    const { banco, chamadas } = criarBancoFake()

    const criado = await criarLancamentoReceita(
      { userId: 'user-1', valor: 50000, dataEmissao: '2026-10-15' },
      banco,
    )

    expect(chamadas).toHaveLength(1)
    expect(chamadas[0]?.valores).toMatchObject({
      userId: 'user-1',
      tipo: 'receita',
      valor: 50000,
      dataEmissao: '2026-10-15',
    })
    expect(criado).toMatchObject({ tipo: 'receita', valor: 50000, dataEmissao: '2026-10-15' })
  })
})
