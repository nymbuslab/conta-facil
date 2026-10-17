# Lacunas

- `neon-auth-sessao-cookie.md`: `expiresIn`/`updateAge` reais da sessão configurados no branch
  Neon deste projeto — não documentado em nenhuma fonte consultada (é config gerenciada pelo
  Neon, não exposta no código do projeto). Procurado em: código do projeto (`neon.ts`,
  `auth-context.tsx`), skill `neon-auth` local, Context7 Better Auth.
- ~~`neon-auth-sessao-cookie.md`: atributo `Domain` real do `Set-Cookie`~~ **RESOLVIDA** na
  verificação de Preview (2026-10-17): login real via script HTTP com a conta de teste do
  pentest confirmou `Set-Cookie` **sem** atributo `Domain` (host-only) e com `Partitioned`
  (CHIPS) — exatamente o caso favorável previsto. Achado colateral: a URL correta do Neon Auth
  inclui o path `/neondb/auth` (não só o host), confirmado em `.env.local`/`.env.test.local`; o
  valor usado inicialmente no `NEON_AUTH_UPSTREAM_URL` do painel estava sem esse path e precisou
  de correção.
- `neon-auth-sessao-cookie.md`: suporte a domínio customizado para o serviço de Auth gerenciado
  do Neon (diferente de domínio customizado de Functions, que tem MCP tools dedicadas) — não
  encontrado na listagem de MCP tools do Neon disponível nesta sessão, nem na skill `neon-auth`
  local, nem no `managed-auth.md`.
- `cloudflare-pages-functions-proxy.md`: sintaxe exata de arquivo de rota "pega tudo"
  (`[[param]].js`) do roteamento de Pages Functions — Context7 devolveu só o link da página
  (`https://developers.cloudflare.com/pages/functions/routing/index.md`), sem o conteúdo
  literal. Procurado em: Context7 `/llmstxt/developers_cloudflare_workers_llms_txt`, 2 consultas
  com termos diferentes.
- `cloudflare-pages-functions-proxy.md`: limites de CPU/tempo de execução e tamanho máximo de
  corpo proxiado em Pages Functions — não pesquisado nesta ingestão.
- `cloudflare-pages-functions-proxy.md`: se o produto Pages clássico (usado neste projeto) exige
  alguma configuração adicional no painel para reconhecer uma pasta `functions/` nova — não
  confirmado por citação literal da doc de routing.
- ~~`deploy-interno.md`: mecanismo exato de validação da allowlist de domínio confiável~~
  **RESOLVIDA** (2026-10-17): confirmado por teste real que é o header `Origin` — POST
  `/sign-in/email` pelo proxy devolveu `403 {"code":"INVALID_ORIGIN"}` até o domínio de preview
  ser registrado via `add_auth_trusted_domain` na branch `test`; depois disso o login funcionou
  (200). Para produção isso não deveria exigir nada novo, pois a origem continua sendo
  `contafacil.nymbuslab.com.br`, já confiável hoje.
