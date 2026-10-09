import { createContext, useContext, useMemo, useRef, useState, type ReactNode } from 'react'

import { parseValorMonetario } from '@/lib/formatters'
import type { Caixinha, CriarCaixinhaFormValues, MovimentarCaixinhaFormValues } from '@/types/caixinha'

interface ResultadoMovimentacao {
  sucesso: boolean
  erro?: string
}

interface CaixinhasContextValue {
  caixinhas: Caixinha[]
  totalGuardado: number
  criarCaixinha: (dados: CriarCaixinhaFormValues) => void
  depositar: (id: string, dados: MovimentarCaixinhaFormValues) => ResultadoMovimentacao
  resgatar: (id: string, dados: MovimentarCaixinhaFormValues) => ResultadoMovimentacao
  excluirCaixinha: (id: string) => void
}

const CaixinhasContext = createContext<CaixinhasContextValue | null>(null)

function gerarId() {
  return Math.random().toString(36).slice(2, 10)
}

function arredondar(valor: number) {
  return Math.round(valor * 100) / 100
}

export function CaixinhasProvider({ children }: { children: ReactNode }) {
  const [caixinhas, setCaixinhas] = useState<Caixinha[]>([])

  /** Espelha o estado mais recente de forma síncrona: o setter do useState não garante que o
   * updater funcional já tenha corrido quando a função que o chamou retorna, então validar e
   * mutar através desta ref — sempre atualizada aqui, nunca durante a renderização — é o que
   * torna duas chamadas no mesmo evento (ex: duplo clique) realmente atômicas entre si. */
  const caixinhasRef = useRef(caixinhas)

  function aplicarAtualizacao(atualizador: (atual: Caixinha[]) => Caixinha[]) {
    const proximo = atualizador(caixinhasRef.current)
    caixinhasRef.current = proximo
    setCaixinhas(proximo)
  }

  const totalGuardado = useMemo(
    () => arredondar(caixinhas.reduce((soma, c) => soma + c.valorGuardado, 0)),
    [caixinhas],
  )

  function criarCaixinha(dados: CriarCaixinhaFormValues) {
    const meta = parseValorMonetario(dados.meta)
    if (meta === null) return

    aplicarAtualizacao((atual) => [
      ...atual,
      { id: gerarId(), nome: dados.nome, valorGuardado: 0, meta },
    ])
  }

  function depositar(id: string, dados: MovimentarCaixinhaFormValues): ResultadoMovimentacao {
    const valor = parseValorMonetario(dados.valor)
    if (valor === null) return { sucesso: false, erro: 'Informe um valor válido' }

    const caixinha = caixinhasRef.current.find((c) => c.id === id)
    if (!caixinha) return { sucesso: false, erro: 'Caixinha não encontrada' }

    aplicarAtualizacao((atual) =>
      atual.map((c) =>
        c.id === id ? { ...c, valorGuardado: arredondar(c.valorGuardado + valor) } : c,
      ),
    )
    return { sucesso: true }
  }

  function resgatar(id: string, dados: MovimentarCaixinhaFormValues): ResultadoMovimentacao {
    const valor = parseValorMonetario(dados.valor)
    if (valor === null) return { sucesso: false, erro: 'Informe um valor válido' }

    const caixinha = caixinhasRef.current.find((c) => c.id === id)
    if (!caixinha) return { sucesso: false, erro: 'Caixinha não encontrada' }
    if (valor > caixinha.valorGuardado) {
      return { sucesso: false, erro: 'Valor maior que o guardado nesta caixinha' }
    }

    aplicarAtualizacao((atual) =>
      atual.map((c) =>
        c.id === id ? { ...c, valorGuardado: arredondar(c.valorGuardado - valor) } : c,
      ),
    )
    return { sucesso: true }
  }

  function excluirCaixinha(id: string) {
    aplicarAtualizacao((atual) => atual.filter((c) => c.id !== id))
  }

  return (
    <CaixinhasContext.Provider
      value={{ caixinhas, totalGuardado, criarCaixinha, depositar, resgatar, excluirCaixinha }}
    >
      {children}
    </CaixinhasContext.Provider>
  )
}

export function useCaixinhas() {
  const context = useContext(CaixinhasContext)
  if (!context) {
    throw new Error('useCaixinhas deve ser usado dentro de CaixinhasProvider')
  }
  return context
}
