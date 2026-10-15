import { z } from 'zod'

import { parseValorMonetario } from '@/lib/formatters'

function valorMonetarioValido(texto: string) {
  const valor = parseValorMonetario(texto)
  return valor !== null && valor > 0
}

const valorSchema = z
  .string({ message: 'Informe um valor' })
  .min(1, 'Informe um valor')
  .refine(valorMonetarioValido, 'Informe um valor válido maior que zero')

export const criarCaixinhaSchema = z.object({
  nome: z.string().trim().min(1, 'Informe o nome da caixinha'),
  meta: valorSchema,
})

export const movimentarCaixinhaSchema = z.object({
  valor: valorSchema,
})

export const origemDepositoSchema = z.enum(['saldo_atual', 'de_fora'])

export const depositarCaixinhaSchema = movimentarCaixinhaSchema.extend({
  origem: origemDepositoSchema,
})

export type CriarCaixinhaFormValues = z.infer<typeof criarCaixinhaSchema>
export type MovimentarCaixinhaFormValues = z.infer<typeof movimentarCaixinhaSchema>
export type OrigemDeposito = z.infer<typeof origemDepositoSchema>
export type DepositarCaixinhaFormValues = z.infer<typeof depositarCaixinhaSchema>

export interface Caixinha {
  id: string
  nome: string
  valorGuardado: number
  meta: number
}
