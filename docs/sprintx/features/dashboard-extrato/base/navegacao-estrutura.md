# Navegação e estrutura de rotas

> Área estudada: como a navegação inferior, o roteador e o layout raiz funcionam hoje, para planejar os 5 itens (Início | Extrato | Parcelas | Caixinhas | Mais).

## Contrato de entrada

`BottomNav` (`src/components/bottom-nav.tsx:4-9`) é uma lista fixa `ITENS` (`to`, `label`, `Icone` do pacote `lucide-react`), sem parâmetro de entrada — renderiza sempre os 4 itens: Início (`/`, ícone `Home`), Parcelas (`/parcelas`, ícone `Receipt`), Caixinhas (`/caixinhas`, ícone `Wallet`), Perfil (`/perfil`, ícone `CircleUser`).

`router.tsx` (`src/router.tsx:3-22`) registra as rotas filhas de `rootRoute` por importação explícita de cada `Route`: `indexRoute`, `parcelasRoute`, `caixinhasRoute`, `perfilRoute`, `loginRoute`, `cadastroRoute`, `esqueciSenhaRoute`, `redefinirSenhaRoute`. Toda rota nova precisa ser criada em `src/routes/<nome>.tsx` com `createRoute({ getParentRoute: () => rootRoute, path: '/<nome>', component: ... })` e importada/adicionada em `routeTree.addChildren([...])`.

`__root.tsx` (`src/routes/__root.tsx:110-116`) renderiza `<BottomNav />` apenas quando `status === 'autenticado'` (hook `useAuth`), fora da lista de rotas públicas (`rotaPublica`: `/login`, `/cadastro`, `/esqueci-senha`, `/redefinir-senha`). `BottomNav` não recebe prop nenhuma hoje — é um componente estático sem estado de abertura/fechamento.

## Contrato de saída

Cada item de `BottomNav` é um `Link` do TanStack Router (`src/components/bottom-nav.tsx:16-25`) que navega via `to`; a classe `[&.active]:text-primary` marca o item ativo pela própria rota corrente, sem estado React local. Não há mecanismo de abrir/fechar um painel lateral (sidebar/drawer/sheet) hoje — todo item de `BottomNav` é navegação direta de rota.

## Limites e cotas

NÃO DOCUMENTADO — não há limite de quantidade de itens imposto pelo componente (é um `.map` sobre um array fixo); o layout é `flex items-stretch justify-around` (`src/components/bottom-nav.tsx:14`), que distribui os itens igualmente — 5 itens reduz a largura de cada um proporcionalmente, sem quebra de linha prevista.

## Erros conhecidos e tratamento

`src/components/bottom-nav.test.tsx` fixa hoje os **4 rótulos exatos** (`Início`, `Parcelas`, `Caixinhas`, `Perfil`, linhas 17-25) e o estado ativo via `aria-current="page"` por pathname (linhas 27-41). Qualquer mudança nos itens (adicionar Extrato, remover Perfil, trocar por "Mais") precisa reescrever este teste — ele vai falhar como está contra o nav de 5 itens do brief.

## Riscos para a nossa implementação

- Nenhum primitivo de "sidebar lateral" ou "sheet"/"drawer" existe no projeto hoje (`src/components/ui/` tem só `badge`, `button`, `card`, `checkbox`, `dialog`, `form`, `input`, `label`, `table` — ver `componentes-ui-existentes.md`). O item "Mais" do novo nav precisa de um componente novo, construído sobre `@radix-ui/react-dialog` (já é dependência do projeto — ver `package.json:40`), já que não há `@radix-ui/react-dialog` para side-sheet dedicado nem `vaul`/outra lib de drawer instalada.
- `BottomNav` hoje é 100% navegação de rota; abrir um painel lateral sem navegar é um comportamento novo (estado local de aberto/fechado), que a F2 precisa decidir onde mora (estado no próprio `BottomNav`, ou subindo para `__root.tsx`/`ConteudoPosCarregamento`, que já é quem decide renderizar `BottomNav`).
- Mover `Perfil` para dentro do "Mais" tem duas formas possíveis e nenhuma foi decidida: (a) manter a rota `/perfil` existente intocada e o item do painel lateral apenas navega para ela (`<Link to="/perfil">`), ou (b) remover a rota e embutir o conteúdo do perfil diretamente dentro do painel. A rota `/perfil` já existe com lógica própria de logout (ver `rota-perfil-atual.md`) — reescrevê-la é risco e escopo que o brief de design não pediu.

## Fonte

`src/components/bottom-nav.tsx`, `src/routes/__root.tsx`, `src/router.tsx`, `package.json:40` — acessado em 2026-10-17.
