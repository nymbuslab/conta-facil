---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: dashboard-extrato
sprint_id: sprint-03
titulo: Navegacao de 5 itens e painel Mais
status: concluido
criterio_saida: BottomNav tem 5 itens, o item Mais abre o painel lateral com os links e o logout funciona pelos dois pontos
fases: [F-03.1, F-03.2]
riscos: [Nenhum primitivo de gaveta lateral existia no projeto - ver base/navegacao-estrutura.md]
atualizado_em: 2026-10-17
---

# Sprint 03 — Navegação de 5 itens e painel Mais

## Objetivo

Construir o painel lateral "Mais" (novo componente `Sheet` sobre `@radix-ui/react-dialog`, sem
dependência nova) com o menu completo (Início, Extrato, Parcelas, Caixinhas, Perfil, Sair), e
atualizar `BottomNav` para 5 itens, removendo `Perfil` da barra inferior.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-03.1 | Sheet e MenuMais | nenhuma |
| F-03.2 | BottomNav com 5 itens | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

`npm run test -- --run` passa com `bottom-nav.test.tsx` reescrito para 5 itens e `menu-mais.test.tsx`
cobrindo navegação e logout direto.

## Riscos conhecidos

- `perfil.test.tsx` hoje afirma que `Perfil` aparece no `BottomNav` (`base/rota-perfil-atual.md`)
  — precisa ser reescrito junto, não é efeito colateral a ignorar.
- O logout passa a ter dois pontos de disparo (item "Sair" do menu e botão "Sair da conta" em
  `/perfil`), os dois chamando `sair()` do `AuthProvider` — sem duplicar a lógica em si.
