import { z } from 'zod'

import { parseValorMonetario } from '@/lib/formatters'

function valorMaiorQueZero(texto: string) {
  const valor = parseValorMonetario(texto)
  return valor !== null && valor > 0
}

function valorDentroDoLimite(texto: string) {
  const valor = parseValorMonetario(texto)
  return valor !== null && valor <= 1_000_000_000
}

const valorFormSchema = z
  .string({ message: 'Informe um valor' })
  .min(1, 'Informe um valor')
  .refine((texto) => parseValorMonetario(texto) !== null, 'Informe um valor válido, ex: 1.234,56')
  .refine(valorMaiorQueZero, 'O valor deve ser maior que zero')
  .refine(valorDentroDoLimite, 'Valor muito alto')

function dataValida(data: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return false
  const [ano, mes, dia] = data.split('-').map(Number)
  const parsed = new Date(ano, mes - 1, dia)
  return parsed.getFullYear() === ano && parsed.getMonth() === mes - 1 && parsed.getDate() === dia
}

const dataSchema = z
  .string()
  .min(1, 'Informe a data')
  .refine(dataValida, 'Informe uma data válida (AAAA-MM-DD)')

export const receitaFormSchema = z.object({
  dataEmissao: dataSchema,
  descricao: z.string().trim().min(1, 'Informe a descrição'),
  valor: valorFormSchema,
})

const despesaBaseSchema = z.object({
  descricao: z.string().trim().min(1, 'Informe a descrição'),
  valor: valorFormSchema,
  vencimento: dataSchema,
  parcelado: z.boolean().default(false),
  quantidadeParcelas: z.coerce.number().int().optional(),
})

export const despesaFormSchema = despesaBaseSchema.refine(
  (dados) =>
    !dados.parcelado ||
    (dados.quantidadeParcelas !== undefined &&
      dados.quantidadeParcelas >= 2 &&
      dados.quantidadeParcelas <= 360),
  {
    message: 'Informe a quantidade de parcelas entre 2 e 360',
    path: ['quantidadeParcelas'],
  },
)

/** Valores crus do formulário: `valor` ainda é texto livre (ex: "1.234,56"), convertido para
 * número só ao salvar o lançamento — ver `parseValorMonetario` em `@/lib/formatters`. */
export type ReceitaFormValues = z.infer<typeof receitaFormSchema>
export type DespesaFormValues = z.infer<typeof despesaFormSchema>

export interface Receita {
  id: string
  tipo: 'receita'
  dataEmissao: string
  descricao: string
  valor: number
}

export interface Despesa {
  id: string
  tipo: 'despesa'
  descricao: string
  valor: number
  vencimento: string
  paga: boolean
  pagoEm: string | null
  parcelamentoId: string | null
  parcelaAtual: number | null
  totalParcelas: number | null
}

export type Lancamento = Receita | Despesa

export type TipoLancamento = Lancamento['tipo']
