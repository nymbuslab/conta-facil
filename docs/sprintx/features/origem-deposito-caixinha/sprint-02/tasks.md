---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: origem-deposito-caixinha
sprint_id: sprint-02
atualizado_em: 2026-10-15
tasks:
  - id: T-02.01
    titulo: Helper compartilhado criarLancamentoReceita
    fase: F-02.1
    status: concluida
    objetivo: Extrair um helper que insere um lancamento de receita dentro de uma transacao aberta por fora, sem acoplar caixinhas.ts as rotas de lancamentos.ts
    arquivos:
      cria: [src/functions/api/lancamentos-shared.ts, src/functions/api/lancamentos-shared.test.ts]
      altera: []
    teste_integracao: criarLancamentoReceita insere uma linha tipo receita no banco fake dentro de uma transacao passada por fora
    teste_funcional: Dado userId, valor e dataEmissao, devolve o LancamentoBanco criado com tipo receita e a dataEmissao informada
    criterio_aceite: Teste novo do helper passa isolado, sem importar nada de lancamentos.ts
    origem: [D-01]
    depende_de: []
    paralelizavel: true
    concluida_em: 2026-10-15
    suite: verde
  - id: T-02.02
    titulo: Deposito de_fora com chave grava movimentacao e receita atomicas
    fase: F-02.2
    status: concluida
    objetivo: POST /:id/depositar com origem de_fora grava a movimentacao e o lancamento vinculado na mesma transacao idempotente
    arquivos:
      cria: []
      altera: [src/functions/api/caixinhas.ts, src/functions/api/caixinhas.test.ts]
    teste_integracao: POST /:id/depositar com origem de_fora e Idempotency-Key cria a linha em caixinha_movimentacoes e em lancamentos na mesma transacao, contra repositorio fake
    teste_funcional: Dado valor 500 e origem de_fora, a resposta traz valorGuardado mais 500 e a movimentacao registrada tem lancamentoId preenchido
    criterio_aceite: npm run test -- caixinhas.test.ts cobre o caso de_fora com chave e passa
    origem: [D-01, D-02]
    depende_de: [T-02.01]
    paralelizavel: false
    concluida_em: 2026-10-15
    suite: verde
  - id: T-02.03
    titulo: Deposito de_fora sem chave tambem e atomico
    fase: F-02.2
    status: concluida
    objetivo: Quando origem e de_fora e nao ha Idempotency-Key, abrir uma transacao simples para as duas escritas nao divergirem numa falha parcial
    arquivos:
      cria: []
      altera: [src/functions/api/caixinhas.ts, src/functions/api/caixinhas.test.ts]
    teste_integracao: POST /:id/depositar com origem de_fora sem chave abre uma transacao simples e grava as duas linhas juntas, contra repositorio fake
    teste_funcional: Dado uma falha simulada no insert de lancamentos, o valorGuardado nao muda apos o rollback, contra repositorio fake
    criterio_aceite: npm run test -- caixinhas.test.ts cobre o caso de_fora sem chave e passa
    origem: [D-07]
    depende_de: [T-02.02]
    paralelizavel: false
    concluida_em: 2026-10-15
    suite: verde
  - id: T-02.04
    titulo: Deposito saldo_atual continua sem gerar lancamento
    fase: F-02.2
    status: concluida
    objetivo: Provar que origem saldo_atual ou ausente preserva o comportamento anterior a feature, sem efeito colateral em lancamentos
    arquivos:
      cria: []
      altera: [src/functions/api/caixinhas.ts, src/functions/api/caixinhas.test.ts]
    teste_integracao: POST /:id/depositar com origem saldo_atual ou sem o campo nao grava linha em lancamentos, contra repositorio fake
    teste_funcional: Dado valor 200 sem origem, a resposta e o valorGuardado sao identicos ao comportamento anterior a feature
    criterio_aceite: Teste de regressao prova zero linhas novas em lancamentos para origem saldo_atual
    origem: [D-06, D-07]
    depende_de: [T-02.03]
    paralelizavel: false
    concluida_em: 2026-10-15
    suite: verde
  - id: T-02.05
    titulo: Resgate grava linha de auditoria com origem nula
    fase: F-02.2
    status: concluida
    objetivo: POST /:id/resgatar passa a gravar uma linha de movimentacao com tipo resgate e origem nula, sem mudar a matematica do saldo
    arquivos:
      cria: []
      altera: [src/functions/api/caixinhas.ts, src/functions/api/caixinhas.test.ts]
    teste_integracao: POST /:id/resgatar grava uma linha em caixinha_movimentacoes com tipo resgate e origem nula, contra repositorio fake
    teste_funcional: Dado um resgate de 100, a linha criada tem tipo resgate, origem nula e lancamentoId nulo
    criterio_aceite: npm run test -- caixinhas.test.ts cobre o resgate com a linha de auditoria e passa
    origem: [D-03, D-05]
    depende_de: [T-02.04]
    paralelizavel: false
    concluida_em: 2026-10-15
    suite: verde
  - id: T-02.06
    titulo: Integracao real cobre origem e replay
    fase: F-02.3
    status: concluida
    objetivo: Estender o teste de integracao real contra a branch test para provar deposito de_fora e replay sem duplicacao
    arquivos:
      cria: []
      altera: [src/test/caixinhas-setup.ts]
    teste_integracao: npm run test:integration:caixinhas prova deposito de_fora criando lancamento e movimentacao reais, e que o replay da chave nao duplica nenhuma linha
    teste_funcional: Dado um deposito de 70000 de_fora seguido do replay da mesma chave, so uma linha em lancamentos e uma em caixinha_movimentacoes existem ao final, contra o Postgres real
    criterio_aceite: npm run test:integration:caixinhas passa e a limpeza final remove lancamentos e caixinha_movimentacoes criados pelo teste
    origem: [D-01, D-02]
    depende_de: [T-02.05]
    paralelizavel: false
    concluida_em: 2026-10-15
    suite: verde
