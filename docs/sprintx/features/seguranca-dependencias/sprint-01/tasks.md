---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: seguranca-dependencias
sprint_id: sprint-01
atualizado_em: 2026-10-11
tasks:
  - id: T-01.01
    titulo: Criar verificador npm
    fase: F-01.1
    status: concluida
    objetivo: Criar um comando que execute npm audit em JSON e bloqueie alertas altos ou criticos
    arquivos:
      cria: [scripts/auditar-dependencias.mjs, scripts/auditar-dependencias.test.ts]
      altera: [package.json]
    teste_integracao: Simula sucesso erro de rede e JSON invalido do npm audit e confirma que apenas o relatorio valido segue para avaliacao
    teste_funcional: Avalia relatorios limpo somente moderado alto e critico conferindo contagens e codigos de saida
    criterio_aceite: Limpo e somente moderado retornam zero enquanto alto critico falha de rede e JSON invalido retornam erro
    origem: [capacidade-teste]
    depende_de: []
    paralelizavel: true
    concluida_em: 2026-10-11
    suite: verde
  - id: T-01.02
    titulo: Capturar baseline visual
    fase: F-01.1
    status: concluida
    objetivo: Registrar o estado visual v3 das rotas e estados que podem regredir na migracao
    arquivos:
      cria: [docs/sprintx/features/seguranca-dependencias/VALIDACAO-VISUAL.md, docs/sprintx/features/seguranca-dependencias/evidencias/tailwind-v3/]
      altera: []
    teste_integracao: Executa npm run dev -- --mode test cria usuario descartavel via UI sem persistir credencial e semeia receita 6450 despesa parcelada 500 e caixinha 1000 antes das capturas
    teste_funcional: Em 390x844 e 1440x900 espera loading sumir e captura login inicio parcelas caixinhas e quatro dialogs com titulo marcador de dado foco inicial Tab ShiftTab Esc e overflow esperados
    criterio_aceite: VALIDACAO-VISUAL.md registra 16 casos com marcador visivel assercoes binarias e imagem correspondente em evidencias/tailwind-v3
    origem: [capacidade-teste]
    depende_de: []
    paralelizavel: true
    concluida_em: 2026-10-11
    suite: verde
---

# Tasks - Sprint 01

```yaml
id: T-01.01
titulo: Criar verificador npm
objetivo: Criar um comando que execute npm audit em JSON e bloqueie alertas altos ou críticos
arquivos:
  cria: [scripts/auditar-dependencias.mjs, scripts/auditar-dependencias.test.ts]
  altera: [package.json]
teste_integracao: Simula sucesso erro de rede e JSON inválido do npm audit e confirma processamento fail-closed
teste_funcional: Avalia relatórios limpo somente moderado alto e crítico conferindo contagens e saídas
criterio_aceite: Limpo e somente moderado retornam zero enquanto alto crítico rede e JSON inválido retornam erro
origem: [capacidade-teste]
depende_de: []
paralelizavel: true
status: concluida
```

```yaml
id: T-01.02
titulo: Capturar baseline visual
objetivo: Registrar o estado visual v3 das rotas e estados que podem regredir na migração
arquivos:
  cria: [docs/sprintx/features/seguranca-dependencias/VALIDACAO-VISUAL.md, docs/sprintx/features/seguranca-dependencias/evidencias/tailwind-v3/]
  altera: []
teste_integracao: Sobe em modo test cria usuário descartável pela UI e semeia valores determinísticos sem persistir credencial
teste_funcional: Em dois viewports espera loading sumir e captura quatro rotas e quatro dialogs com marcadores foco teclado e overflow
criterio_aceite: O documento registra 16 casos binários e imagens correspondentes em evidencias/tailwind-v3
origem: [capacidade-teste]
depende_de: []
paralelizavel: true
status: concluida
```

Conclusão T-01.01: 2026-10-11 · suíte: 7 passed, 0 failed · real: 0,3 h.

Conclusão T-01.02: 2026-10-11 · suíte: 16 estados visuais aprovados, 0 failed · real: 0,6 h.
