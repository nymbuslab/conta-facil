---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: deploy-unificado
sprint_id: sprint-01
atualizado_em: 2026-10-12
tasks:
  - id: T-01.01
    titulo: Modulo e executores
    fase: F-01.1
    status: concluida
    objetivo: Criar o esqueleto de scripts/deploy.mjs com executores injetaveis e o harness de teste
    arquivos:
      cria: [scripts/deploy.mjs, scripts/deploy.test.ts]
      altera: []
    teste_integracao: Executor git real roda git branch --show-current num repositorio temporario e devolve a branch criada
    teste_funcional: Importar scripts/deploy.mjs no vitest nao dispara nenhum passo do fluxo
    criterio_aceite: Suite roda scripts/deploy.test.ts verde sem executar git ou neon fora do diretorio temporario
    origem: [base:scripts-padrao-projeto]
    depende_de: []
    paralelizavel: false
    concluida_em: 2026-10-12
    suite: verde
  - id: T-01.02
    titulo: Estado do deploy e link
    fase: F-01.2
    status: concluida
    objetivo: Ler .deploy-state.json e .neon e ignorar o arquivo de estado no git
    arquivos:
      cria: []
      altera: [scripts/deploy.mjs, scripts/deploy.test.ts, .gitignore]
    teste_integracao: Diretorio temporario com .neon e .deploy-state.json reais devolve branch production e o SHA gravado
    teste_funcional: Estado ausente devolve null sem lancar, .neon corrompido lanca mensagem unica e o .gitignore contem .deploy-state.json, confirmado por git check-ignore
    criterio_aceite: Estado e link lidos de arquivos reais devolvem branch e SHA, ausencia devolve null e .deploy-state.json esta ignorado pelo git
    origem: [D-05, D-09]
    depende_de: [T-01.01]
    paralelizavel: false
    concluida_em: 2026-10-12
    suite: verde
  - id: T-01.03
    titulo: Classificar mudancas
    fase: F-01.2
    status: concluida
    objetivo: Classificar linhas de git diff/status/branch/log em functionMudou, migrationsMudaram, treeSuja, branchErrada e commitsAPushar
    arquivos:
      cria: []
      altera: [scripts/deploy.mjs, scripts/deploy.test.ts]
    teste_integracao: Repositorio temporario com mudanca real em src/functions/api e arquivo nao commitado classifica functionMudou e treeSuja true
    teste_funcional: Linhas com src/db/schema.ts e neon.ts classificam function, drizzle/0001.sql migration, linhas de porcelain treeSuja, branch errada e log de commits a pushar
    criterio_aceite: classificarMudancas devolve os cinco campos corretos com caminhos vigiados incluindo src/db
    origem: [D-05, D-09, D-12]
    depende_de: [T-01.02]
    paralelizavel: false
    concluida_em: 2026-10-12
    suite: verde
---

# Tasks — Sprint 01

---

```yaml
id: T-01.01
titulo: Módulo e executores
objetivo: Criar o esqueleto de scripts/deploy.mjs com executores injetáveis e o harness de teste
arquivos:
  cria: [scripts/deploy.mjs, scripts/deploy.test.ts]
  altera: []
teste_integracao: Executor git real roda `git branch --show-current` num repositório temporário e devolve a branch criada
teste_funcional: Importar scripts/deploy.mjs no vitest não dispara nenhum passo do fluxo
criterio_aceite: Suíte roda scripts/deploy.test.ts verde sem executar git ou neon fora do diretório temporário
origem: [base:scripts-padrao-projeto]
depende_de: []
paralelizavel: false
status: concluida
```

---

```yaml
id: T-01.02
titulo: Estado do deploy e link
objetivo: Ler .deploy-state.json e .neon e ignorar o arquivo de estado no git
arquivos:
  cria: []
  altera: [scripts/deploy.mjs, scripts/deploy.test.ts, .gitignore]
teste_integracao: Diretório temporário com .neon e .deploy-state.json reais devolve branch production e o SHA gravado
teste_funcional: Estado ausente devolve null sem lançar, .neon corrompido lança mensagem única e o .gitignore contém .deploy-state.json, confirmado por `git check-ignore`
criterio_aceite: Estado e link lidos de arquivos reais devolvem branch e SHA, ausência devolve null e .deploy-state.json está ignorado pelo git
origem: [D-05, D-09]
depende_de: [T-01.01]
paralelizavel: false
status: concluida
```

---

```yaml
id: T-01.03
titulo: Classificar mudanças
objetivo: Classificar linhas de git diff/status/branch/log em functionMudou, migrationsMudaram, treeSuja, branchErrada e commitsAPushar
arquivos:
  cria: []
  altera: [scripts/deploy.mjs, scripts/deploy.test.ts]
teste_integracao: Repositório temporário com mudança real em src/functions/api e arquivo não commitado classifica functionMudou e treeSuja true
teste_funcional: Linhas com src/db/schema.ts e neon.ts classificam function, drizzle/0001.sql migration, linhas de porcelain treeSuja, branch errada e log de commits a pushar
criterio_aceite: classificarMudancas devolve os cinco campos corretos com caminhos vigiados incluindo src/db
origem: [D-05, D-09, D-12]
depende_de: [T-01.02]
paralelizavel: false
status: concluida
```