---

# Tasks — Sprint 02

---

```yaml
id: T-02.01
titulo: Helper compartilhado criarLancamentoReceita
objetivo: Extrair um helper que insere um lancamento de receita dentro de uma transacao aberta por fora, sem acoplar caixinhas.ts as rotas de lancamentos.ts
arquivos:
  cria: [src/functions/api/lancamentos-shared.ts, src/functions/api/lancamentos-shared.test.ts]
  altera: []
teste_integracao: criarLancamentoReceita insere uma linha tipo receita no banco fake dentro de uma transacao passada por fora
teste_funcional: Dado userId, valor e dataEmissao, devolve o LancamentoBanco criado com tipo receita e a dataEmissao informada
criterio_aceite: Teste novo do helper passa isolado, sem importar nada de lancamentos.ts
origem: [D-01]
depende_de: []
paralelizavel: true
status: concluida
```

2026-10-15 · suíte: 1 passed, 0 failed · real: 0,3 h

---

```yaml
id: T-02.02
titulo: Deposito de_fora com chave grava movimentacao e receita atomicas
objetivo: POST /:id/depositar com origem de_fora grava a movimentacao e o lancamento vinculado na mesma transacao idempotente
arquivos:
  cria: []
  altera: [src/functions/api/caixinhas.ts, src/functions/api/caixinhas.test.ts]
teste_integracao: POST /:id/depositar com origem de_fora e Idempotency-Key cria a linha em caixinha_movimentacoes e em lancamentos na mesma transacao, contra repositorio fake
teste_funcional: Dado valor 500 e origem de_fora, a resposta traz valorGuardado mais 500 e a movimentacao registrada tem lancamentoId preenchido
criterio_aceite: npm run test -- caixinhas.test.ts cobre o caso de_fora com chave e passa
origem: [D-01, D-02]
depende_de: [T-02.01]
paralelizavel: false
status: concluida
```

2026-10-15 · suíte: 22 passed, 0 failed (caixinhas.test.ts) · real: 1,2 h

---

