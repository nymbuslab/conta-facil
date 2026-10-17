# Neon Auth — sessão via cookie cross-origin

> Substitua todos os marcadores `{{...}}`. Se a fonte não afirma algo, escreva `NÃO DOCUMENTADO` — nunca invente. Todo número vem acompanhado da referência que o afirma.

## Contrato de entrada

O app usa `@neondatabase/auth` (`createAuthClient(authUrl, { adapter: BetterAuthReactAdapter() })`),
que por baixo delega para `better-auth/react`'s `createAuthClient({ baseURL: url, ...betterAuthOptions })`
(`node_modules/@neondatabase/auth/dist/better-auth-react-adapter-DMizSZtB.mjs:2,12,38`). O cliente
Better Auth faz fetch cross-origin, com cookies (`credentials: 'include'` é o padrão documentado do
cliente Better Auth) para o host de `NEON_AUTH_BASE_URL` — no nosso caso
`https://ep-shiny-snow-b4twxw1g.neonauth.c-6.us-east-2.aws.neon.tech` (produção,
`.env.local:NEON_AUTH_BASE_URL`), diferente do domínio do app
(`https://contafacil.nymbuslab.com.br`).

`entrar()` chama `clienteAtual.signIn.email({ email, password: senha })`
(`src/state/auth-context.tsx:121-123`) sem passar `rememberMe`.

## Contrato de saída

Segundo a doc do Better Auth (Context7 `/better-auth/better-auth`,
`docs/content/docs/authentication/email-password.mdx`): `signIn.email` aceita `rememberMe?:
boolean` com **default `true`**. "If false, the user will be signed out when closing the
browser." Como o app nunca passa esse campo, toda sessão já nasce pedindo persistência (não é
um cookie de sessão/efêmero).

`setSessionCookie` (Better Auth, `packages/better-auth/src/cookies/index.ts`, via Context7):
quando `dontRememberMe` é falso (nosso caso, por default), o cookie de sessão é gravado com
`maxAge: ctx.context.sessionConfig.expiresIn` — não documentado neste projeto qual é o valor de
`expiresIn` configurado no branch do Neon (Managed Auth não expõe esse config no código do
projeto; é config gerenciada pelo Neon). Default do Better Auth (doc `session-management.mdx`,
Context7) é `60 * 60 * 24 * 7` (7 dias), mas **NÃO DOCUMENTADO** se o Neon Managed Auth usa esse
mesmo default.

Verificação empírica feita nesta sessão: `curl -sI` contra
`https://ep-shiny-snow-b4twxw1g.neonauth.c-6.us-east-2.aws.neon.tech/get-session` com
`Origin: https://contafacil.nymbuslab.com.br` devolve `access-control-allow-origin:
https://contafacil.nymbuslab.com.br` e `access-control-allow-credentials: true` — confirma que o
CORS já está configurado para aceitar requisição cross-origin com credenciais do domínio do app.
Não foi possível localizar a rota correta do Better Auth para inspecionar um `Set-Cookie` real
(paths testados: `/get-session`, `/auth/get-session`, `/api/auth/get-session`, `/session`,
`/api/get-session`, `/v1/get-session` — todos 404) sem autenticar de verdade, e autenticar com
uma conta real neste host remoto está fora do escopo de uma leitura passiva de diagnóstico.

## Limites e cotas

NÃO DOCUMENTADO (específico do projeto): `expiresIn` e `updateAge` da sessão no Neon Managed
Auth deste branch. Plugin JWT da tabela de suporte da skill `neon-auth`
(`.claude/skills/neon-auth/SKILL.md`, seção "Plugin support"): "JWT | Supported | EdDSA
(Ed25519), 15-minute expiry, no custom claims." — ou seja, o token Bearer usado nas chamadas à
Function expira em 15 minutos e precisa ser renovado via `.token()`, que por sua vez depende da
sessão (cookie) estar válida no momento da renovação.

## Erros conhecidos e tratamento

Da skill local `.claude/skills/neon-auth/SKILL.md` (seção "Trusted domains"): "Keep the wrapper,
callback route, and middleware. Do not reimplement that flow, and do not promise third-party
cookies in every browser." — é uma admissão explícita da própria skill/documentação de que a
persistência via cookie cross-origin não é garantida em todo navegador.

Da seção "Cross-subdomain vs bearer JWT" da mesma skill (`references/managed-auth.md:146-148`):
"`cookies.domain` shares session cookies across subdomains of one parent domain [...]. That is
not cookie sharing across unrelated frontend and backend hosts. A Neon Function authenticates
with `Authorization: Bearer`. With Managed Auth, verify against the injected JWKS." — confirma
que a Function (`src/functions/api/`) autentica por JWT Bearer, **não** depende do cookie de
sessão do Auth; o cookie cross-origin só é usado pelo próprio cliente Better Auth para descobrir
se há sessão (`useSession()`) e para mintar um novo JWT (`.token()`).

## Riscos para a nossa implementação

- Não há, nos documentos consultados, menção a domínio customizado para o **serviço de Auth**
  gerenciado do Neon (diferente de domínio customizado para Functions, que tem ferramentas MCP
  dedicadas: `register_functions_custom_domain` etc. — não existe equivalente para Auth na
  listagem de tools MCP do Neon disponível nesta sessão). Isso é o que torna necessário um proxy
  reverso próprio em vez de uma configuração nativa do Neon.
- O atributo `Domain` do `Set-Cookie` da sessão real não foi verificado empiricamente (ver acima).
  Se o Neon Auth setar um `Domain` explícito (o que pareceria improvável, já que o serviço não
  conhece o domínio do app de antemão), um proxy reverso simples (sem reescrever esse atributo)
  não resolveria o problema — o navegador rejeitaria o `Set-Cookie` por `Domain` não bater com o
  host que respondeu. Isso vira pergunta/decisão na F2 e, de qualquer forma, precisa ser
  confirmado durante a implementação (inspecionar os headers de resposta reais de um
  `sign-in`/`get-session` autenticado, via DevTools ou Playwright, contra a branch `test`, do
  jeito que o projeto já faz noutras validações — ver `base/deploy-interno.md`).
- O token Bearer da Function expira em 15 min e sua renovação (`.token()`) ainda depende do
  cookie de sessão — ou seja, mesmo com o proxy resolvendo o problema do cookie "lembrar
  sessão entre visitas", a renovação do JWT dentro de uma mesma visita longa também passa a
  depender do mesmo cookie, agora primeiro-parte via proxy.

## Fonte

- `node_modules/@neondatabase/auth/dist/better-auth-react-adapter-DMizSZtB.mjs` (lido nesta sessão)
- `src/state/auth-context.tsx` (lido nesta sessão)
- Context7 `/better-auth/better-auth`: `docs/content/docs/authentication/email-password.mdx`,
  `docs/content/docs/concepts/session-management.mdx`, `packages/better-auth/src/cookies/index.ts`
  — consultado em 2026-10-16
- `.claude/skills/neon-auth/SKILL.md` e `.claude/skills/neon-auth/references/managed-auth.md`
  (skill local instalada no projeto)
- Verificação empírica via `curl` contra o host de produção do Neon Auth, em 2026-10-16
