import { describe, expect, it, vi } from 'vitest'

import {
  criarExecutorIdempotencia,
  type RegistroIdempotencia,
  type TransacaoIdempotencia,
} from './idempotencia'

function criarArmazenamento() {
  const registros = new Map<string, RegistroIdempotencia>()
  let fila = Promise.resolve()

  return {
    registros,
    transacionar<T>(callback: (transacao: TransacaoIdempotencia) => Promise<T>) {
      const rodada = fila.then(async () => {
        const copia = new Map(registros)
        const transacao: TransacaoIdempotencia = {
          banco: null,
          bloquear: async () => undefined,
          buscar: async (userId, chave) => copia.get(`${userId}:${chave}`) ?? null,
          salvar: async (registro) => { copia.set(`${registro.userId}:${registro.chave}`, registro) },
        }
        const resultado = await callback(transacao)
        registros.clear()
        for (const [chave, registro] of copia) registros.set(chave, registro)
        return resultado
      })
      fila = rodada.then(() => undefined, () => undefined)
      return rodada
    },
  }
}

const entrada = {
  userId: '11111111-1111-4111-8111-111111111111',
  chave: '22222222-2222-4222-8222-222222222222',
  operacao: 'lancamentos.criar',
  payload: { valor: 100, descricao: 'Teste' },
}

describe('executor de idempotencia', () => {
  it('repete status e corpo sem executar a mutacao novamente', async () => {
    const armazenamento = criarArmazenamento()
    const logger = vi.fn()
    const executar = criarExecutorIdempotencia(armazenamento, logger)
    const mutacao = vi.fn().mockResolvedValue({ status: 201, corpo: [{ id: 'novo' }] })

    const primeira = await executar(entrada, mutacao)
    const repetida = await executar({ ...entrada, payload: { descricao: 'Teste', valor: 100 } }, mutacao)

    expect(primeira).toEqual({ tipo: 'executada', status: 201, corpo: [{ id: 'novo' }] })
    expect(repetida).toEqual({ tipo: 'replay', status: 201, corpo: [{ id: 'novo' }] })
    expect(mutacao).toHaveBeenCalledTimes(1)
    expect(logger.mock.calls.map(([evento]) => evento)).toEqual([
      { evento: 'idempotencia', operacao: 'lancamentos.criar', resultado: 'executada', replay: false },
      { evento: 'idempotencia', operacao: 'lancamentos.criar', resultado: 'replay', replay: true },
    ])
    for (const [evento] of logger.mock.calls) {
      expect(Object.keys(evento).sort()).toEqual(['evento', 'operacao', 'replay', 'resultado'])
    }
  })

  it.each([
    [{ ...entrada, payload: { ...entrada.payload, valor: 101 } }, 'payload'],
    [{ ...entrada, operacao: 'caixinhas.depositar' }, 'operacao'],
  ])('retorna conflito para mesma chave com %s diferente', async (conflitante) => {
    const armazenamento = criarArmazenamento()
    const logger = vi.fn()
    const executar = criarExecutorIdempotencia(armazenamento, logger)
    const mutacao = vi.fn().mockResolvedValue({ status: 201, corpo: { ok: true } })
    await executar(entrada, mutacao)

    expect(await executar(conflitante, mutacao)).toEqual({ tipo: 'conflito' })
    expect(mutacao).toHaveBeenCalledTimes(1)
    expect(logger).toHaveBeenLastCalledWith({
      evento: 'idempotencia', operacao: conflitante.operacao, resultado: 'conflito', replay: false,
    })
    expect(Object.keys(logger.mock.calls.at(-1)?.[0] ?? {}).sort())
      .toEqual(['evento', 'operacao', 'replay', 'resultado'])
  })

  it('serializa concorrencia e produz um unico efeito', async () => {
    const armazenamento = criarArmazenamento()
    const executar = criarExecutorIdempotencia(armazenamento)
    let efeitos = 0
    const mutacao = vi.fn(async () => ({ status: 200, corpo: { efeitos: ++efeitos } }))

    const respostas = await Promise.all([
      executar(entrada, mutacao),
      executar(entrada, mutacao),
    ])

    expect(respostas).toEqual([
      { tipo: 'executada', status: 200, corpo: { efeitos: 1 } },
      { tipo: 'replay', status: 200, corpo: { efeitos: 1 } },
    ])
    expect(efeitos).toBe(1)
  })

  it('faz rollback da reserva quando a mutacao falha', async () => {
    const armazenamento = criarArmazenamento()
    const executar = criarExecutorIdempotencia(armazenamento)
    await expect(executar(entrada, async () => { throw new Error('falha') })).rejects.toThrow('falha')

    expect(armazenamento.registros.size).toBe(0)
    expect(await executar(entrada, async () => ({ status: 201, corpo: { ok: true } })))
      .toMatchObject({ tipo: 'executada' })
  })

  it('registra somente os quatro metadados permitidos', async () => {
    const armazenamento = criarArmazenamento()
    const logger = vi.fn()
    const executar = criarExecutorIdempotencia(armazenamento, logger)
    await executar(entrada, async () => ({ status: 201, corpo: { ok: true } }))

    expect(logger).toHaveBeenCalledWith({
      evento: 'idempotencia', operacao: 'lancamentos.criar', resultado: 'executada', replay: false,
    })
    expect(Object.keys(logger.mock.calls[0][0])).toEqual(['evento', 'operacao', 'resultado', 'replay'])
  })
})
