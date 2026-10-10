---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: integracao-neon
sprint_id: sprint-01
atualizado_em: 2026-10-10
tasks:
  - id: T-01.01
    titulo: Branch Neon de teste fixa com script de reset
    fase: F-01.1
    status: concluida
    objetivo: Garantir uma branch Neon de teste que qualquer suite possa resetar para um estado limpo antes de rodar
    arquivos:
      cria: [scripts/neon-test-reset.sh]
      altera: [package.json]
    teste_integracao: Rodar scripts/neon-test-reset.sh contra a branch test reseta seu schema e dados para o estado atual da branch principal
    teste_funcional: scripts/neon-test-reset.sh termina com exit code 0 quando a branch test existe e pertence ao projeto conta-facil
    criterio_aceite: npm run test:db:reset termina com exit code 0 e a branch test fica identica a branch principal
    origem: [capacidade-teste, D-09]
    depende_de: []
    paralelizavel: true
    concluida_em: 2026-10-10
    suite: verde
  - id: T-01.02
    titulo: Instalar dependencias de schema, Function e auth
    fase: F-01.1
    status: concluida
    objetivo: Deixar disponiveis no projeto as bibliotecas que as sprints 2 a 4 vao consumir
    arquivos:
      cria: []
      altera: [package.json, package-lock.json]
    teste_integracao: npm install roda sem erro e node_modules contem drizzle-orm, pg, hono, jose, @neon/functions e @neondatabase/auth
    teste_funcional: Um arquivo de smoke que importa Hono, drizzle-orm, jose, @neon/functions e @neondatabase/auth resolve sem erro de modulo
    criterio_aceite: package.json lista drizzle-orm, pg, hono, @neon/functions, @neondatabase/auth e jose como dependencies, com package-lock.json atualizado
    origem: [capacidade-teste]
    depende_de: [T-01.01]
    paralelizavel: false
    concluida_em: 2026-10-10
    suite: verde
  - id: T-01.03
    titulo: Harness de teste de integracao contra a branch Neon de teste
    fase: F-01.1
    status: concluida
    objetivo: Dar as sprints seguintes um jeito padrao de rodar teste real contra Postgres sem mock de rede
    arquivos:
      cria: [src/test/db-setup.ts]
      altera: [vite.config.ts, package.json]
    teste_integracao: npm run test:integration conecta na branch de teste usando a DATABASE_URL de teste e um SELECT 1 retorna uma linha
    teste_funcional: getTestDb() lanca um erro explicito se a variavel de ambiente da branch de teste nao estiver definida
    criterio_aceite: npm run test:integration conecta com sucesso na branch Neon de teste e falha com mensagem clara se a variavel de ambiente de teste estiver ausente
    origem: [capacidade-teste, D-08]
    depende_de: [T-01.01, T-01.02]
    paralelizavel: true
    concluida_em: 2026-10-10
    suite: verde
  - id: T-01.04
    titulo: Scaffold da Neon Function local com rota de health check
    fase: F-01.1
    status: concluida
    objetivo: Ter uma Neon Function minima rodando localmente para as sprints seguintes acrescentarem rotas
    arquivos:
      cria: [src/functions/api/index.ts]
      altera: [neon.ts]
    teste_integracao: GET /health no servidor local (neon dev) retorna 200 com o corpo esperado
    teste_funcional: app.request('/health') devolve status 200 e corpo { ok true }
    criterio_aceite: GET /health responde 200 com { ok true } via neon dev local, e neon status confirma que o projeto esta numa das regioes com suporte a Functions
    origem: [capacidade-teste]
    depende_de: [T-01.02]
    paralelizavel: true
    concluida_em: 2026-10-10
    suite: verde
---

# Tasks — Sprint 01

---

