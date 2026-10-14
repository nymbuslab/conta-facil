/** Paginação por cursor (keyset) compartilhada entre a Function e o SPA: as funções aqui são
 * puras e usam só APIs presentes nos dois ambientes (btoa/atob), então o mesmo cursor que o
 * cliente recebe volta intacto na próxima página. */

export const LIMITE_PADRAO = 20
export const LIMITE_MAXIMO = 100

/** Posição de continuação: a última linha já entregue, por (criadoEm, id). O id desempata
 * linhas com o mesmo instante de criação, garantindo uma ordem estável. */
export interface Cursor {
  criadoEm: string
  id: string
}

export interface Pagina<T> {
  itens: T[]
  proximoCursor: string | null
}

export function normalizarLimite(valor: unknown, padrao = LIMITE_PADRAO): number {
  const numero = Number(valor)
  if (!Number.isFinite(numero) || numero < 1) return padrao
  return Math.min(LIMITE_MAXIMO, Math.trunc(numero))
}

export function codificarCursor(cursor: Cursor): string {
  return btoa(JSON.stringify(cursor))
}

export function decodificarCursor(valor: string): Cursor | null {
  try {
    const dados = JSON.parse(atob(valor)) as Partial<Cursor>
    if (typeof dados?.criadoEm === 'string' && typeof dados?.id === 'string') {
      return { criadoEm: dados.criadoEm, id: dados.id }
    }
    return null
  } catch {
    return null
  }
}

/** Monta a resposta de uma página a partir de `limite + 1` linhas buscadas: se a linha extra
 * veio, ainda existe mais de uma página, e o item de corte vira o cursor da próxima. */
export function montarPagina<T>(
  linhas: T[],
  limite: number,
  paraCursor: (item: T) => Cursor,
): Pagina<T> {
  const temMais = linhas.length > limite
  const itens = temMais ? linhas.slice(0, limite) : linhas
  const ultimo = itens.at(-1)
  const proximoCursor = temMais && ultimo ? codificarCursor(paraCursor(ultimo)) : null
  return { itens, proximoCursor }
}

/** Acrescenta os parâmetros de consulta à URL, ignorando os indefinidos/vazios. */
export function montarUrl(caminho: string, parametros: Record<string, string | number | undefined>): string {
  const busca = new URLSearchParams()
  for (const [chave, valor] of Object.entries(parametros)) {
    if (valor === undefined || valor === '') continue
    busca.set(chave, String(valor))
  }
  const query = busca.toString()
  return query ? `${caminho}?${query}` : caminho
}
