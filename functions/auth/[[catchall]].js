/** Proxy reverso para o Neon Auth: repassa tudo sob /auth/* para o host real do servico
 * gerenciado (context.env.NEON_AUTH_UPSTREAM_URL). Existe para o Set-Cookie da sessao nascer
 * no mesmo dominio do app (contafacil.nymbuslab.com.br) em vez de um dominio diferente
 * (*.neonauth.c-6.us-east-2.aws.neon.tech) — navegadores que bloqueiam cookie de terceiros por
 * padrao (Brave sempre, mobile com frequencia) nunca persistiam a sessao sem isso. */
export async function onRequest(context) {
  const upstreamBase = context.env.NEON_AUTH_UPSTREAM_URL
  if (!upstreamBase) {
    return new Response('Auth upstream nao configurado', { status: 502 })
  }

  const urlOriginal = new URL(context.request.url)
  const segmentos = context.params.catchall ?? []
  const lista = Array.isArray(segmentos) ? segmentos : [segmentos]
  // Cada segmento e url-encoded antes de juntar: um segmento tipo "https:" ou "evil.com"
  // vindo da URL nunca pode virar um `new URL()` absoluto que ignora `base` — sem isso, um path
  // como /auth/https://evil.com/x reconstruiria "https://evil.com/x" e faria deste proxy um
  // proxy aberto para qualquer host, repassando os headers (inclusive cookies) da requisicao
  // original. Achado de revisao de seguranca automatica, corrigido antes do primeiro deploy.
  const caminho = lista.map((segmento) => encodeURIComponent(segmento)).join('/')
  const base = new URL(`${upstreamBase.replace(/\/$/, '')}/`)
  const urlDestino = new URL(caminho, base)
  urlDestino.search = urlOriginal.search

  if (urlDestino.origin !== base.origin || !urlDestino.pathname.startsWith(base.pathname)) {
    return new Response('Caminho invalido', { status: 400 })
  }

  try {
    // redirect: 'manual' evita seguir automaticamente um redirect do upstream para outro host.
    const requisicaoEncaminhada = new Request(context.request, { redirect: 'manual' })
    const resposta = await fetch(urlDestino.toString(), requisicaoEncaminhada)
    return new Response(resposta.body, resposta)
  } catch {
    return new Response('Auth upstream indisponivel', { status: 502 })
  }
}
