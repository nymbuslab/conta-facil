# Deploy e configuração de produção do frontend/Function

> Substitua todos os marcadores `{{...}}`. Se a fonte não afirma algo, escreva `NÃO DOCUMENTADO` — nunca invente. Todo número vem acompanhado da referência que o afirma.

## Contrato de entrada

`scripts/gerar-headers-producao.mjs:1-31` (`montarCabecalhosProducao`): recebe
`{ functionBaseUrl, authBaseUrl }`, monta a CSP de produção com
`connect-src 'self' ${origemFunction} ${origemAuth}` (linha 18) e grava `dist/_headers` no
build (plugin Vite `headersDeProducao`, `vite.config.ts:13-24`, roda em `closeBundle`, só em
build de produção — `apply: 'build'`).

`neon.ts` (lido nesta sessão): config declarativa do projeto Neon — `auth: true`, uma Function
`api` com `env.FUNCTION_ALLOWED_ORIGINS` lido de `process.env`, bucket `documentos` privado.
Não há, neste arquivo, nenhuma configuração de proxy/domínio para o serviço de Auth em si —
confirma a ausência de suporte nativo já registrada em `base/neon-auth-sessao-cookie.md`.

`scripts/deploy.mjs:1-15` (constantes): `CAMINHOS_FUNCTION = ['src/functions/api/', 'neon.ts',
'src/db/']` é a lista de caminhos que o script usa para decidir se a Neon Function mudou e
precisa de `neon deploy` manual antes do push. Uma pasta nova de Pages Functions (ex.
`functions/`) **não está** nesta lista — ela não dispara o gate de "Function mudou"; o deploy do
frontend (incluindo `functions/` de Pages) já é automático via push, conforme `DEPLOY.md:5-7`.

## Contrato de saída

`DEPLOY.md:55-67` (env vars de build do Cloudflare Pages): hoje mantidas manualmente no painel
(ou via `PATCH /accounts/{id}/pages/projects/conta-facil`), não automatizadas por
`scripts/deploy.mjs`. `VITE_NEON_AUTH_BASE_URL` é uma delas; qualquer mudança no valor (para
apontar ao proxy) precisa ser replicada ali manualmente, nos dois ambientes (produção e
preview).

`DEPLOY.md:68-72` (domínio confiável do Neon Auth): `add_auth_trusted_domain` (MCP do Neon ou
console) é uma allowlist separada do `FUNCTION_ALLOWED_ORIGINS` da Function — controla para onde
o Auth aceita redirecionar/confiar como origem de `sign-up`/`sign-in`. **NÃO DOCUMENTADO** nesta
ingestão se o proxy muda o que precisa estar nessa allowlist (a origem que o Auth vê na
requisição proxiada ainda será a do domínio do app, `contafacil.nymbuslab.com.br`, já que é o
Worker que inicia o fetch upstream — mas a confirmação exata de como o Neon Auth valida essa
allowlist, por header `Origin` ou outro mecanismo, não está documentada nos arquivos consultados
nesta sessão).

## Limites e cotas

Sem números específicos de limite relevantes a esta feature além dos já citados em
`base/cloudflare-pages-functions-proxy.md` (NÃO DOCUMENTADO).

## Erros conhecidos e tratamento

`DEPLOY.md:81-99` (risco conhecido e corrigido em 2026-10-16): histórico de incidente
documentado sobre `drizzle.__drizzle_migrations` vazio em produção — não diretamente relacionado
a esta feature, mas confirma o padrão do projeto de registrar causa raiz e correção no
`DEPLOY.md` quando um processo de deploy expõe uma lacuna de configuração. A introdução do proxy
é candidata ao mesmo tipo de registro se expuser algo semelhante.

`DEPLOY.md:113-119`: a Function da branch `test` não é redeployada por nenhum script
automático — relevante porque qualquer validação desta feature contra a branch `test` (incluindo
inspecionar `Set-Cookie` real, ver `base/neon-auth-sessao-cookie.md`) deve considerar redeployar
a Function de `test` primeiro, se o teste depender dela.

## Riscos para a nossa implementação

- A introdução de `functions/` (Pages Functions) é uma mudança de infraestrutura de deploy que
  `scripts/deploy.mjs` hoje não conhece. Não é necessariamente um problema (o deploy do
  frontend já é automático via push), mas a F3 precisa decidir se vale adicionar uma checagem
  ou nota no próprio script/`DEPLOY.md` para que mudanças futuras em `functions/` sejam
  lembradas tão explicitamente quanto as da Neon Function hoje são.
- A CSP gerada por `montarCabecalhosProducao` muda de incluir o host do Neon Auth em
  `connect-src` para não precisar mais incluí-lo (já que o cliente passa a falar só com
  `'self'`) — mas só se `VITE_NEON_AUTH_BASE_URL` também mudar para o caminho do proxy. Se as
  duas mudanças ficarem dessincronizadas (CSP atualizada mas env var não, ou vice-versa), o app
  quebra silenciosamente (requisição bloqueada pela CSP) ou continua expondo a CSP antiga sem
  necessidade.
- `FUNCTION_ALLOWED_ORIGINS` (CORS da Function de lançamentos/caixinhas) é uma allowlist
  **separada** da trusted domain do Auth e não deveria precisar mudar por esta feature — a
  Function nunca fala diretamente com o host do Neon Auth.

## Fonte

- `scripts/gerar-headers-producao.mjs` (lido nesta sessão)
- `vite.config.ts` (lido nesta sessão)
- `neon.ts` (lido nesta sessão)
- `scripts/deploy.mjs` (lido nesta sessão, linhas 1-60)
- `DEPLOY.md` (lido nesta sessão, arquivo inteiro)
