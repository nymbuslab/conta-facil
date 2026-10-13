import { createAuthClient } from '@neondatabase/auth'
import { BetterAuthReactAdapter } from '@neondatabase/auth/react/adapters'
import { createContext, useCallback, useContext, type ReactNode } from 'react'

type Usuario = {
  id: string
  nome: string
  email: string
}

type ResultadoAuth = {
  data?: unknown
  error?: { message?: string } | null
}

type SessaoAuth = {
  data: {
    user: { id: string; name?: string | null; email: string }
    session: unknown
  } | null
  error: unknown
  isPending: boolean
  refetch?: () => unknown
}

export type ClienteAuth = {
  useSession: () => SessaoAuth
  signIn: {
    email: (dados: { email: string; password: string }) => Promise<ResultadoAuth>
  }
  signUp: {
    email: (dados: { name: string; email: string; password: string }) => Promise<ResultadoAuth>
  }
  signOut: () => Promise<ResultadoAuth>
  token: () => Promise<unknown>
}

type AuthContextValue = {
  status: 'carregando' | 'autenticado' | 'anonimo' | 'erro'
  usuario: Usuario | null
  entrar: (email: string, senha: string) => Promise<void>
  cadastrar: (nome: string, email: string, senha: string) => Promise<void>
  sair: () => Promise<void>
  obterToken: () => Promise<string | null>
  recarregarSessao: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

let clientePadrao: ClienteAuth | null = null

function obterClientePadrao() {
  if (clientePadrao) return clientePadrao

  const authUrl = import.meta.env.VITE_NEON_AUTH_BASE_URL
  if (!authUrl) {
    throw new Error('VITE_NEON_AUTH_BASE_URL nao definida')
  }

  clientePadrao = createAuthClient(authUrl, {
    adapter: BetterAuthReactAdapter(),
  }) as unknown as ClienteAuth

  return clientePadrao
}

function verificarErro(resultado: ResultadoAuth) {
  if (resultado.error) {
    throw new Error(resultado.error.message ?? 'Nao foi possivel concluir a autenticacao')
  }
}

function extrairToken(resultado: unknown) {
  if (!resultado || typeof resultado !== 'object') return null

  const data = 'data' in resultado ? resultado.data : null
  if (!data || typeof data !== 'object') return null

  // Cliente padrao (metodo token() do plugin JWT): { data: { token } }.
  if ('token' in data && typeof data.token === 'string') {
    return data.token
  }

  // Objeto de sessao do getSession(): { data: { session: { token }, user } }. E o shape de onde
  // a propria lib extrai o JWT internamente (getJWTToken le session.data.session.token, o token
  // injetado pelo header set-auth-jwt). Mantido como fallback defensivo porque o adapter em
  // runtime ja devolveu esse formato a partir de token().
  if ('session' in data && data.session && typeof data.session === 'object' && 'token' in data.session) {
    return typeof data.session.token === 'string' ? data.session.token : null
  }

  return null
}

export function AuthProvider({
  children,
  cliente,
}: {
  children: ReactNode
  cliente?: ClienteAuth
}) {
  const clienteAtual = cliente ?? obterClientePadrao()
  const sessao = clienteAtual.useSession()

  const usuario = sessao.data
    ? {
        id: sessao.data.user.id,
        nome: sessao.data.user.name || sessao.data.user.email,
        email: sessao.data.user.email,
      }
    : null

  const status: AuthContextValue['status'] = sessao.isPending
    ? 'carregando'
    : usuario
      ? 'autenticado'
      : sessao.error
        ? 'erro'
        : 'anonimo'

  const entrar = useCallback(async (email: string, senha: string) => {
    verificarErro(await clienteAtual.signIn.email({ email, password: senha }))
  }, [clienteAtual])

  const cadastrar = useCallback(async (nome: string, email: string, senha: string) => {
    verificarErro(await clienteAtual.signUp.email({ name: nome, email, password: senha }))
  }, [clienteAtual])

  const sair = useCallback(async () => {
    verificarErro(await clienteAtual.signOut())
  }, [clienteAtual])

  const obterToken = useCallback(async () => {
    return extrairToken(await clienteAtual.token())
  }, [clienteAtual])

  const recarregarSessao = useCallback(async () => {
    await sessao.refetch?.()
  }, [sessao])

  return (
    <AuthContext.Provider
      value={{ status, usuario, entrar, cadastrar, sair, obterToken, recarregarSessao }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const contexto = useContext(AuthContext)

  if (!contexto) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }

  return contexto
}
