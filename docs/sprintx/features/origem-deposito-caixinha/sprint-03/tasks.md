---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: origem-deposito-caixinha
sprint_id: sprint-03
atualizado_em: 2026-10-15
tasks:
  - id: T-03.01
    titulo: Schema de origem e depositarCaixinhaSchema
    fase: F-03.1
    status: concluida
    objetivo: Declarar o schema zod de origem e um schema de deposito que o exige, sem mudar o schema de resgate
    arquivos:
      cria: []
      altera: [src/types/caixinha.ts, src/types/caixinha.test.ts]
    teste_integracao: depositarCaixinhaSchema aceita origem saldo_atual ou de_fora e movimentarCaixinhaSchema continua sem o campo
    teste_funcional: Dado origem ausente ou invalida em depositarCaixinhaSchema, a validacao zod falha
    criterio_aceite: Teste novo de types/caixinha passa cobrindo os dois valores de origem e a ausencia do campo em resgate
    origem: [D-02]
    depende_de: []
    paralelizavel: true
    concluida_em: 2026-10-15
    suite: verde
  - id: T-03.02
    titulo: Campo de origem no modal de deposito
    fase: F-03.1
    status: concluida
    objetivo: Modal de depositar ganha o seletor de origem pre-marcado em saldo_atual; modal de resgatar nao muda
    arquivos:
      cria: []
      altera: [src/components/movimentar-caixinha-modal.tsx, src/components/movimentar-caixinha-modal.test.tsx]
    teste_integracao: O modal de depositar renderiza o campo de origem pre-marcado em saldo_atual; o modal de resgatar nao renderiza o campo
    teste_funcional: Dado o usuario selecionar dinheiro de fora e confirmar, o formulario envia origem de_fora para a acao depositar
    criterio_aceite: npm run test -- movimentar-caixinha-modal.test.tsx cobre os dois tipos e passa
    origem: [D-06]
    depende_de: [T-03.01]
    paralelizavel: false
    concluida_em: 2026-10-15
    suite: verde
  - id: T-03.03
    titulo: Contexto encaminha origem no deposito
    fase: F-03.2
    status: concluida
    objetivo: CaixinhasProvider.movimentar passa a enviar origem no corpo da requisicao de deposito
    arquivos:
      cria: []
      altera: [src/state/caixinhas-context.tsx, src/state/caixinhas-context.test.tsx]
    teste_integracao: depositar(id, { valor, origem }) envia origem no corpo da requisicao idempotente
    teste_funcional: Dado origem de_fora, o totalGuardado local ajusta pelo delta de valorGuardado igual ao caso saldo_atual
    criterio_aceite: Teste existente de caixinhas-context cobre o envio de origem e passa
    origem: [D-02]
    depende_de: [T-03.02]
    paralelizavel: false
    concluida_em: 2026-10-15
    suite: verde
  - id: T-03.04
    titulo: Tela de caixinhas recarrega lancamentos apos deposito de_fora
    fase: F-03.2
    status: concluida
    objetivo: src/routes/caixinhas.tsx passa a consumir useLancamentos e recarrega o saldo apos um deposito de_fora bem sucedido
    arquivos:
      cria: []
      altera: [src/routes/caixinhas.tsx, src/routes/caixinhas.test.tsx]
    teste_integracao: Um deposito de_fora bem sucedido na tela de caixinhas chama recarregarLancamentos de useLancamentos
    teste_funcional: Dado um deposito saldo_atual, recarregarLancamentos nao e chamado
    criterio_aceite: Teste novo da tela de caixinhas cobre os dois casos e passa
    origem: [D-01]
    depende_de: [T-03.03]
    paralelizavel: true
    concluida_em: 2026-10-15
    suite: verde
  - id: T-03.05
    titulo: Deposito de_fora nao altera o saldo acumulado
    fase: F-03.2
    status: concluida
    objetivo: Provar com o Wrapper combinado que o deposito de_fora tem efeito liquido zero no saldo do mes, e que saldo_atual continua reduzindo o saldo
    arquivos:
      cria: []
      altera: [src/hooks/use-saldo-acumulado.test.tsx]
    teste_integracao: Com o Wrapper combinado, depositar 500 com origem de_fora mantem saldoAcumulado inalterado
    teste_funcional: Depositar 500 com origem saldo_atual continua reduzindo saldoAcumulado em exatamente 500
    criterio_aceite: npm run test -- use-saldo-acumulado.test.tsx cobre os dois casos e passa
    origem: [D-01, D-03]
    depende_de: [T-03.03]
    paralelizavel: true
    concluida_em: 2026-10-15
    suite: verde
---

# Tasks — Sprint 03

---

