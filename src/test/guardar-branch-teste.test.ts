import { describe, expect, it } from 'vitest'

import { ENDPOINT_TESTE_PERMITIDO, confirmarIdentidadeConexao } from './guardar-branch-teste.ts'

function poolCom(endpointId: string | undefined) {
  return { query: async () => ({ rows: [{ endpoint_id: endpointId }] }) }
}

describe('confirmarIdentidadeConexao', () => {
  it('passa quando o endpoint da conexao real e o da branch de teste', async () => {
    await expect(
      confirmarIdentidadeConexao({ pool: poolCom(ENDPOINT_TESTE_PERMITIDO) }),
    ).resolves.toBeUndefined()
  })

  it('recusa quando o endpoint real e de outra branch', async () => {
    await expect(
      confirmarIdentidadeConexao({ pool: poolCom('ep-outra-branch-qualquer') }),
    ).rejects.toThrow(/endpoint 'ep-outra-branch-qualquer'/)
  })

  it('recusa quando o endpoint nao pode ser determinado', async () => {
    await expect(
      confirmarIdentidadeConexao({ pool: poolCom(undefined) }),
    ).rejects.toThrow(/desconhecido/)
  })

  it('recusa sem pool nem DATABASE_URL para abrir uma conexao nova', async () => {
    await expect(
      confirmarIdentidadeConexao({ databaseUrl: undefined }),
    ).rejects.toThrow(/DATABASE_URL_UNPOOLED ou DATABASE_URL/)
  })
})
