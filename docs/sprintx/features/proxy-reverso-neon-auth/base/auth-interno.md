# Autenticação interna do app — auth-context e configuração de build

> Substitua todos os marcadores `{{...}}`. Se a fonte não afirma algo, escreva `NÃO DOCUMENTADO` — nunca invente. Todo número vem acompanhado da referência que o afirma.

## Contrato de entrada

`src/state/auth-context.tsx:52-65` (`obterClientePadrao`): lê `import.meta.env.VITE_NEON_AUTH_BASE_URL`
e lança `Error('VITE_NEON_AUTH_BASE_URL nao definida')` se ausente; cria o client com
`createAuthClient(authUrl, { adapter: BetterAuthReactAdapter() })`.

`vite.config.ts:27-36`: injeta `import.meta.env.VITE_NEON_AUTH_BASE_URL` via `define`, com
fallback `env.VITE_NEON_AUTH_BASE_URL ?? env.NEON_AUTH_BASE_URL` — ou seja, tanto faz a env var
vir prefixada com `VITE_` ou não, o `vite.config.ts` já resolve. Isso significa que trocar o
valor efetivo de `NEON_AUTH_BASE_URL`/`VITE_NEON_AUTH_BASE_URL` (ex. para apontar para o caminho
do proxy em vez do host direto do Neon) é só uma mudança de valor de env var, sem mexer no
`vite.config.ts` em si — **desde que o valor novo seja uma URL absoluta válida**
(`new URL(authBaseUrl)` é chamado em `vite.config.ts:29-30` dentro de `headersDeProducao`).

`src/lib/api-client.ts:37-43`: `baseUrl` da Function vem de
`VITE_NEON_FUNCTION_API_BASE_URL`, independente do Auth — não afetado por esta feature.

## Contrato de saída

`extrairToken` (`src/state/auth-context.tsx:73-93`) aceita dois formatos de resposta
(`{ data: { token } }` e `{ data: { session: { token } } }`) — comentário no código (linhas
84-89) já documenta que esse é o shape de onde a própria lib lê o JWT internamente
(`getJWTToken`, via header `set-auth-jwt`). Não depende do domínio do Auth, só do formato da
resposta JSON — o proxy não deveria alterar esse contrato, desde que repasse o corpo da resposta
sem modificação.

`status` do `AuthContext` (`src/state/auth-context.tsx:113-119`) é derivado de
`sessao.isPending`/`sessao.data`/`sessao.error`, vindos de `clienteAtual.useSession()` — hook do
cliente Better Auth, cuja implementação não está neste repositório (vem de `better-auth/react`
via `@neondatabase/auth`, ver `base/neon-auth-sessao-cookie.md`).

## Limites e cotas

Não aplicável a este arquivo — ver `base/neon-auth-sessao-cookie.md` para os limites do próprio
Auth (expiração de JWT, etc.).

## Erros conhecidos e tratamento

`src/routes/__root.tsx` (`ConteudoPosCarregamento`, lido em sessão anterior desta mesma
conversa): `status === 'erro'` mostra tela com botão "Tentar novamente"
(`recarregarSessao()` → `sessao.refetch?.()`). Esse fluxo não muda com o proxy — continua
cobrindo falha de rede/verificação, só que agora contra o caminho do proxy em vez do host direto.

## Riscos para a nossa implementação

- Qualquer mudança em `VITE_NEON_AUTH_BASE_URL` precisa ser replicada nos TRÊS lugares que o
  `DEPLOY.md` já documenta como tendo que andar juntos: env var de build do Cloudflare Pages
  (painel), `.env.local`/`.env.test.local` (dev local) e a validação de domínio confiável do
  Neon Auth (`add_auth_trusted_domain` — ver `base/deploy-interno.md`). Esquecer um deles
  reproduz exatamente o tipo de incidente que `DEPLOY.md` já registra para outras env vars
  (`VITE_NEON_AUTH_BASE_URL` ausente = tela em branco).
- Se o valor de `VITE_NEON_AUTH_BASE_URL` passar a ser um caminho relativo ao próprio domínio
  do app (ex. `/auth`) em vez de uma URL absoluta de outro host, `new URL(authBaseUrl)` em
  `vite.config.ts:30` quebra (`new URL` exige URL absoluta ou uma `base` — não é o caso aqui).
  A F3 precisa decidir se o valor da env var continua sendo uma URL absoluta
  (`https://contafacil.nymbuslab.com.br/auth`) — o que preserva o contrato atual do
  `vite.config.ts` sem mudança — em vez de um caminho relativo.

## Fonte

- `src/state/auth-context.tsx` (lido nesta sessão)
- `vite.config.ts` (lido nesta sessão)
- `src/lib/api-client.ts` (lido em interação anterior desta mesma conversa)
- `src/routes/__root.tsx` (lido e editado em interação anterior desta mesma conversa)
