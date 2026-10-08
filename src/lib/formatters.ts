export function formatarMoeda(valor: number) {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

/**
 * Lê texto digitado em formato livre pt-BR ("1.234,56", "2,99", "2.99" no teclado
 * numérico do celular) e retorna o número com no máximo duas casas decimais.
 * Padrão usado no busca-preco-v3 (src/lib/calculo-preco.ts) para campos de valor.
 */
export function parseValorMonetario(texto: string): number | null {
  const bruto = texto.trim()
  if (bruto === '') return null

  const pontoComoDecimal = !bruto.includes(',') && bruto.split('.').length === 2
  const limpo = pontoComoDecimal ? bruto : bruto.replace(/\./g, '').replace(',', '.')

  if (!/^-?\d+(\.\d{1,2})?$/.test(limpo)) return null

  const valor = Number(limpo)
  return Number.isFinite(valor) ? valor : null
}

export function formatarData(data: string) {
  const [ano, mes, dia] = data.split('-')
  if (!ano || !mes || !dia) return data
  const anoAtual = new Date().getFullYear().toString()
  return ano === anoAtual ? `${dia}/${mes}` : `${dia}/${mes}/${ano.slice(2)}`
}
