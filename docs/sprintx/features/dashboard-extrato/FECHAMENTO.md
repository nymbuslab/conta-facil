---
expx_schema: 1
expx_tool: sprintx
kind: fechamento
trabalho_id: dashboard-extrato
titulo: Dashboard e Extrato
tipo_trabalho: feature
fechado_em: 2026-10-17
modulo_afetado: [test, routes, raiz, functions, components, state]
arquivos_alterados: [src/test/api-client-mocks.ts, src/test/api-client-mocks.test.ts, src/routes/extrato.tsx, src/routes/extrato.test.tsx, src/router.tsx, src/functions/api/lancamentos.ts, src/functions/api/lancamentos.test.ts, src/test/lancamentos-setup.ts, src/components/ui/sheet.tsx, src/components/ui/sheet.test.tsx, src/components/menu-mais.tsx, src/components/menu-mais.test.tsx, src/components/bottom-nav.tsx, src/components/bottom-nav.test.tsx, src/routes/perfil.test.tsx, src/state/lancamentos-context.tsx, src/state/lancamentos-context.test.tsx, src/components/card-contas-vencendo.tsx, src/components/card-contas-vencendo.test.tsx, src/components/card-ultimos-lancamentos.tsx, src/components/card-ultimos-lancamentos.test.tsx, src/routes/index.tsx, src/routes/index.test.tsx, src/components/estado-dados.tsx, src/components/extrato-lista.tsx, src/components/extrato-lista.test.tsx]
palavras_chave: [dashboard, extrato, navegacao, menu-lateral, contas-vencendo, ultimos-lancamentos, abas, sheet]
resumo: Inicio virou um dashboard (resumo do mes, contas vencendo, ultimos lancamentos) e o registro/consulta de lancamentos migrou para a nova tela Extrato, com navegacao de 5 itens e um painel lateral Mais
decisao_principal: Inicio deixa de registrar lancamento e vira dashboard; Extrato assume registro e consulta, com busca, navegacao de mes e abas Receita/Despesas
risco_residual: A validacao real em producao com dados reais do usuario (D-18) e a validacao visual no navegador ainda nao foram feitas - dependem de deploy manual da Function e de olhar o app renderizado, fora do que a execucao autonoma cobre; o componente antigo ListaLancamentos nao foi removido porque ainda sustenta os testes de fluxos-assincronos.test.tsx e acessibilidade.test.tsx, mesmo sem mais nenhuma rota de producao usando-o
testes_adicionados: 36
---

# Fechamento — dashboard-extrato

## Resumo

A tela Início deixa de ser onde o usuário registra receitas e despesas e passa a ser um
dashboard: mantém os quatro cards de resumo do mês e ganha dois cards novos, "Contas vencendo"
(até 3 despesas não pagas vencendo nos próximos 3 dias) e "Últimos lançamentos" (5 mais
recentes, misturando receita e despesa). O registro de lançamento e a consulta detalhada
migraram para uma tela nova, Extrato, com busca, navegação de mês, abas Receita/Despesas e o
botão de registrar. A navegação inferior ganhou um quinto item, "Mais", que abre um painel
lateral com os mesmos destinos principais (Início, Extrato, Parcelas, Caixinhas), Perfil e a
ação de sair direto — Perfil saiu da barra inferior. Dois endpoints novos no backend
(`GET /lancamentos/vencendo`, `GET /lancamentos/recentes`) sustentam os dois cards novos, sem
nenhuma migration de banco.

## Decisão principal

Início deixa de registrar lançamento e vira dashboard; Extrato assume registro e consulta,
com busca, navegação de mês e abas Receita/Despesas — a reestruturação de navegação inteira
(painel "Mais", backend novo, componente de abas) decorre dessa decisão central.

## Risco residual

A definição de pronto do usuário (D-18) pedia validação visual no navegador e validação real
em produção com dados reais da conta — nenhuma das duas foi feita nesta execução autônoma: a
primeira depende de olhar o app renderizado, a segunda de um deploy manual da Function
(`npm run deploy`) que esta sessão não executa por conta própria. `src/components/lista-
lancamentos.tsx` (a lista empilhada antiga) também continua no repositório, sem mais nenhuma
rota de produção usando-a, porque `fluxos-assincronos.test.tsx` e `acessibilidade.test.tsx`
ainda a usam para testar padrões cross-cutting independentes da tela — removê-la exigiria
migrar esses dois testes para `ExtratoLista`, fora do escopo desta feature.
