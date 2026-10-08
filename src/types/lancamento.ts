import { z } from 'zod'

const valorSchema = z.preprocess(
  (valor) => (typeof valor === 'number' ? valor.toString() : valor),
  z
    .string({ message: 'Informe um valor' })
    .min(1, 'Informe um valor')
    .regex(/^-?\d+(\.\d{1,2})?$/, 'Use no máximo duas casas decimais'),
)
  .transform(Number)
  .pipe(
    z
      .number()
      .finite('Informe um valor válido')
      .positive('O valor deve ser maior que zero')
      .max(1_000_000_000, 'Valor muito alto'),
  )

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
  valor: valorSchema,
})

export const despesaFormSchema = receitaFormSchema
  .extend({
    vencimento: dataSchema,
  })
  .refine((dados) => dados.vencimento >= dados.dataEmissao, {
    message: 'O vencimento não pode ser anterior à emissão',
    path: ['vencimento'],
  })

export type ReceitaFormValues = z.infer<typeof receitaFormSchema>
export type DespesaFormValues = z.infer<typeof despesaFormSchema>

export interface Receita extends ReceitaFormValues {
  id: string
  tipo: 'receita'
}

export interface Despesa extends DespesaFormValues {
  id: string
  tipo: 'despesa'
}

export type Lancamento = Receita | Despesa

export type TipoLancamento = Lancamento['tipo']
