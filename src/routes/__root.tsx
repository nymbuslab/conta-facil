import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createRootRouteWithContext, Navigate, Outlet, useRouterState } from '@tanstack/react-router'

import { BottomNav } from '@/components/bottom-nav'
import { SplashScreen } from '@/components/splash-screen'
import { TopoMarca } from '@/components/topo-marca'
import { Button } from '@/components/ui/button'
import type { ApiClient } from '@/lib/api-client'
import { AuthProvider, useAuth, type ClienteAuth } from '@/state/auth-context'
import { CaixinhasProvider } from '@/state/caixinhas-context'
import { LancamentosProvider } from '@/state/lancamentos-context'

export type ContextoRoteador = {
  clienteAuth?: ClienteAuth
  clienteLancamentos?: ApiClient
  clienteCaixinhas?: ApiClient
}

const TEMPO_MINIMO_SPLASH_MS = 400

function ConteudoRaiz() {
  const { status, recarregarSessao } = useAuth()
  const [splashVisivel, setSplashVisivel] = useState(true)
  const [splashSaindo, setSplashSaindo] = useState(false)
  const inicioSplashRef = useRef(0)

  /** Reage a toda entrada ou saida de 'carregando', nao so a primeira: se a sessao falhar e o
   * usuario clicar "Tentar novamente" (recarregarSessao), o status pode voltar a 'carregando'
   * depois de ja ter saido — sem esse reset a splash nunca reaparece e a tela fica em branco
   * enquanto a nova verificacao roda. Tambem impoe um tempo minimo visivel: numa sessao ja
   * autenticada no navegador, a verificacao pode resolver em poucos milissegundos, e sem esse
   * piso a splash so pisca na tela em vez de ser uma transicao intencional. */
  useEffect(() => {
    if (status === 'carregando') {
      inicioSplashRef.current = Date.now()
      setSplashVisivel(true)
      setSplashSaindo(false)
      return
    }

    const decorrido = Date.now() - inicioSplashRef.current
    const espera = Math.max(0, TEMPO_MINIMO_SPLASH_MS - decorrido)
    const timer = setTimeout(() => setSplashSaindo(true), espera)
    return () => clearTimeout(timer)
  }, [status])

  /** Efeito separado do que dispara o fade: se os dois dividissem o mesmo useEffect, o
   * setSplashSaindo(true) ali dentro faria esse efeito rodar de novo por causa da propria
   * mudanca de estado, e a limpeza dessa nova rodada cancelaria o setTimeout antes de disparar
   * — splashVisivel nunca vira false e a camada fixed/z-50 fica bloqueando clique pra sempre,
   * mesmo invisivel (achado real: usuario testando localmente perdeu o mouse na pagina). */
  useEffect(() => {
    if (!splashSaindo) return
    const timer = setTimeout(() => setSplashVisivel(false), 250)
    return () => clearTimeout(timer)
  }, [splashSaindo])

  return (
    <>
      {status !== 'carregando' && <ConteudoPosCarregamento status={status} recarregarSessao={recarregarSessao} />}
      {splashVisivel && <SplashScreen saindo={splashSaindo} />}
    </>
  )
}

function ConteudoPosCarregamento({
  status,
  recarregarSessao,
}: {
  status: Exclude<ReturnType<typeof useAuth>['status'], 'carregando'>
  recarregarSessao: ReturnType<typeof useAuth>['recarregarSessao']
}) {
  const caminho = useRouterState({ select: (state) => state.location.pathname })
  const rotaPublica =
    caminho === '/login' ||
    caminho === '/cadastro' ||
    caminho === '/esqueci-senha' ||
    caminho === '/redefinir-senha'

  if (status === 'erro') {
    return (
      <>
        {!rotaPublica && <TopoMarca />}
        <main
          className={
            rotaPublica
              ? 'flex min-h-dvh items-center justify-center px-4'
              : 'flex min-h-[calc(100dvh-48px)] items-center justify-center px-4'
          }
        >
          <div className="flex max-w-sm flex-col items-center gap-4 text-center">
            <p role="alert" className="text-sm text-muted-foreground">
              Não foi possível verificar sua sessão. Verifique sua conexão e tente novamente.
            </p>
            <Button onClick={() => void recarregarSessao()}>Tentar novamente</Button>
          </div>
        </main>
      </>
    )
  }

  if (status === 'anonimo' && !rotaPublica) {
    return <Navigate to="/login" replace />
  }

  if (status === 'autenticado' && rotaPublica) {
    return <Navigate to="/" replace />
  }

  return (
    <>
      {!rotaPublica && <TopoMarca />}
      <Outlet />
      {status === 'autenticado' ? <BottomNav /> : null}
    </>
  )
}

/** Remonta os providers de dados inteiros a cada troca de usuario (incluindo
 * anonimo <-> autenticado). Sem isso, uma mutacao ou recarga em voo iniciada pela sessao
 * anterior poderia aplicar setState sobre o estado exibido para o usuario que entrou depois —
 * remontar faz qualquer setState tardio da instancia antiga cair num componente ja
 * desmontado, que o React simplesmente ignora. */
function ProvedoresDeDados({
  clienteLancamentos,
  clienteCaixinhas,
  children,
}: {
  clienteLancamentos?: ApiClient
  clienteCaixinhas?: ApiClient
  children: ReactNode
}) {
  const { usuario } = useAuth()
  const chaveUsuario = usuario?.id ?? 'anonimo'

  return (
    <LancamentosProvider key={chaveUsuario} cliente={clienteLancamentos}>
      <CaixinhasProvider key={chaveUsuario} cliente={clienteCaixinhas}>
        {children}
      </CaixinhasProvider>
    </LancamentosProvider>
  )
}

function LayoutRaiz() {
  const { clienteAuth, clienteLancamentos, clienteCaixinhas } = Route.useRouteContext()

  return (
    <AuthProvider cliente={clienteAuth}>
      <ProvedoresDeDados clienteLancamentos={clienteLancamentos} clienteCaixinhas={clienteCaixinhas}>
        <ConteudoRaiz />
      </ProvedoresDeDados>
    </AuthProvider>
  )
}

export const Route = createRootRouteWithContext<ContextoRoteador>()({
  component: LayoutRaiz,
})
