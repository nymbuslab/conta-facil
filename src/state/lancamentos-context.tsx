import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

import { lancamentosIniciais } from '@/lib/mock-data'
import type { Despesa, DespesaFormValues, Lancamento, Receita, ReceitaFormValues } from '@/types/lancamento'

interface LancamentosContextValue {
  lancamentos: Lancamento[]
  receitas: Receita[]
  despesas: Despesa[]
  saldoReceita: number
  saldoDespesa: number
  saldoAcumulado: number
  adicionarReceita: (dados: ReceitaFormValues) => void
  adicionarDespesa: (dados: DespesaFormValues) => void
}

const LancamentosContext = createContext<LancamentosContextValue | null>(null)

function gerarId() {
  return Math.random().toString(36).slice(2, 10)
}

function arredondar(valor: number) {
  return Math.round(valor * 100) / 100
}

function ehReceita(lancamento: Lancamento): lancamento is Receita {
  return lancamento.tipo === 'receita'
}

function ehDespesa(lancamento: Lancamento): lancamento is Despesa {
  return lancamento.tipo === 'despesa'
}

export function LancamentosProvider({ children }: { children: ReactNode }) {
  const [lancamentos, setLancamentos] = useState<Lancamento[]>(lancamentosIniciais)

  const receitas = useMemo(() => lancamentos.filter(ehReceita), [lancamentos])
  const despesas = useMemo(() => lancamentos.filter(ehDespesa), [lancamentos])

  const saldoReceita = useMemo(
    () => arredondar(receitas.reduce((soma, l) => soma + l.valor, 0)),
    [receitas],
  )
  const saldoDespesa = useMemo(
    () => arredondar(despesas.reduce((soma, l) => soma + l.valor, 0)),
    [despesas],
  )
  const saldoAcumulado = arredondar(saldoReceita - saldoDespesa)

  function adicionarReceita(dados: ReceitaFormValues) {
    setLancamentos((atual) => [...atual, { ...dados, id: gerarId(), tipo: 'receita' }])
  }

  function adicionarDespesa(dados: DespesaFormValues) {
    setLancamentos((atual) => [...atual, { ...dados, id: gerarId(), tipo: 'despesa' }])
  }

  return (
    <LancamentosContext.Provider
      value={{
        lancamentos,
        receitas,
        despesas,
        saldoReceita,
        saldoDespesa,
        saldoAcumulado,
        adicionarReceita,
        adicionarDespesa,
      }}
    >
      {children}
    </LancamentosContext.Provider>
  )
}

export function useLancamentos() {
  const context = useContext(LancamentosContext)
  if (!context) {
    throw new Error('useLancamentos deve ser usado dentro de LancamentosProvider')
  }
  return context
}
