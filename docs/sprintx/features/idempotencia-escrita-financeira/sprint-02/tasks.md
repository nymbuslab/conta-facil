---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: idempotencia-escrita-financeira
sprint_id: sprint-02
atualizado_em: 2026-10-11
tasks:
  - id: T-02.01
    titulo: Criar schema e migration
    fase: F-02.1
    status: concluida
    objetivo: Persistir chave operacao hash status e resposta com unicidade por usuario
    arquivos:
      cria: [drizzle/0001_idempotencia.sql, drizzle/meta/0001_snapshot.json, src/test/migration-setup.ts]
      altera: [src/db/schema.ts, src/db/schema.test.ts, drizzle/meta/_journal.json, src/test/schema-setup.ts, package.json]
    teste_integracao: O runner carrega env de teste recusa branch fora de test aplica a migration e introspecta colunas tipos nulabilidade e unique composta
    teste_funcional: A mesma chave entra para dois usuarios e falha apenas quando usuario e chave se repetem juntos
    criterio_aceite: test:migrate aborta fora de test e na branch test prova schema completo e unicidade por usuario e chave
    origem: [D-01, D-03, D-05, D-08]
    depende_de: []
    paralelizavel: false
    concluida_em: 2026-10-11
    suite: verde
  - id: T-02.02
    titulo: Criar executor transacional
    fase: F-02.1
    status: concluida
    objetivo: Reservar chave comparar hash executar mutacao e persistir resposta na mesma transacao
    arquivos:
      cria: [src/functions/api/idempotencia.ts, src/functions/api/idempotencia.test.ts, src/test/idempotencia-setup.ts]
      altera: [src/functions/api/db.ts, package.json]
    teste_integracao: No Postgres de teste duas transacoes concorrentes recebem mesmo status e corpo com um efeito e falha apos reserva deixa zero chave e zero efeito
    teste_funcional: Replay preserva status e corpo conflito retorna 409 e cada evento registra somente evento operacao resultado e replay sem payload descricao valor userId ou chave
    criterio_aceite: Concorrencia replay conflito rollback e logs com os quatro metadados permitidos passam contra o Postgres de teste
    origem: [D-03, D-04, D-05, D-07]
    depende_de: [T-02.01]
    paralelizavel: false
    concluida_em: 2026-10-11
    suite: verde
  - id: T-02.03
    titulo: Proteger lancamentos
    fase: F-02.2
    status: concluida
    objetivo: Aplicar idempotencia ao lote criado por POST de lancamentos
    arquivos:
      cria: []
      altera: [src/functions/api/lancamentos.ts, src/functions/api/lancamentos.test.ts]
    teste_integracao: Testa replay lote parcelado conflito de payload conflito de operacao isolamento por usuario e caminho sem cabecalho
    teste_funcional: Mesma receita retorna corpo e 201 originais sem nova criacao enquanto conflito retorna 409 e sem chave mantem o comportamento anterior
    criterio_aceite: Lancamentos cobrem replay 409 usuarios distintos lote atomico e compatibilidade sem cabecalho
    origem: [D-01, D-02, D-04]
    depende_de: [T-02.02]
    paralelizavel: false
    concluida_em: 2026-10-11
    suite: verde
  - id: T-02.04
    titulo: Proteger caixinhas
    fase: F-02.2
    status: concluida
    objetivo: Aplicar idempotencia aos endpoints depositar e resgatar
    arquivos:
      cria: []
      altera: [src/functions/api/caixinhas.ts, src/functions/api/caixinhas.test.ts]
    teste_integracao: Testa replay conflito de payload deposito versus resgate usuarios distintos saldo insuficiente rollback e caminho sem cabecalho
    teste_funcional: Deposito de 500 e resgate de 200 repetidos mantem um efeito e mesma chave em operacao diferente retorna 409
    criterio_aceite: Caixinhas cobrem replay 409 isolamento rollback saldo insuficiente e compatibilidade sem cabecalho
    origem: [D-01, D-02, D-04]
    depende_de: [T-02.03]
    paralelizavel: false
    concluida_em: 2026-10-11
    suite: verde
  - id: T-02.05
    titulo: Criar POST idempotente
    fase: F-02.3
    status: concluida
    objetivo: Gerar chave UUID e repetir uma vez apenas falhas transitorias com a mesma chave
    arquivos:
      cria: []
      altera: [src/lib/api-client.ts, src/lib/api-client.test.ts]
    teste_integracao: Para rede 502 503 e 504 confirma duas chamadas com a mesma chave e para 400 401 409 e 500 confirma uma chamada
    teste_funcional: Duas falhas transitorias param em duas tentativas cada operacao nova recebe UUID novo e o replay conserva o corpo
    criterio_aceite: A matriz completa de retry passa com no maximo duas tentativas chave estavel por operacao e UUID novo entre operacoes
    origem: [D-06, D-07]
    depende_de: [T-02.04]
    paralelizavel: false
    concluida_em: 2026-10-11
    suite: verde
  - id: T-02.06
    titulo: Usar chave nos contextos
    fase: F-02.3
    status: concluida
    objetivo: Trocar as tres escritas financeiras para o metodo idempotente
    arquivos:
      cria: []
      altera: [src/state/lancamentos-context.tsx, src/state/lancamentos-context.test.tsx, src/state/caixinhas-context.tsx, src/state/caixinhas-context.test.tsx, src/test/api-client-mocks.ts]
    teste_integracao: Renderiza providers e confirma rota payload e chaves distintas entre acoes com mesma chave apenas no retry interno
    teste_funcional: Falha transitoria atualiza estado uma vez e falha definitiva nao altera lancamentos nem caixinhas
    criterio_aceite: As tres operacoes usam postIdempotente com chave por acao e mantem estado inalterado em erro definitivo
    origem: [D-01, D-02, D-06]
    depende_de: [T-02.05]
    paralelizavel: false
    concluida_em: 2026-10-11
    suite: verde
  - id: T-02.07
    titulo: Validar no Neon test
    fase: F-02.3
    status: concluida
    objetivo: Provar idempotencia sequencial e concorrente contra o Postgres de teste
    arquivos:
      cria: []
      altera: [src/test/lancamentos-setup.ts, src/test/caixinhas-setup.ts, package.json]
    teste_integracao: Dispara HTTP sequencial e concorrente contra backend e Postgres test e confere respostas registros idempotentes contagens saldos rollback e mesma chave entre usuarios
    teste_funcional: Lancamento repetido cria um lote deposito de 500 soma uma vez resgate de 200 subtrai uma vez e conflitos retornam 409
    criterio_aceite: Integracao real matriz de retry Vitest em modo run lint e build passam com a trava de producao comprovada
    origem: [D-03, D-04, D-08]
    depende_de: [T-02.06]
    paralelizavel: false
    concluida_em: 2026-10-11
    suite: verde
---

# Tasks - Sprint 02

## T-02.01 - Criar schema e migration

Teste a migration e a unicidade por usuário antes de integrar a API.

## T-02.02 - Criar executor transacional

Prove repetição, conflito de hash e concorrência antes de alterar endpoints.

## T-02.03 - Proteger lançamentos

Proteja o lote completo de receita, despesa ou parcelamento.

## T-02.04 - Proteger caixinhas

Proteja depósito e resgate sem alterar as regras atuais de saldo.

## T-02.05 - Criar POST idempotente

Reutilize a mesma chave em uma única repetição transitória.

## T-02.06 - Usar chave nos contextos

Mude somente as três operações financeiras em escopo.

## T-02.07 - Validar no Neon test

Confirme diretamente no banco que cada operação teve um único efeito.
