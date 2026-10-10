---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: integracao-neon
sprint_id: sprint-03
atualizado_em: 2026-10-10
tasks:
  - id: T-03.01
    titulo: Schema Drizzle de lancamentos e caixinhas
    fase: F-03.1
    status: concluida
    objetivo: Criar as tabelas lancamentos e caixinhas com uuid, centavos e user_id, e aplicar a migration na branch de teste
    arquivos:
      cria: [src/db/schema.ts, drizzle.config.ts, drizzle/0000_init.sql]
      altera: [package.json, package-lock.json]
    teste_integracao: Rodar a migration contra a branch de teste cria as tabelas lancamentos e caixinhas com as colunas do contrato
    teste_funcional: O schema Drizzle declara id uuid default random, user_id uuid not null e valor integer not null nas duas tabelas
    criterio_aceite: Migration aplicada na branch de teste sem erro e as duas tabelas existem com as colunas do contrato D-04 e D-10
    origem: [D-04, D-10]
    depende_de: [T-01.02, T-01.03]
    paralelizavel: true
    concluida_em: 2026-10-10
    suite: verde
  - id: T-03.02
    titulo: Middleware de autenticacao da Function
    fase: F-03.2
    status: concluida
    objetivo: Verificar o JWT da sessao Neon Auth antes de qualquer rota de dados
    arquivos:
      cria: [src/functions/api/auth-middleware.ts, src/functions/api/auth-middleware.test.ts]
      altera: []
    teste_integracao: Requisicao sem Authorization contra a Function local recebe 401
    teste_funcional: Requisicao com um JWT valido emitido pela branch de teste popula c.get('userId') com o sub do token
    criterio_aceite: Toda rota depois do middleware so executa com um JWT valido e c.get('userId') bate com o sub do token
    origem: [D-02]
    depende_de: [T-01.04, T-02.01]
    paralelizavel: true
    concluida_em: 2026-10-10
    suite: verde
  - id: T-03.03
    titulo: Endpoints de lancamentos isolados por usuario
    fase: F-03.2
    status: concluida
    objetivo: Expor criacao, leitura e marcacao de pagamento de lancamentos filtrados pelo usuario autenticado
    arquivos:
      cria: [src/functions/api/lancamentos.ts, src/functions/api/lancamentos.test.ts]
      altera: []
    teste_integracao: POST /lancamentos cria uma despesa na branch de teste e GET /lancamentos do mesmo usuario a retorna, enquanto um segundo usuario nao a ve
    teste_funcional: POST /lancamentos com parcelado true gera N linhas com o mesmo parcelamentoId
    criterio_aceite: GET /lancamentos so retorna linhas do user_id do token e dois usuarios nunca veem o lancamento um do outro
    origem: [D-01, D-10]
    depende_de: [T-03.01, T-03.02]
    paralelizavel: true
    concluida_em: 2026-10-10
    suite: verde
  - id: T-03.04
    titulo: Endpoints de caixinhas isolados por usuario
    fase: F-03.2
    status: concluida
    objetivo: Expor criar, depositar, resgatar e excluir caixinhas filtradas pelo usuario autenticado
    arquivos:
      cria: [src/functions/api/caixinhas.ts, src/functions/api/caixinhas.test.ts]
      altera: []
    teste_integracao: POST /caixinhas/:id/resgatar com valor maior que o guardado contra a branch de teste retorna 400 e nao altera a linha
    teste_funcional: POST /caixinhas/:id/depositar soma o valor em centavos ao valorGuardado da caixinha do usuario autenticado
    criterio_aceite: Resgatar valor maior que o guardado retorna erro sem escrever, e um usuario so opera as proprias caixinhas
    origem: [D-01, D-10]
    depende_de: [T-03.01, T-03.02]
    paralelizavel: true
    concluida_em: 2026-10-10
    suite: verde
---

# Tasks — Sprint 03

---

