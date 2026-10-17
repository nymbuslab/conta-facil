# Rota Perfil atual

> Área estudada: o que `/perfil` faz hoje, para decidir como ela entra no novo painel "Mais".

## Contrato de entrada

`TelaPerfil` (`src/routes/perfil.tsx:16`) não recebe props; lê `useAuth()` (`usuario`, `sair`) e usa `useNavigate()` do TanStack Router.

## Contrato de saída

Renderiza nome e e-mail do usuário (`usuario.nome`, `usuario.email`) e um botão "Sair da conta" que chama `sair()` (do `AuthProvider`) e navega para `/login` em caso de sucesso; em falha, mostra mensagem de erro inline (`src/routes/perfil.tsx:26-32`).

## Limites e cotas

Nenhum.

## Erros conhecidos e tratamento

Falha em `sair()` é capturada e exibida como texto (`erro`), sem redirecionar — o botão volta a ficar habilitado (`setSaindo(false)`).

## Riscos para a nossa implementação

- A rota `/perfil` tem lógica própria (logout com tratamento de erro) que não deveria ser duplicada dentro do painel "Mais". A forma de menor risco é manter `/perfil` como está e o item "Perfil" dentro do painel lateral apenas linkar para ela (`<Link to="/perfil">`), fechando o painel ao navegar — mas isso é uma decisão de UX (perfil abre em tela cheia a partir de um painel, não dentro dele) que precisa ser confirmada na F2, não assumida.
- `perfil.test.tsx:6-13` já testa que `BottomNav` aparece também em `/perfil` e verifica os rótulos `Perfil`, `Início`, `Parcelas` renderizados via `renderRoute('/perfil')` (`src/test/render-route.tsx`). Esse teste quebra se `Perfil` sair do `BottomNav` — precisa ser reescrito junto da mudança de navegação, não é um efeito colateral a ignorar.

## Fonte

`src/routes/perfil.tsx` — acessado em 2026-10-17.
