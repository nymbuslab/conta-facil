---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: origem-deposito-caixinha
sprint_id: sprint-01
atualizado_em: 2026-10-15
tasks:
  - id: T-01.01
    titulo: Schema novo da tabela caixinha_movimentacoes
    fase: F-01.1
    status: concluida
    objetivo: Declarar a tabela caixinha_movimentacoes com os enums e checks que sustentam origem por deposito
    arquivos:
      cria: []
      altera: [src/db/schema.ts, src/db/schema.test.ts]
    teste_integracao: src/db/schema.test.ts cobre as novas colunas, enums e checks da tabela caixinha_movimentacoes
    teste_funcional: Dado um insert de movimentacao com tipo resgate e origem preenchida, o check caixinha_movimentacoes_origem_por_tipo rejeita, contra o banco de teste
    criterio_aceite: npm run test -- schema.test.ts passa cobrindo os tres checks novos
    origem: [D-02, D-05]
    depende_de: []
    paralelizavel: true
    concluida_em: 2026-10-15
    suite: verde
  - id: T-01.02
    titulo: Migration 0003 gerada e aplicada na branch test
    fase: F-01.1
    status: concluida
    objetivo: Gerar a migration da tabela nova e valida-la na branch Neon test
    arquivos:
      cria: [drizzle/0003_caixinha_movimentacoes.sql, drizzle/meta/0003_snapshot.json]
      altera: [drizzle/meta/_journal.json]
    teste_integracao: npm run test:migrate aplica 0003 na branch test sem erro e a tabela aparece em information_schema
    teste_funcional: Dado o schema atualizado, drizzle-kit generate produz a migration sem diff residual contra drizzle-kit check
    criterio_aceite: npm run test:migrate roda limpo e a tabela caixinha_movimentacoes existe na branch test
    origem: [D-02, D-05]
    depende_de: [T-01.01]
    paralelizavel: false
    concluida_em: 2026-10-15
    suite: verde
  - id: T-01.03
    titulo: Mock de deposito aceita e propaga origem
    fase: F-01.2
    status: concluida
    objetivo: Extender o cliente fake de caixinhas para simular origem de_fora gerando uma receita fake vinculada
    arquivos:
      cria: [src/test/api-client-mocks.test.ts]
      altera: [src/test/api-client-mocks.ts]
    teste_integracao: criarClienteCaixinhasTeste simula depositar com origem de_fora e expoe o lancamento fake criado para outro cliente de teste ler
    teste_funcional: Dado origem de_fora no mock, o estado fake de lancamentos ganha uma receita do mesmo valor depositado
    criterio_aceite: Teste novo do proprio mock prova que a receita fake aparece apos um deposito de_fora
    origem: [D-01]
    depende_de: []
    paralelizavel: true
    concluida_em: 2026-10-15
    suite: verde
  - id: T-01.04
    titulo: Wrapper de teste combina CaixinhasProvider e LancamentosProvider
    fase: F-01.2
    status: concluida
    objetivo: Criar um Wrapper de teste que monta os dois providers com estado fake compartilhado para os testes de saldo
    arquivos:
      cria: []
      altera: [src/hooks/use-saldo-acumulado.test.tsx]
    teste_integracao: O Wrapper novo monta CaixinhasProvider e LancamentosProvider com clientes fake que compartilham o mesmo estado de lancamentos e caixinhas
    teste_funcional: Dado o Wrapper novo, useSaldoAcumulado e useCaixinhas leem dados consistentes entre si no mesmo render
    criterio_aceite: O teste existente de deposito saldo_atual continua passando com o Wrapper novo, sem mudar a asserção
    origem: [capacidade-teste]
    depende_de: [T-01.03]
    paralelizavel: false
    concluida_em: 2026-10-15
    suite: verde
---

# Tasks — Sprint 01

---

```yaml
id: T-01.01
titulo: Schema novo da tabela caixinha_movimentacoes
objetivo: Declarar a tabela caixinha_movimentacoes com os enums e checks que sustentam origem por deposito
arquivos:
  cria: []
  altera: [src/db/schema.ts, src/db/schema.test.ts]
teste_integracao: src/db/schema.test.ts cobre as novas colunas, enums e checks da tabela caixinha_movimentacoes
teste_funcional: Dado um insert de movimentacao com tipo resgate e origem preenchida, o check caixinha_movimentacoes_origem_por_tipo rejeita, contra o banco de teste
criterio_aceite: npm run test -- schema.test.ts passa cobrindo os tres checks novos
origem: [D-02, D-05]
depende_de: []
paralelizavel: true
status: concluida
```

2026-10-15 · suíte: 7 passed, 0 failed · real: 0,3 h

---

```yaml
id: T-01.02
titulo: Migration 0003 gerada e aplicada na branch test
objetivo: Gerar a migration da tabela nova e valida-la na branch Neon test
arquivos:
  cria: [drizzle/0003_caixinha_movimentacoes.sql, drizzle/meta/0003_snapshot.json]
  altera: [drizzle/meta/_journal.json]
teste_integracao: npm run test:migrate aplica 0003 na branch test sem erro e a tabela aparece em information_schema
teste_funcional: Dado o schema atualizado, drizzle-kit generate produz a migration sem diff residual contra drizzle-kit check
criterio_aceite: npm run test:migrate roda limpo e a tabela caixinha_movimentacoes existe na branch test
origem: [D-02, D-05]
depende_de: [T-01.01]
paralelizavel: false
status: concluida
```

2026-10-15 · migration aplicada com sucesso (`[✓] migrations applied successfully!`) · real: 0,2 h

---

```yaml
id: T-01.03
titulo: Mock de deposito aceita e propaga origem
objetivo: Extender o cliente fake de caixinhas para simular origem de_fora gerando uma receita fake vinculada
arquivos:
  cria: [src/test/api-client-mocks.test.ts]
  altera: [src/test/api-client-mocks.ts]
teste_integracao: criarClienteCaixinhasTeste simula depositar com origem de_fora e expoe o lancamento fake criado para outro cliente de teste ler
teste_funcional: Dado origem de_fora no mock, o estado fake de lancamentos ganha uma receita do mesmo valor depositado
criterio_aceite: Teste novo do proprio mock prova que a receita fake aparece apos um deposito de_fora
origem: [D-01]
depende_de: []
paralelizavel: true
status: concluida
```

2026-10-15 · suíte: 2 passed, 0 failed (arquivo novo); suíte inteira 323 passed, 0 failed, 2 skipped · real: 0,4 h

---

```yaml
id: T-01.04
titulo: Wrapper de teste combina CaixinhasProvider e LancamentosProvider
objetivo: Criar um Wrapper de teste que monta os dois providers com estado fake compartilhado para os testes de saldo
arquivos:
  cria: []
  altera: [src/hooks/use-saldo-acumulado.test.tsx]
teste_integracao: O Wrapper novo monta CaixinhasProvider e LancamentosProvider com clientes fake que compartilham o mesmo estado de lancamentos e caixinhas
teste_funcional: Dado o Wrapper novo, useSaldoAcumulado e useCaixinhas leem dados consistentes entre si no mesmo render
criterio_aceite: O teste existente de deposito saldo_atual continua passando com o Wrapper novo, sem mudar a asserção
origem: [capacidade-teste]
depende_de: [T-01.03]
paralelizavel: false
status: concluida
```

2026-10-15 · suíte: 1 passed, 0 failed (teste existente de saldo_atual, sem mudar a asserção) · real: 0,3 h
