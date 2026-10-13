---
expx_schema: 1
expx_tool: sprintx
kind: fechamento
trabalho_id: idempotencia-escrita-financeira
titulo: Idempotencia de escrita financeira
tipo_trabalho: feature
fechado_em: 2026-10-12
modulo_afetado: [db, functions, lib, state, test, docs]
arquivos_alterados: [src/db/schema.ts, drizzle/0001_idempotencia.sql, src/functions/api/idempotencia.ts, src/functions/api/lancamentos.ts, src/functions/api/caixinhas.ts, src/lib/api-client.ts, src/state/lancamentos-context.tsx, src/state/caixinhas-context.tsx]
palavras_chave: [idempotencia, lancamentos, caixinhas, postgres, transacao, retry, migration]
resumo: Lancamentos, depositos e resgates agora aceitam Idempotency-Key, serializam concorrencia por usuario e chave e repetem respostas sem duplicar efeito financeiro.
decisao_principal: D-03 — reservar a chave e executar a mutacao financeira dentro da mesma transacao curta.
risco_residual: A migration e os fluxos foram validados somente na branch Neon de teste; rollout em production exige plano e aprovacao separados.
testes_adicionados: 10
---

# Fechamento — idempotencia-escrita-financeira

## O que foi entregue

`POST /lancamentos`, depósito e resgate de caixinha aceitam `Idempotency-Key`. A combinação usuário + chave é única; pedidos repetidos com a mesma operação e payload devolvem a resposta original, enquanto reutilização incompatível retorna `409`. Uma trava transacional serializa chamadas concorrentes e a mutação financeira é confirmada junto com o registro idempotente.

O cliente gera UUID por operação e repete no máximo uma vez somente falha de rede, `502`, `503` ou `504`, preservando método, corpo e chave. Durante o rollout, o cabeçalho continua opcional no backend para não interromper clientes antigos, mas o frontend novo sempre o envia.

Migration, concorrência, lote parcelado, depósito, resgate, rollback por saldo insuficiente e isolamento entre usuários passaram no Postgres da branch Neon de teste. Produção não foi alterada.

## Decisão principal

D-03: reservar a chave e executar a mutação financeira na mesma transação curta. Isso elimina a janela em que uma operação poderia ser aplicada sem que a resposta idempotente fosse persistida.

## Risco residual

O rollout em `production` ainda precisa aplicar a migration e publicar a Function antes do frontend, com validação real e rollback aprovado. Endurecimentos não bloqueantes: conferir a identidade efetiva da conexão nos scripts de teste, remover usuários descartáveis do Neon Auth, definir retenção dos registros e emitir o log de execução somente depois da confirmação do commit.
