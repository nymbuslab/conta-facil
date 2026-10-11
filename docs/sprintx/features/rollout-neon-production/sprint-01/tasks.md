---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: rollout-neon-production
sprint_id: sprint-01
atualizado_em: 2026-10-10
tasks:
  - id: T-01.01
    titulo: Harness de verificacao HTTP de production
    fase: F-01.1
    status: concluida
    objetivo: Documentar como rodar os scripts test:function:health e test:function:deployed ja existentes contra a branch production, sem commitar segredo
    arquivos:
      cria: [.env.production.local.example, docs/sprintx/features/rollout-neon-production/VERIFICACAO.md]
      altera: []
    teste_integracao: .env.production.local.example lista exatamente as mesmas chaves que .env.test.local usa hoje, sem nenhum valor preenchido
    teste_funcional: Seguindo o passo a passo de VERIFICACAO.md, npm run test:function:health roda sem erro de script, independente do resultado da Function
    criterio_aceite: VERIFICACAO.md e .env.production.local.example existem e os dois scripts citados rodam sem erro de configuracao
    origem: [capacidade-teste]
    depende_de: []
    paralelizavel: true
    concluida_em: 2026-10-11
    suite: verde
  - id: T-01.02
    titulo: Checklist do golden path manual de production
    fase: F-01.1
    status: concluida
    objetivo: Escrever o checklist do golden path manual (cadastro, login, lancamento, caixinha, reload) que validara o rollout em production
    arquivos:
      cria: [docs/sprintx/features/rollout-neon-production/CHECKLIST-GOLDEN-PATH.md]
      altera: []
    teste_integracao: O arquivo lista os mesmos passos do golden path ja validado na branch test, citando docs/sprintx/features/integracao-neon/FECHAMENTO.md como referencia
    teste_funcional: Cada passo do checklist tem uma acao e um resultado esperado verificavel, por exemplo criar caixinha com meta de R$100 e o saldo Guardado mostrar R$100
    criterio_aceite: CHECKLIST-GOLDEN-PATH.md existe com passos de acao e resultado esperado, cobrindo cadastro, login, lancamento, caixinha e reload
    origem: [capacidade-teste]
    depende_de: []
    paralelizavel: true
    concluida_em: 2026-10-11
    suite: verde
---

# Tasks — Sprint 01

---

```yaml
id: T-01.01
titulo: Harness de verificacao HTTP de production
objetivo: Documentar como rodar os scripts test:function:health e test:function:deployed ja existentes contra a branch production, sem commitar segredo
arquivos:
  cria: [.env.production.local.example, docs/sprintx/features/rollout-neon-production/VERIFICACAO.md]
  altera: []
teste_integracao: .env.production.local.example lista exatamente as mesmas chaves que .env.test.local usa hoje, sem nenhum valor preenchido
teste_funcional: Seguindo o passo a passo de VERIFICACAO.md, npm run test:function:health roda sem erro de script, independente do resultado da Function
criterio_aceite: VERIFICACAO.md e .env.production.local.example existem e os dois scripts citados rodam sem erro de configuracao
origem: [capacidade-teste]
depende_de: []
paralelizavel: true
status: concluida
```

**2026-10-11 · suíte: test:function:health passou (exit 0) · real: 0,2 h**

---

```yaml
id: T-01.02
titulo: Checklist do golden path manual de production
objetivo: Escrever o checklist do golden path manual (cadastro, login, lancamento, caixinha, reload) que validara o rollout em production
arquivos:
  cria: [docs/sprintx/features/rollout-neon-production/CHECKLIST-GOLDEN-PATH.md]
  altera: []
teste_integracao: O arquivo lista os mesmos passos do golden path ja validado na branch test, citando docs/sprintx/features/integracao-neon/FECHAMENTO.md como referencia
teste_funcional: Cada passo do checklist tem uma acao e um resultado esperado verificavel, por exemplo criar caixinha com meta de R$100 e o saldo Guardado mostrar R$100
criterio_aceite: CHECKLIST-GOLDEN-PATH.md existe com passos de acao e resultado esperado, cobrindo cadastro, login, lancamento, caixinha e reload
origem: [capacidade-teste]
depende_de: []
paralelizavel: true
status: concluida
```

**2026-10-11 · critério de aceite verificado (6 passos com ação e resultado esperado) · real: 0,3 h**
