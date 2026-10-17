# Cloudflare Pages Functions — proxy reverso

> Substitua todos os marcadores `{{...}}`. Se a fonte não afirma algo, escreva `NÃO DOCUMENTADO` — nunca invente. Todo número vem acompanhado da referência que o afirma.

## Contrato de entrada

Pages Functions usa roteamento por arquivo dentro de uma pasta `functions/` na raiz do projeto
(Context7 `/llmstxt/developers_cloudflare_workers_llms_txt`,
`https://developers.cloudflare.com/pages/functions/routing/index.md`, citado via
`wrangler pages functions build [DIRECTORY]` — `DIRECTORY` default `functions`). O projeto atual
não tem pasta `functions/` nem `wrangler.toml`/`wrangler.json` no repositório (`ls`/`find`
rodados nesta sessão não encontraram nenhum dos dois) — a configuração do projeto Cloudflare
Pages hoje é só pelo painel (confirma `DEPLOY.md`: build conectado ao GitHub, env vars no
painel).

Para escrever uma função que proxya requisições para outro host, o padrão genérico de Workers
(Context7, `https://developers.cloudflare.com/workers/examples/bulk-origin-proxy/index`):

```typescript
export default {
  async fetch(request): Promise<Response> {
    const url = new URL(request.url)
    url.hostname = "destino.exemplo.com"
    return fetch(url.toString(), request)
  },
} satisfies ExportedHandler
```

Em Pages Functions, o equivalente é `export function onRequest(context)` (ou
`onRequestGet`/`onRequestPost` por verbo) dentro do arquivo roteado. A sintaxe exata do nome de
arquivo para rota "pega tudo" (`[[param]].js`/`.ts`) não veio com conteúdo literal nas páginas
que o Context7 devolveu nesta consulta (só o link para
`https://developers.cloudflare.com/pages/functions/routing/index.md`, sem o corpo) — **NÃO
DOCUMENTADO por esta fonte**; é conhecimento amplamente estável e replicado (convenção pública
estabelecida do produto), mas não foi confirmado por citação literal nesta ingestão. Fica como
lacuna para confirmar lendo a página diretamente antes de escrever a task de implementação.

## Contrato de saída

Um Worker/Function pode reconstruir a `Response` recebida do `fetch()` upstream e devolvê-la
como está, incluindo headers — inclusive `Set-Cookie` (exemplo do Context7,
`https://developers.cloudflare.com/workers/examples/ab-testing/index`, usa exatamente
`res = new Response(res.body, res)` seguido de `res.headers.append('Set-Cookie', ...)`,
confirmando que `Set-Cookie` sobrevive à reconstrução da `Response`).

Comportamento do navegador diante do `Set-Cookie` encaminhado por um proxy que roda no MESMO
domínio do app: **NÃO DOCUMENTADO** pela fonte consultada nesta sessão (é comportamento do
navegador, não do Cloudflare) — ver análise e risco em `base/neon-auth-sessao-cookie.md`.

## Limites e cotas

NÃO DOCUMENTADO nesta ingestão (não pesquisado: limites de CPU/tempo de execução de Pages
Functions, tamanho máximo de corpo proxiado). Não é um dado crítico para uma rota de
autenticação (payloads pequenos), mas fica como lacuna.

## Erros conhecidos e tratamento

Nota de migração do Context7
(`https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/index`):
no produto **Workers com static assets** (sucessor mais novo), o Worker só roda antes dos
assets estáticos se `assets.run_worker_first: true` for configurado — do contrário os assets
estáticos são servidos primeiro. Essa nota é explicitamente sobre o produto novo (Workers +
static assets, com `wrangler.toml`/`wrangler.json`); o projeto atual usa o produto **Pages**
clássico (confirmado por `DEPLOY.md` e `CLAUDE.md`: "Cloudflare Pages", projeto conectado ao
GitHub, sem `wrangler.toml`). No Pages clássico, Pages Functions já roda antes dos assets
estáticos por padrão (comportamento histórico do produto) — mas isso não veio citado
literalmente nesta consulta ao Context7; fica como ponto a confirmar na doc de routing antes de
assumir que nenhuma configuração extra é necessária.

## Riscos para a nossa implementação

- O projeto não tem hoje nenhuma pasta `functions/` nem arquivo de config do Wrangler — a F3
  precisa decidir se essa pasta nasce na raiz do repo (convenção padrão) e se alguma mudança no
  comando de build/deploy do Pages é necessária para o Cloudflare reconhecer as novas Functions
  (hoje o deploy do frontend é 100% automático via push, conforme `DEPLOY.md`; não documentado
  se a introdução de `functions/` exige qualquer configuração adicional no painel do Pages).
- A rota do proxy precisa coexistir com o roteamento do TanStack Router do SPA (rotas como
  `/login`, `/cadastro` já existem no cliente) — o caminho escolhido para o proxy (ex.
  `/auth/*`) não pode colidir com nenhuma rota do app.
- CSP do frontend (`scripts/gerar-headers-producao.mjs`) hoje inclui o host do Neon Auth em
  `connect-src`; com o proxy, as chamadas passam a ser para o próprio domínio (`'self'`), o que
  simplifica a CSP mas exige atualizar esse gerador.

## Fonte

- Context7 `/llmstxt/developers_cloudflare_workers_llms_txt`:
  `https://developers.cloudflare.com/workers/examples/bulk-origin-proxy/index`,
  `https://developers.cloudflare.com/workers/examples/modify-request-property/index`,
  `https://developers.cloudflare.com/workers/examples/cors-header-proxy/index`,
  `https://developers.cloudflare.com/workers/examples/ab-testing/index`,
  `https://developers.cloudflare.com/workers/wrangler/commands/pages/index`,
  `https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/index`,
  `https://developers.cloudflare.com/pages/llms.txt` (índice de Pages Functions) — consultado em
  2026-10-16
- `DEPLOY.md`, `CLAUDE.md`, busca de `functions/`/`wrangler.toml` no repositório (lidos nesta
  sessão, 2026-10-16)
