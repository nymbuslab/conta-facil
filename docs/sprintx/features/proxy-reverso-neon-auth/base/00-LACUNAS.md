# Lacunas

- `neon-auth-sessao-cookie.md`: `expiresIn`/`updateAge` reais da sessão configurados no branch
  Neon deste projeto — não documentado em nenhuma fonte consultada (é config gerenciada pelo
  Neon, não exposta no código do projeto). Procurado em: código do projeto (`neon.ts`,
  `auth-context.tsx`), skill `neon-auth` local, Context7 Better Auth.
- `neon-auth-sessao-cookie.md`: atributo `Domain` real do `Set-Cookie` de uma sessão autenticada
  do Neon Auth — não verificado empiricamente (precisaria autenticar de verdade contra o host
  remoto, fora do escopo de uma leitura passiva de diagnóstico). Procurado em: `curl` contra o
  host de produção do Neon Auth (6 caminhos testados, todos 404 sem autenticação real).
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
- `deploy-interno.md`: mecanismo exato pelo qual o Neon Auth valida a allowlist de domínio
  confiável (`add_auth_trusted_domain`) — por header `Origin`, `Referer`, ou outro — não
  documentado nos arquivos consultados nesta sessão.