```yaml
id: T-03.01
titulo: Schema de origem e depositarCaixinhaSchema
objetivo: Declarar o schema zod de origem e um schema de deposito que o exige, sem mudar o schema de resgate
arquivos:
  cria: []
  altera: [src/types/caixinha.ts, src/types/caixinha.test.ts]
teste_integracao: depositarCaixinhaSchema aceita origem saldo_atual ou de_fora e movimentarCaixinhaSchema continua sem o campo
teste_funcional: Dado origem ausente ou invalida em depositarCaixinhaSchema, a validacao zod falha
criterio_aceite: Teste novo de types/caixinha passa cobrindo os dois valores de origem e a ausencia do campo em resgate
origem: [D-02]
depende_de: []
paralelizavel: true
status: concluida
```

2026-10-15 · suíte: 9 passed, 0 failed · real: 0,3 h

---

```yaml
id: T-03.02
titulo: Campo de origem no modal de deposito
objetivo: Modal de depositar ganha o seletor de origem pre-marcado em saldo_atual; modal de resgatar nao muda
arquivos:
  cria: []
  altera: [src/components/movimentar-caixinha-modal.tsx, src/components/movimentar-caixinha-modal.test.tsx]
teste_integracao: O modal de depositar renderiza o campo de origem pre-marcado em saldo_atual; o modal de resgatar nao renderiza o campo
teste_funcional: Dado o usuario selecionar dinheiro de fora e confirmar, o formulario envia origem de_fora para a acao depositar
criterio_aceite: npm run test -- movimentar-caixinha-modal.test.tsx cobre os dois tipos e passa
origem: [D-06]
depende_de: [T-03.01]
paralelizavel: false
status: concluida
```

2026-10-15 · suíte: 7 passed, 0 failed (movimentar-caixinha-modal.test.tsx) · protótipo aprovado no
Stitch antes da implementação (gate do ORQUESTRADOR seção 6.8) · real: 1,0 h

---

```yaml
id: T-03.03
titulo: Contexto encaminha origem no deposito
objetivo: CaixinhasProvider.movimentar passa a enviar origem no corpo da requisicao de deposito
arquivos:
  cria: []
  altera: [src/state/caixinhas-context.tsx, src/state/caixinhas-context.test.tsx]
teste_integracao: depositar(id, { valor, origem }) envia origem no corpo da requisicao idempotente
teste_funcional: Dado origem de_fora, o totalGuardado local ajusta pelo delta de valorGuardado igual ao caso saldo_atual
criterio_aceite: Teste existente de caixinhas-context cobre o envio de origem e passa
origem: [D-02]
depende_de: [T-03.02]
paralelizavel: false
status: concluida
```

2026-10-15 · suíte: 341 passed, 0 failed, 2 skipped (suíte inteira) · real: 0,5 h

---

```yaml
id: T-03.04
titulo: Tela de caixinhas recarrega lancamentos apos deposito de_fora
objetivo: src/routes/caixinhas.tsx passa a consumir useLancamentos e recarrega o saldo apos um deposito de_fora bem sucedido
arquivos:
  cria: []
  altera: [src/routes/caixinhas.tsx, src/routes/caixinhas.test.tsx]
teste_integracao: Um deposito de_fora bem sucedido na tela de caixinhas chama recarregarLancamentos de useLancamentos
teste_funcional: Dado um deposito saldo_atual, recarregarLancamentos nao e chamado
criterio_aceite: Teste novo da tela de caixinhas cobre os dois casos e passa
origem: [D-01]
depende_de: [T-03.03]
paralelizavel: true
status: concluida
```

2026-10-15 · suíte: 7 passed, 0 failed (caixinhas.test.ts, rota) · real: 0,6 h

---

```yaml
id: T-03.05
titulo: Deposito de_fora nao altera o saldo acumulado
objetivo: Provar com o Wrapper combinado que o deposito de_fora tem efeito liquido zero no saldo do mes, e que saldo_atual continua reduzindo o saldo
arquivos:
  cria: []
  altera: [src/hooks/use-saldo-acumulado.test.tsx]
teste_integracao: Com o Wrapper combinado, depositar 500 com origem de_fora mantem saldoAcumulado inalterado
teste_funcional: Depositar 500 com origem saldo_atual continua reduzindo saldoAcumulado em exatamente 500
criterio_aceite: npm run test -- use-saldo-acumulado.test.tsx cobre os dois casos e passa
origem: [D-01, D-03]
depende_de: [T-03.03]
paralelizavel: true
status: concluida
```

2026-10-15 · suíte: 2 passed, 0 failed (use-saldo-acumulado.test.tsx); suíte inteira 344 passed,
0 failed, 2 skipped; build e lint OK · real: 0,5 h