```yaml
id: T-01.01
titulo: Branch Neon de teste fixa com script de reset
objetivo: Garantir uma branch Neon de teste que qualquer suite possa resetar para um estado limpo antes de rodar
arquivos:
  cria: [scripts/neon-test-reset.sh]
  altera: [package.json]
teste_integracao: Rodar scripts/neon-test-reset.sh contra a branch test reseta seu schema e dados para o estado atual da branch principal
teste_funcional: scripts/neon-test-reset.sh termina com exit code 0 quando a branch test existe e pertence ao projeto conta-facil
criterio_aceite: npm run test:db:reset termina com exit code 0 e a branch test fica identica a branch principal
origem: [capacidade-teste, D-09]
depende_de: []
paralelizavel: true
status: concluida
concluida_em: 2026-10-10
suite: verde
resultado: 50 passed, 0 failed; reset da branch test confirmado
real: 0,1 h
```

> Usa `neon branches reset test --parent` (CLI `neon-postgres-branches`, referência
> `.claude/skills/neon-postgres-branches/SKILL.md`). Se a branch `test` ainda não existir, o
> script cria com `neon branches create --name test --parent <branch principal>` antes de
> resetar.

---

```yaml
id: T-01.02
titulo: Instalar dependencias de schema, Function e auth
objetivo: Deixar disponiveis no projeto as bibliotecas que as sprints 2 a 4 vao consumir
arquivos:
  cria: []
  altera: [package.json, package-lock.json]
teste_integracao: npm install roda sem erro e node_modules contem drizzle-orm, pg, hono, jose, @neon/functions e @neondatabase/auth
teste_funcional: Um arquivo de smoke que importa Hono, drizzle-orm, jose, @neon/functions e @neondatabase/auth resolve sem erro de modulo
criterio_aceite: package.json lista drizzle-orm, pg, hono, @neon/functions, @neondatabase/auth e jose como dependencies, com package-lock.json atualizado
origem: [capacidade-teste]
depende_de: [T-01.01]
paralelizavel: false
status: concluida
concluida_em: 2026-10-10
suite: verde
resultado: 50 passed, 0 failed; smoke dos 6 pacotes confirmado
real: 0,1 h
```

> Depende de T-01.01 porque as duas tasks escrevem em `package.json`: rodar em paralelo seria
> escrita concorrente no mesmo arquivo (achado ALTA da auditoria rodada 1).

---

```yaml
id: T-01.03
titulo: Harness de teste de integracao contra a branch Neon de teste
objetivo: Dar as sprints seguintes um jeito padrao de rodar teste real contra Postgres sem mock de rede
arquivos:
  cria: [src/test/db-setup.ts]
  altera: [vite.config.ts, package.json]
teste_integracao: npm run test:integration conecta na branch de teste usando a DATABASE_URL de teste e um SELECT 1 retorna uma linha
teste_funcional: getTestDb() lanca um erro explicito se a variavel de ambiente da branch de teste nao estiver definida
criterio_aceite: npm run test:integration conecta com sucesso na branch Neon de teste e falha com mensagem clara se a variavel de ambiente de teste estiver ausente
origem: [capacidade-teste, D-08]
depende_de: [T-01.01, T-01.02]
paralelizavel: true
status: concluida
concluida_em: 2026-10-10
suite: verde
resultado: 50 passed, 0 failed; SELECT 1 real e erro de env ausente confirmados
real: 0,1 h
```

---

```yaml
id: T-01.04
titulo: Scaffold da Neon Function local com rota de health check
objetivo: Ter uma Neon Function minima rodando localmente para as sprints seguintes acrescentarem rotas
arquivos:
  cria: [src/functions/api/index.ts]
  altera: [neon.ts]
teste_integracao: GET /health no servidor local (neon dev) retorna 200 com o corpo esperado
teste_funcional: app.request('/health') devolve status 200 e corpo { ok true }
criterio_aceite: GET /health responde 200 com { ok true } via neon dev local, e neon status confirma que o projeto esta numa das regioes com suporte a Functions
origem: [capacidade-teste]
depende_de: [T-01.02]
paralelizavel: true
status: concluida
concluida_em: 2026-10-10
suite: verde
resultado: 50 passed, 0 failed; health local 200 e regiao aws-us-east-2 confirmados
real: 0,1 h
```
