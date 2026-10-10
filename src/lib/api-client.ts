type OpcoesApiClient = {
  baseUrl: string
  obterToken: () => Promise<string | null>
  fetcher?: typeof fetch
}

type CorpoErro = {
  erro?: string
  message?: string
}

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export function criarApiClient({ baseUrl, obterToken, fetcher = fetch }: OpcoesApiClient) {
  const base = baseUrl.replace(/\/$/, '')

  async function requisitar<T>(caminho: string, init: RequestInit = {}) {
    const token = await obterToken()
    if (!token) throw new ApiError(401, 'Sessão expirada')

    const headers = new Headers(init.headers)
    headers.set('Authorization', `Bearer ${token}`)
    if (init.body) headers.set('Content-Type', 'application/json')

    const resposta = await fetcher(
      new Request(`${base}${caminho.startsWith('/') ? caminho : `/${caminho}`}`, {
        ...init,
        headers,
      }),
    )

    if (!resposta.ok) {
      const corpo = await resposta.clone().json().catch(() => null) as CorpoErro | null
      throw new ApiError(
        resposta.status,
        corpo?.erro ?? corpo?.message ?? 'Não foi possível concluir a solicitação',
      )
    }

    if (resposta.status === 204) return undefined as T
    return await resposta.json() as T
  }

  return {
    get: <T>(caminho: string) => requisitar<T>(caminho),
    post: <T>(caminho: string, corpo?: unknown) =>
      requisitar<T>(caminho, {
        method: 'POST',
        body: corpo === undefined ? undefined : JSON.stringify(corpo),
      }),
    patch: <T>(caminho: string, corpo?: unknown) =>
      requisitar<T>(caminho, {
        method: 'PATCH',
        body: corpo === undefined ? undefined : JSON.stringify(corpo),
      }),
    delete: <T = void>(caminho: string) => requisitar<T>(caminho, { method: 'DELETE' }),
  }
}

export type ApiClient = ReturnType<typeof criarApiClient>