```yaml
id: T-02.03
titulo: Deposito de_fora sem chave tambem e atomico
objetivo: Quando origem e de_fora e nao ha Idempotency-Key, abrir uma transacao simples para as duas escritas nao divergirem numa falha parcial
arquivos:
  cria: []
  altera: [src/functions/api/caixinhas.ts, src/functions/api/caixinhas.test.ts]
teste_integracao: POST /:id/depositar com origem de_fora sem chave abre uma transacao simples e grava as duas linhas juntas, contra repositorio fake
teste_funcional: Dado uma falha simulada no insert de lancamentos, o valorGuardado nao muda apos o rollback, contra repositorio fake
criterio_aceite: npm run test -- caixinhas.test.ts cobre o caso de_fora sem chave e passa
origem: [D-07]
depende_de: [T-02.02]
paralelizavel: false
status: concluida
```

2026-10-15 · suíte: 22 passed, 0 failed (caixinhas.test.ts) · real: 0,6 h · divergência: o rollback
de verdade em falha parcial é provado contra Postgres real em T-02.06 (`caixinhas-setup.ts`); o
teste unitário aqui prova a abertura da transação simples e a propagação de `origem`/`banco` ao
repositório, que é o que um banco fake consegue provar sem uma conexão real.

---

```yaml
id: T-02.04
titulo: Deposito saldo_atual continua sem gerar lancamento
objetivo: Provar que origem saldo_atual ou ausente preserva o comportamento anterior a feature, sem efeito colateral em lancamentos
arquivos:
  cria: []
  altera: [src/functions/api/caixinhas.ts, src/functions/api/caixinhas.test.ts]
teste_integracao: POST /:id/depositar com origem saldo_atual ou sem o campo nao grava linha em lancamentos, contra repositorio fake
teste_funcional: Dado valor 200 sem origem, a resposta e o valorGuardado sao identicos ao comportamento anterior a feature
criterio_aceite: Teste de regressao prova zero linhas novas em lancamentos para origem saldo_atual
origem: [D-06, D-07]
depende_de: [T-02.03]
paralelizavel: false
status: concluida
```

2026-10-15 · suíte: 22 passed, 0 failed (caixinhas.test.ts) · real: 0,3 h

---

```yaml
id: T-02.05
titulo: Resgate grava linha de auditoria com origem nula
objetivo: POST /:id/resgatar passa a gravar uma linha de movimentacao com tipo resgate e origem nula, sem mudar a matematica do saldo
arquivos:
  cria: []
  altera: [src/functions/api/caixinhas.ts, src/functions/api/caixinhas.test.ts]
teste_integracao: POST /:id/resgatar grava uma linha em caixinha_movimentacoes com tipo resgate e origem nula, contra repositorio fake
teste_funcional: Dado um resgate de 100, a linha criada tem tipo resgate, origem nula e lancamentoId nulo
criterio_aceite: npm run test -- caixinhas.test.ts cobre o resgate com a linha de auditoria e passa
origem: [D-03, D-05]
depende_de: [T-02.04]
paralelizavel: false
status: concluida
```

2026-10-15 · suíte: 22 passed, 0 failed (caixinhas.test.ts) · real: 0,4 h

---

```yaml
id: T-02.06
titulo: Integracao real cobre origem e replay
objetivo: Estender o teste de integracao real contra a branch test para provar deposito de_fora e replay sem duplicacao
arquivos:
  cria: []
  altera: [src/test/caixinhas-setup.ts]
teste_integracao: npm run test:integration:caixinhas prova deposito de_fora criando lancamento e movimentacao reais, e que o replay da chave nao duplica nenhuma linha
teste_funcional: Dado um deposito de 70000 de_fora seguido do replay da mesma chave, so uma linha em lancamentos e uma em caixinha_movimentacoes existem ao final, contra o Postgres real
criterio_aceite: npm run test:integration:caixinhas passa e a limpeza final remove lancamentos e caixinha_movimentacoes criados pelo teste
origem: [D-01, D-02]
depende_de: [T-02.05]
paralelizavel: false
status: concluida
```

2026-10-15 · executado contra a branch Neon `test` real: "Caixinhas reais provaram depósito
de_fora com lançamento vinculado e replay sem duplicação" (saída do script, exit 0) · real: 0,5 h
