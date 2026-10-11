---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: rollout-neon-production
sprint_id: sprint-02
atualizado_em: 2026-10-11
tasks:
  - id: T-02.01
    titulo: Aplicar migration de schema na branch production
    fase: F-02.1
    status: concluida
    objetivo: Rodar drizzle-kit migrate contra DATABASE_URL_UNPOOLED da branch production br-rapid-night-b4f7w7vu para criar as tabelas de negocio
    arquivos:
      cria: []
      altera: []
    teste_integracao: get_database_tables na branch production lista as tabelas lancamentos e caixinhas depois do comando
    teste_funcional: describe_table_schema confirma as colunas user_id, valor em integer (centavos) e id uuid nas duas tabelas, batendo com src/db/schema.ts
    criterio_aceite: As tabelas lancamentos e caixinhas existem na branch production com as colunas do schema Drizzle
    origem: [D-02]
    depende_de: []
    paralelizavel: true
    concluida_em: 2026-10-11
    suite: verde
  - id: T-02.02
    titulo: Implantar a Function api em production com CORS de producao
    fase: F-02.1
    status: concluida
    objetivo: Rodar neon deploy --env contra a branch production com FUNCTION_ALLOWED_ORIGINS incluindo o dominio contafacil.nymbuslab.com.br
    arquivos:
      cria: []
      altera: []
    teste_integracao: list_functions na branch production retorna a function api depois do deploy
    teste_funcional: GET /health na URL da Function de production responde 200 com ok true, e uma requisicao com origin https://contafacil.nymbuslab.com.br recebe o header Access-Control-Allow-Origin correspondente
    criterio_aceite: A Function api existe na branch production e responde 200 em /health com CORS liberado para o dominio de producao
    origem: [D-02, D-04]
    depende_de: []
    paralelizavel: true
    concluida_em: 2026-10-11
    suite: verde
  - id: T-02.03
    titulo: Documentar o procedimento de rollback por Instant Restore
    fase: F-02.2
    status: concluida
    objetivo: Registrar em ROLLBACK.md o passo a passo de restaurar a branch production a um ponto anterior via Instant Restore, caso a migration ou o deploy da Function falhe
    arquivos:
      cria: [docs/sprintx/features/rollout-neon-production/ROLLBACK.md]
      altera: []
    teste_integracao: O documento cita o id real da branch production (br-rapid-night-b4f7w7vu) e o fluxo exato de Instant Restore
    teste_funcional: O documento lista o sinal que dispara o rollback, por exemplo migration falha ou golden path reprova, e o que fazer em cada caso
    criterio_aceite: ROLLBACK.md existe com o procedimento de Instant Restore referenciando a branch production real
    origem: [D-05]
    depende_de: []
    paralelizavel: true
    concluida_em: 2026-10-11
    suite: verde
---

# Tasks — Sprint 02

---

```yaml
id: T-02.01
titulo: Aplicar migration de schema na branch production
objetivo: Rodar drizzle-kit migrate contra DATABASE_URL_UNPOOLED da branch production br-rapid-night-b4f7w7vu para criar as tabelas de negocio
arquivos:
  cria: []
  altera: []
teste_integracao: get_database_tables na branch production lista as tabelas lancamentos e caixinhas depois do comando
teste_funcional: describe_table_schema confirma as colunas user_id, valor em integer (centavos) e id uuid nas duas tabelas, batendo com src/db/schema.ts
criterio_aceite: As tabelas lancamentos e caixinhas existem na branch production com as colunas do schema Drizzle
origem: [D-02]
depende_de: []
paralelizavel: true
status: concluida
```

**2026-10-11 · suíte: get_database_tables lista lancamentos e caixinhas; describe_table_schema confere user_id/valor/id contra src/db/schema.ts · real: 0,3 h**

---

```yaml
id: T-02.02
titulo: Implantar a Function api em production com CORS de producao
objetivo: Rodar neon deploy --env contra a branch production com FUNCTION_ALLOWED_ORIGINS incluindo o dominio contafacil.nymbuslab.com.br
arquivos:
  cria: []
  altera: []
teste_integracao: list_functions na branch production retorna a function api depois do deploy
teste_funcional: GET /health na URL da Function de production responde 200 com ok true, e uma requisicao com origin https://contafacil.nymbuslab.com.br recebe o header Access-Control-Allow-Origin correspondente
criterio_aceite: A Function api existe na branch production e responde 200 em /health com CORS liberado para o dominio de producao
origem: [D-02, D-04]
depende_de: []
paralelizavel: true
status: concluida
```

**2026-10-11 · suíte: GET /health → 200 {ok:true}; Access-Control-Allow-Origin: https://contafacil.nymbuslab.com.br confirmado · real: 0,3 h**

---

```yaml
id: T-02.03
titulo: Documentar o procedimento de rollback por Instant Restore
objetivo: Registrar em ROLLBACK.md o passo a passo de restaurar a branch production a um ponto anterior via Instant Restore, caso a migration ou o deploy da Function falhe
arquivos:
  cria: [docs/sprintx/features/rollout-neon-production/ROLLBACK.md]
  altera: []
teste_integracao: O documento cita o id real da branch production (br-rapid-night-b4f7w7vu) e o fluxo exato de Instant Restore
teste_funcional: O documento lista o sinal que dispara o rollback, por exemplo migration falha ou golden path reprova, e o que fazer em cada caso
criterio_aceite: ROLLBACK.md existe com o procedimento de Instant Restore referenciando a branch production real
origem: [D-05]
depende_de: []
paralelizavel: true
status: concluida
```

**2026-10-11 · critério de aceite verificado (branch id real + fluxo via MCP restore_snapshot/create_snapshot/finalize_branch_restore) · real: 0,4 h**
