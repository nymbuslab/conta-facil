import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

import { adicionarMeses } from '@/lib/datas'
import { parseValorMonetario } from '@/lib/formatters'
import { lancamentosIniciais } from '@/lib/mock-data'
import type { Despesa, DespesaFormValues, Lancamento, Receita, ReceitaFormValues } from '@/types/lancamento'

interface LancamentosContextValue {
  lancamentos: Lancamento[]
  receitas: Receita[]
  despesas: Despesa[]
  saldoReceita: number
  saldoDespesa: number
  adicionarReceita: (dados: ReceitaFormValues) => void
  adicionarDespesa: (dados: DespesaFormValues) => void
  marcarComoPaga: (id: string) => void
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

function gerarParcelas(
  dados: DespesaFormValues,
  valorTotal: number,
  quantidadeParcelas: number,
): Despesa[] {
  const parcelamentoId = gerarId()
  const totalCentavos = Math.round(valorTotal * 100)
  const centavosBase = Math.floor(totalCentavos / quantidadeParcelas)
  const resto = totalCentavos - centavosBase * quantidadeParcelas

  return Array.from({ length: quantidadeParcelas }, (_, indice) => {
    const numeroParcela = indice + 1
    const ehUltima = numeroParcela === quantidadeParcelas
    const centavosParcela = centavosBase + (ehUltima ? resto : 0)

    return {
      id: gerarId(),
      tipo: 'despesa',
      dataEmissao: dados.dataEmissao,
      descricao: dados.descricao,
      valor: centavosParcela / 100,
      vencimento: adicionarMeses(dados.vencimento, indice),
      paga: false,
      parcelamentoId,
      parcelaAtual: numeroParcela,
      totalParcelas: quantidadeParcelas,
    }
  })
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
  function adicionarReceita(dados: ReceitaFormValues) {
    const valor = parseValorMonetario(dados.valor)
    if (valor === null) return

    setLancamentos((atual) => [
      ...atual,
      {
        id: gerarId(),
        tipo: 'receita',
        dataEmissao: dados.dataEmissao,
        descricao: dados.descricao,
        valor,
      },
    ])
  }

  function adicionarDespesa(dados: DespesaFormValues) {
    const valorTotal = parseValorMonetario(dados.valor)
    if (valorTotal === null) return

    if (dados.parcelado && dados.quantidadeParcelas) {
      const novasDespesas = gerarParcelas(dados, valorTotal, dados.quantidadeParcelas)
      setLancamentos((atual) => [...atual, ...novasDespesas])
      return
    }

    setLancamentos((atual) => [
      ...atual,
      {
        id: gerarId(),
        tipo: 'despesa',
        dataEmissao: dados.dataEmissao,
        descricao: dados.descricao,
        valor: valorTotal,
        vencimento: dados.vencimento,
        paga: false,
        parcelamentoId: null,
        parcelaAtual: null,
        totalParcelas: null,
      },
    ])
  }

  function marcarComoPaga(id: string) {
    setLancamentos((atual) =>
      atual.map((lancamento) =>
        lancamento.tipo === 'despesa' && lancamento.id === id
          ? { ...lancamento, paga: true }
          : lancamento,
      ),
    )
  }

  return (
    <LancamentosContext.Provider
      value={{
        lancamentos,
        receitas,
        despesas,
        saldoReceita,
        saldoDespesa,
        adicionarReceita,
        adicionarDespesa,
        marcarComoPaga,
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
