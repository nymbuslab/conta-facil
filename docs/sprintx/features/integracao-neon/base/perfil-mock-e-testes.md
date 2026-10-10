# Perfil mockado e convenções de teste

## Contrato de entrada

- `perfilMock` (`src/lib/perfil-mock.ts:1-4`) é um objeto estático `{ nome: 'Alex Pereira',
  email: 'alex.pereira@email.com' }`, sem nenhuma função de leitura — importado direto por
  `TelaPerfil` (`src/routes/perfil.tsx:5,26-27`).
- Nenhuma rota de login, formulário de cadastro ou guarda de rota (`beforeLoad`/`loader` com
  checagem de sessão) existe hoje em `src/routes/` — toda rota é pública e nenhuma depende de
  autenticação.

## Contrato de saída

- `TelaPerfil` renderiza só `perfilMock.nome` e `perfilMock.email`, somente leitura — sem botão
  de editar, sair ou qualquer ação.
- Harness de teste: Vitest + Testing Library + jsdom (`vite.config.ts:14-18`), hook
  `renderHook`/`act` para contextos (`src/state/caixinhas-context.test.tsx:1-10`) e
  `renderRoute(path)` (`src/test/render-route.tsx:6-14`) para montar uma rota real dentro do
  `RouterProvider` com histórico em memória, reaproveitando `routeTree` de `src/router.tsx`.

## Limites e cotas

- NÃO DOCUMENTADO: nenhum teste hoje mocka rede ou tempo assíncrono (não há `msw`, `nock` nem
  `vi.useFakeTimers` encontrados) — toda assertiva do harness atual é síncrona.

## Erros conhecidos e tratamento

- NÃO DOCUMENTADO — não há tratamento de erro de autenticação ou de rede no código atual,
  porque não existe chamada de rede nenhuma ainda.

## Riscos para a nossa implementação

- Qualquer tela de login/cadastro nova precisa seguir o mesmo padrão de teste já estabelecido
  (`renderRoute` + Testing Library), e qualquer proteção de rota (redirecionar usuário não
  autenticado) é construção nova — não há precedente no código para copiar.
- Trocar `perfilMock` por dados de sessão real do Neon Auth muda o contrato de `TelaPerfil`: ela
  passa a depender de um estado assíncrono (sessão carregando/carregada/ausente) que hoje não
  existe em nenhuma tela do app — os quatro estados de tela (carregando, erro, vazio, populado)
  citados nas regras de design do projeto ainda não têm exemplo de referência no código.

## Fonte

`src/lib/perfil-mock.ts`, `src/routes/perfil.tsx`, `src/test/render-route.tsx`,
`src/state/caixinhas-context.test.tsx`, `vite.config.ts`, `src/router.tsx` — acessado em
2026-10-10.
