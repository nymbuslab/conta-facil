---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: navegacao-inferior
sprint_id: sprint-02
titulo: Fundacao de navegacao
status: concluido
criterio_saida: As 4 abas existem como rotas navegaveis com o BottomNav visivel em todas, e o LancamentosProvider funciona a partir do root
fases: [F-02.1, F-02.2]
riscos: [FAB fixo bottom-6 right-6 e padding pb-28 colidem com a nova barra fixa, ajuste registrado em D-21]
atualizado_em: 2026-10-08
---

# Sprint 02 — Fundação de navegação

## Objetivo

Construir o esqueleto técnico que as sprints seguintes (Parcelas, Caixinhas, Perfil) vão preencher: `LancamentosProvider` compartilhado a partir do root, as três rotas novas registradas, e a barra de navegação inferior funcionando entre as quatro abas, sem sobrepor o botão de registrar.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-02.1 | Provider, rotas e componente de navegação | nenhuma |
| F-02.2 | Integração no root e ajuste de layout | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

As rotas `/`, `/parcelas`, `/caixinhas` e `/perfil` resolvem sem erro, o `BottomNav` aparece em todas elas com a aba ativa destacada, clicar num item navega para a rota correspondente, e o `RegistrarFab` continua acessível sem sobreposição visual.

## Riscos conhecidos

- O FAB fixo (`bottom-6 right-6`) e o padding `pb-28` da tela Início foram dimensionados só para o FAB (`base/layout-fab-e-espaco-fixo.md`); a nova barra fixa precisa de ajuste nos dois, registrado em D-21.
