type OpcoesApiClient = {
  baseUrl: string
  obterToken: () => Promise<string | null>
  fetcher?: typeof fetch
  gerarChave?: () => string
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

const MENSAGEM_SESSAO = 'Sua sessão expirou. Entre novamente.'

/** Traduz a falha tecnica para uma mensagem exibivel: distingue sessao expirada
 * (401/403, precisa reautenticar) de queda de conexao (fetch TypeError) das demais. */
export function mensagemErroApi(falha: unknown, fallback: string): string {
  if (falha instanceof ApiError) {
    if (falha.status === 401 || falha.status === 403) return MENSAGEM_SESSAO
    return falha.message || fallback
  }
  if (falha instanceof TypeError) return 'Não foi possível conectar. Confira sua conexão.'
  if (falha instanceof Error && falha.message) return falha.message
  return fallback
}

export function criarApiClient({
  baseUrl,
  obterToken,
  fetcher = fetch,
  gerarChave = () => crypto.randomUUID(),
}: OpcoesApiClient) {
  const base = baseUrl.replace(/\/$/, '')

  async function requisitar<T>(
    caminho: string,
    init: RequestInit = {},
    repetirFalhaTransitoria = false,
  ) {
    const token = await obterToken()
    if (!token) throw new ApiError(401, 'Sessão expirada')

    const headers = new Headers(init.headers)
    headers.set('Authorization', `Bearer ${token}`)
    if (init.body) headers.set('Content-Type', 'application/json')

    const tentativas = repetirFalhaTransitoria ? 2 : 1
    let resposta: Response | null = null
    let falhaRede: unknown

    for (let tentativa = 0; tentativa < tentativas; tentativa += 1) {
      try {
        resposta = await fetcher(
          new Request(`${base}${caminho.startsWith('/') ? caminho : `/${caminho}`}`, {
            ...init,
            headers,
          }),
        )
        if (![502, 503, 504].includes(resposta.status) || tentativa === tentativas - 1) break
      } catch (erro) {
        falhaRede = erro
        if (tentativa === tentativas - 1) throw erro
      }
    }

    if (!resposta) throw falhaRede

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
    get: <T>(caminho: string) => requisitar<T>(caminho, {}, true),
    post: <T>(caminho: string, corpo?: unknown) =>
      requisitar<T>(caminho, {
        method: 'POST',
        body: corpo === undefined ? undefined : JSON.stringify(corpo),
      }),
    postIdempotente: <T>(caminho: string, corpo?: unknown) => {
      const chave = gerarChave()
      return requisitar<T>(caminho, {
        method: 'POST',
        headers: { 'Idempotency-Key': chave },
        body: corpo === undefined ? undefined : JSON.stringify(corpo),
      }, true)
    },
    patch: <T>(caminho: string, corpo?: unknown) =>
      requisitar<T>(caminho, {
        method: 'PATCH',
        body: corpo === undefined ? undefined : JSON.stringify(corpo),
      }),
    patchIdempotente: <T>(caminho: string, corpo?: unknown) =>
      requisitar<T>(caminho, {
        method: 'PATCH',
        headers: { 'Idempotency-Key': gerarChave() },
        body: corpo === undefined ? undefined : JSON.stringify(corpo),
      }, true),
    delete: <T = void>(caminho: string) => requisitar<T>(caminho, { method: 'DELETE' }),
    deleteIdempotente: <T = void>(caminho: string) =>
      requisitar<T>(caminho, { method: 'DELETE', headers: { 'Idempotency-Key': gerarChave() } }, true),
  }
}

export type ApiClient = ReturnType<typeof criarApiClient>
