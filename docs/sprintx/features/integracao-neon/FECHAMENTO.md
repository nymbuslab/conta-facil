---
expx_schema: 1
expx_tool: sprintx
kind: fechamento
trabalho_id: integracao-neon
titulo: Integracao Neon com login real e persistencia
tipo_trabalho: feature
fechado_em: 2026-10-10
modulo_afetado: [raiz, scripts, test, functions, state, routes, lib, db]
palavras_chave: [neon, auth, postgres, functions, drizzle, lancamentos, caixinhas, login]
resumo: Login e cadastro reais, API autenticada e persistencia isolada por usuario para lancamentos e caixinhas.
decisao_principal: O SPA acessa o Postgres somente pela Neon Function autenticada; valores monetarios trafegam em centavos.
risco_residual: O rollout de production e a validacao visual completa do fluxo autenticado permanecem separados.
testes_unitarios: 82
---

# Fechamento — integração Neon

## O que foi entregue

- Login, cadastro, saída e perfil conectados ao Neon Managed Auth.
- Rotas privadas protegidas e perfil fictício removido.
- Schema Drizzle e migration para lançamentos e caixinhas com `user_id` e valores em centavos.
- Neon Function com verificação de JWT e isolamento de dados por usuário.
- Providers do React ligados à Function, com persistência após recarregar a página.
- Estados de carregamento, erro com nova tentativa, vazio e conteúdo nas telas Início, Parcelas e
  Caixinhas.

## Validação

- 82 testes unitários e de componentes passaram; 2 integrações são ignoradas na suíte comum e
  executadas separadamente com as variáveis da branch de teste.
- Schema, JWT, lançamentos, caixinhas, cliente HTTP e providers passaram contra Postgres e Auth
  reais.
- A Function implantada na branch Neon `test` respondeu 200 com JWT real.
- Build e lint passaram. O login foi conferido visualmente; a extensão do Chrome bloqueou a
  continuação da automação no fluxo autenticado.

## Desdobramentos

- Preparar rollout e rollback antes de promover a integração para `production`.
- Repetir o golden path visual autenticado em desktop e mobile quando a automação estiver livre.
- Tratar os alertas do `npm audit` antes do rollout.