```yaml
id: T-03.01
titulo: Schema Drizzle de lancamentos e caixinhas
objetivo: Criar as tabelas lancamentos e caixinhas com uuid, centavos e user_id, e aplicar a migration na branch de teste
arquivos:
  cria: [src/db/schema.ts, drizzle.config.ts, drizzle/0000_init.sql]
  altera: [package.json, package-lock.json]
teste_integracao: Rodar a migration contra a branch de teste cria as tabelas lancamentos e caixinhas com as colunas do contrato
teste_funcional: O schema Drizzle declara id uuid default random, user_id uuid not null e valor integer not null nas duas tabelas
criterio_aceite: Migration aplicada na branch de teste sem erro e as duas tabelas existem com as colunas do contrato D-04 e D-10
origem: [D-04, D-10]
depende_de: [T-01.02, T-01.03]
paralelizavel: true
status: concluida
concluida_em: 2026-10-10
suite: verde
resultado: 65 passed, 0 failed; migration aplicada e schema confirmado na branch test; build e lint passaram
real: 0,2 h
```

---

```yaml
id: T-03.02
titulo: Middleware de autenticacao da Function
objetivo: Verificar o JWT da sessao Neon Auth antes de qualquer rota de dados
arquivos:
  cria: [src/functions/api/auth-middleware.ts, src/functions/api/auth-middleware.test.ts]
  altera: []
teste_integracao: Requisicao sem Authorization contra a Function local recebe 401
teste_funcional: Requisicao com um JWT valido emitido pela branch de teste popula c.get('userId') com o sub do token
criterio_aceite: Toda rota depois do middleware so executa com um JWT valido e c.get('userId') bate com o sub do token
origem: [D-02]
depende_de: [T-01.04, T-02.01]
paralelizavel: true
status: concluida
concluida_em: 2026-10-10
suite: verde
resultado: 68 passed, 0 failed; JWT real validado via JWKS e sub propagado; build, lint e health passaram
real: 0,2 h
```

---

```yaml
id: T-03.03
titulo: Endpoints de lancamentos isolados por usuario
objetivo: Expor criacao, leitura e marcacao de pagamento de lancamentos filtrados pelo usuario autenticado
arquivos:
  cria: [src/functions/api/lancamentos.ts, src/functions/api/lancamentos.test.ts]
  altera: []
teste_integracao: POST /lancamentos cria uma despesa na branch de teste e GET /lancamentos do mesmo usuario a retorna, enquanto um segundo usuario nao a ve
teste_funcional: POST /lancamentos com parcelado true gera N linhas com o mesmo parcelamentoId
criterio_aceite: GET /lancamentos so retorna linhas do user_id do token e dois usuarios nunca veem o lancamento um do outro
origem: [D-01, D-10]
depende_de: [T-03.01, T-03.02]
paralelizavel: true
status: concluida
concluida_em: 2026-10-10
suite: verde
resultado: 71 passed, 0 failed; POST e GET reais isolados entre dois usuarios; build e lint passaram
real: 0,3 h
```

---

```yaml
id: T-03.04
titulo: Endpoints de caixinhas isolados por usuario
objetivo: Expor criar, depositar, resgatar e excluir caixinhas filtradas pelo usuario autenticado
arquivos:
  cria: [src/functions/api/caixinhas.ts, src/functions/api/caixinhas.test.ts]
  altera: []
teste_integracao: POST /caixinhas/:id/resgatar com valor maior que o guardado contra a branch de teste retorna 400 e nao altera a linha
teste_funcional: POST /caixinhas/:id/depositar soma o valor em centavos ao valorGuardado da caixinha do usuario autenticado
criterio_aceite: Resgatar valor maior que o guardado retorna erro sem escrever, e um usuario so opera as proprias caixinhas
origem: [D-01, D-10]
depende_de: [T-03.01, T-03.02]
paralelizavel: true
status: concluida
concluida_em: 2026-10-10
suite: verde
resultado: 74 passed, 0 failed; operacoes reais preservaram saldo e isolamento; build, lint e health passaram
real: 0,3 h
```
