import { randomUUID } from 'node:crypto'

type OperacaoIdempotente = 'lancamento' | 'deposito' | 'resgate'

const payloads = {
  lancamento: {
    tipo: 'receita' as const,
    descricao: 'Receita idempotente',
    valor: 645000,
    dataEmissao: '2026-10-11',
  },
  deposito: { valor: 50000 },
  resgate: { valor: 20000 },
}

export function criarCenarioIdempotencia(operacao: OperacaoIdempotente) {
  const original = structuredClone(payloads[operacao])
  const repeticao = structuredClone(original)
  const conflito = { ...structuredClone(original), valor: original.valor + 1 }

  return {
    chave: randomUUID(),
    operacao,
    original,
    repeticao,
    conflito,
  }
}
