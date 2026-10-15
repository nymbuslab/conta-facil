---
expx_schema: 1
expx_tool: sprintx
kind: fechamento
trabalho_id: origem-deposito-caixinha
titulo: Origem do deposito na caixinha - saldo atual ou dinheiro de fora
tipo_trabalho: feature
fechado_em: 2026-10-15
modulo_afetado: [db, drizzle, functions, test, hooks, state, components, types, routes]
arquivos_alterados: [src/db/schema.ts, src/db/schema.test.ts, drizzle/0003_caixinha_movimentacoes.sql, drizzle/meta/0003_snapshot.json, drizzle/meta/_journal.json, src/test/api-client-mocks.ts, src/test/api-client-mocks.test.ts, src/hooks/use-saldo-acumulado.test.tsx, src/functions/api/lancamentos-shared.ts, src/functions/api/lancamentos-shared.test.ts, src/functions/api/caixinhas.ts, src/functions/api/caixinhas.test.ts, src/test/caixinhas-setup.ts, src/types/caixinha.ts, src/types/caixinha.test.ts, src/components/movimentar-caixinha-modal.tsx, src/components/movimentar-caixinha-modal.test.tsx, src/state/caixinhas-context.tsx, src/state/caixinhas-context.test.tsx, src/routes/caixinhas.tsx, src/routes/caixinhas.test.tsx]
palavras_chave: [caixinha, deposito, resgate, origem, saldo, receita, movimentacao, idempotencia]
resumo: Ao depositar numa caixinha, o usuario escolhe se o valor veio do saldo atual (desconta do saldo do mes, como antes) ou e dinheiro de fora (nao desconta e gera um lancamento de receita vinculado, com efeito liquido zero no saldo)
decisao_principal: Deposito de_fora tambem gera lancamento de receita vinculado, para manter o historico financeiro completo e rastreavel (D-01)
risco_residual: Caixinhas que ja existiam antes desta feature continuam contando como "saldo atual" sem reclassificacao (D-04, decisao deliberada); nao ha backfill de historico de movimentacoes para depositos anteriores a esta feature
testes_adicionados: 25
---

# Fechamento — origem-deposito-caixinha

Ao depositar numa caixinha, o usuário agora escolhe a origem do dinheiro: **saldo atual**
(transferência interna, desconta do saldo do mês — comportamento de antes) ou **dinheiro de
fora** (entrada nova, não desconta do saldo e gera automaticamente um lançamento de receita
vinculado, mantendo o histórico financeiro completo). O resgate sempre soma de volta ao saldo,
independente da origem do depósito original — matemática verificada e simétrica nos dois casos.

A decisão de maior impacto foi **D-01**: o depósito "de fora" não só deixa de descontar do
saldo, mas também cria um lançamento de receita vinculado na mesma transação, seguindo o padrão
de mercado identificado na pesquisa desta sessão (YNAB separa transferência interna de entrada
externa; Mobills trata transferências entre contas como não geradoras de receita/despesa). Isso
exigiu uma tabela nova (`caixinha_movimentacoes`) para rastrear a origem por depósito individual
(D-02), e um módulo compartilhado (`lancamentos-shared.ts`) para compor a escrita da Function de
caixinhas com a de lançamentos sem acoplar as duas rotas.

Risco residual: caixinhas que já existiam antes desta feature continuam com todo o saldo
guardado contando como "saldo atual", sem reclassificação — decisão deliberada (D-04), não uma
lacuna. Não há histórico de movimentações para depósitos anteriores à migration 0003.
