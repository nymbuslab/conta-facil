function pad(numero: number) {
  return String(numero).padStart(2, '0')
}

/** Mês e ano por extenso, com a primeira letra maiúscula (ex: "Outubro de 2026"). */
export function formatarMesAno(data: Date = new Date()): string {
  const texto = data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

/** Verifica se uma data "AAAA-MM-DD" cai no mês e ano de `referencia` (hoje, por padrão). */
export function ehMesVigente(data: string, referencia: Date = new Date()): boolean {
  const [ano, mes] = data.split('-').map(Number)
  return ano === referencia.getFullYear() && mes === referencia.getMonth() + 1
}

/** Verifica se uma data "AAAA-MM-DD" já passou em relação a `referencia` (hoje, por padrão). */
export function estaVencida(data: string, referencia: Date = new Date()): boolean {
  const [ano, mes, dia] = data.split('-').map(Number)
  const vencimento = new Date(ano, mes - 1, dia)
  const hoje = new Date(referencia.getFullYear(), referencia.getMonth(), referencia.getDate())
  return vencimento < hoje
}

/** Soma meses a uma data "AAAA-MM-DD", preservando o dia quando o mês de destino o permite
 * e limitando ao último dia do mês de destino quando não permite (ex: 31/01 + 1 mês = 28 ou 29/02). */
export function adicionarMeses(data: string, meses: number): string {
  const [ano, mes, dia] = data.split('-').map(Number)
  const mesDestino = mes - 1 + meses
  const ultimoDiaMesDestino = new Date(ano, mesDestino + 1, 0).getDate()
  const referencia = new Date(ano, mesDestino, Math.min(dia, ultimoDiaMesDestino))
  return `${referencia.getFullYear()}-${pad(referencia.getMonth() + 1)}-${pad(referencia.getDate())}`
}
