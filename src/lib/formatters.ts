export function formatarMoeda(valor: number) {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export function formatarData(data: string) {
  const [ano, mes, dia] = data.split('-')
  if (!ano || !mes || !dia) return data
  const anoAtual = new Date().getFullYear().toString()
  return ano === anoAtual ? `${dia}/${mes}` : `${dia}/${mes}/${ano.slice(2)}`
}
