# Roteamento — TanStack Router (modo código, sem file-based routing)

## Contrato de entrada

Rotas são criadas via `createRoute({ getParentRoute, path, component })` (`@tanstack/react-router` ^1.170.41, `package.json:17`) e registradas manualmente em `src/router.tsx:6` via `rootRoute.addChildren([indexRoute])`. Não há plugin de file-based routing instalado — cada rota nova precisa ser declarada num arquivo em `src/routes/` e somada manualmente ao array de `addChildren` em `src/router.tsx`.

`src/routes/__root.tsx:3-5` define a rota raiz com `createRootRoute({ component: () => <Outlet /> })` — hoje o root não renderiza nada além do `<Outlet />`, sem header nem navegação compartilhada entre rotas.

## Contrato de saída

Cada rota exporta `Route` (convenção do projeto: sempre o nome `Route`, importado com alias — ex. `import { Route as rootRoute } from '@/routes/__root'`, `src/routes/index.tsx:9`). O `router.tsx` importa cada `Route` de rota filha e monta a árvore.

## Limites e cotas

NÃO DOCUMENTADO (não há limite de rotas ou de profundidade imposto pelo código do projeto).

## Erros conhecidos e tratamento

NÃO DOCUMENTADO (nenhuma rota de erro 404 ou boundary customizada existe no projeto hoje — `src/routes/` só tem `__root.tsx` e `index.tsx`).

## Riscos para a nossa implementação

- **Achado relevante (não é lacuna, é leitura do código):** `LancamentosProvider` (o contexto com `receitas`, `despesas`, `saldoReceita` etc.) é montado DENTRO do componente da rota `index.tsx:15-18`, não no root. Se as novas rotas (`/parcelas`, `/relatorios`, `/perfil`) forem declaradas como filhas independentes de `rootRoute`, elas NÃO têm acesso ao contexto de lançamentos a menos que o provider suba para `__root.tsx`. Qualquer tela nova que precise ler lançamentos (ex. "Parcelas" exibindo despesas) depende dessa decisão de arquitetura.
- Adicionar uma barra de navegação persistente entre todas as rotas é natural de colocar no `__root.tsx` (ao lado do `<Outlet />`), já que hoje é o único lugar compartilhado por todas as telas.

## Fonte

`src/router.tsx` (projeto, raiz do repo) — acessado em 2026-10-08
`src/routes/__root.tsx` — acessado em 2026-10-08
`src/routes/index.tsx` — acessado em 2026-10-08
`package.json:17` (`@tanstack/react-router: ^1.170.41`) — acessado em 2026-10-08
