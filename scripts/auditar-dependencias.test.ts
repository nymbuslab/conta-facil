import { describe, expect, it, vi } from 'vitest'

import { avaliarRelatorioAudit, executarAuditoria } from './auditar-dependencias.mjs'

function relatorio(vulnerabilities: Record<string, number>) {
  return JSON.stringify({ metadata: { vulnerabilities } })
}

describe('auditar dependencias', () => {
  it.each([
    ['limpo', { moderate: 0, high: 0, critical: 0 }, true],
    ['somente moderado', { moderate: 2, high: 0, critical: 0 }, true],
    ['alto', { moderate: 0, high: 1, critical: 0 }, false],
    ['critico', { moderate: 0, high: 0, critical: 1 }, false],
  ])('%s retorna contagens e resultado esperados', (_nome, contagens, aprovado) => {
    const json = relatorio({ info: 0, low: 0, ...contagens })
    expect(avaliarRelatorioAudit(json)).toEqual({ aprovado, contagens })
  })

  it('falha fechado quando o JSON e invalido', () => {
    expect(() => avaliarRelatorioAudit('nao-json')).toThrow('JSON invalido')
  })

  it('falha fechado quando npm audit nao produz relatorio valido', async () => {
    const executar = vi.fn().mockResolvedValue({ codigo: 1, stdout: '', stderr: 'rede indisponivel' })

    await expect(executarAuditoria(executar)).rejects.toThrow('npm audit falhou')
  })

  it('propaga falha para o codigo de saida quando o relatorio tem alta ou critica', async () => {
    const executar = vi.fn().mockResolvedValue({
      codigo: 1,
      stdout: relatorio({ moderate: 0, high: 1, critical: 1 }),
      stderr: '',
    })

    await expect(executarAuditoria(executar)).rejects.toThrow('1 alta(s) e 1 critica(s)')
  })
})
