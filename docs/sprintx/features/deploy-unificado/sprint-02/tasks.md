---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: deploy-unificado
sprint_id: sprint-02
atualizado_em: 2026-10-12
tasks:
  - id: T-02.01
    titulo: Orquestracao, matriz de ramos e dry-run
    fase: F-02.1
    status: concluida
    objetivo: Rodar a sequencia checagens, gate, function, health, push com modo --sim e pinar a matriz functionMudou x commitsAPushar (F+C+ completo, F+C- Function e health sem push, F-C+ so push, F-C- exit 0) com estado ausente fail-closed em F+C+
    arquivos:
      cria: []
      altera: [scripts/deploy.mjs, scripts/deploy.test.ts]
    teste_integracao: Dry-run com executores falsos registrando chamadas em repositorio temporario imprime a sequencia e nao chama neon, git push nem health check
    teste_funcional: Com executores falsos registrando chamadas as quatro celulas da matriz produzem a sequencia esperada, estado ausente conta Function e migrations pendentes e branch errada ou .neon fora de production abortam exitCode 1
    criterio_aceite: As quatro celulas chamam os executores certos, estado ausente fail-closed, dry-run nao chama nenhum executor de acao e gates de branch abortam exitCode 1
    origem: [D-01, D-04, D-06, D-10, D-11, D-13, D-14, D-15]
    depende_de: [T-01.03]
    paralelizavel: false
    concluida_em: 2026-10-12
    suite: verde
  - id: T-02.02
    titulo: Gate de migration
    fase: F-02.1
    status: concluida
    objetivo: Abortar o fluxo quando ha migration pendente, inclusive no estado ausente, ate confirmacao manual de aplicacao em production
    arquivos:
      cria: []
      altera: [scripts/deploy.mjs, scripts/deploy.test.ts]
    teste_integracao: Fluxo com migrationsMudaram true ou estado ausente em repositorio temporario aborta com exitCode 1 antes do push quando a resposta e nao
    teste_funcional: Resposta sim prossegue e resposta nao aborta com mensagem unica de migration pendente, inclusive no estado ausente
    criterio_aceite: Migration pendente ou estado ausente sem confirmacao aborta o fluxo com exitCode 1
    origem: [D-03, D-10]
    depende_de: [T-02.01]
    paralelizavel: false
    concluida_em: 2026-10-12
    suite: verde
  - id: T-02.03
    titulo: Confirmacao da Function
    fase: F-02.1
    status: concluida
    objetivo: Confirmar interativamente o deploy da Function imprimindo os caminhos que mudaram antes de perguntar
    arquivos:
      cria: []
      altera: [scripts/deploy.mjs, scripts/deploy.test.ts]
    teste_integracao: Confirmacao com readline real lendo s do stdin devolve true
    teste_funcional: Prompt imprime os caminhos das mudancas antes de perguntar e com resposta negativa o executor do neon nunca e chamado, verificado pela ordem de chamadas
    criterio_aceite: Resposta negativa jamais executa o neon deploy e o prompt imprime os caminhos detectados
    origem: [D-02]
    depende_de: [T-02.02]
    paralelizavel: false
    concluida_em: 2026-10-12
    suite: verde
  - id: T-02.04
    titulo: Spawn npx neon deploy
    fase: F-02.2
    status: concluida
    objetivo: Executar npx neon deploy --env via ComSpec validando FUNCTION_ALLOWED_ORIGINS ausente ou vazio antes e gravando o SHA apos sucesso
    arquivos:
      cria: []
      altera: [scripts/deploy.mjs, scripts/deploy.test.ts]
    teste_integracao: Diretorio temporario com .env.local sem FUNCTION_ALLOWED_ORIGINS ou com valor vazio aborta antes de qualquer spawn e npx neon --version via ComSpec responde
    teste_funcional: Com env valido e executor neon falso bem-sucedido o SHA do HEAD e gravado no .deploy-state.json e valor vazio ou so espacos aborta igual a ausencia
    criterio_aceite: FUNCTION_ALLOWED_ORIGINS ausente ou vazio aborta antes do spawn, ComSpec invoca o npx neon e sucesso grava o SHA
    origem: [D-02, D-05, D-09, D-16]
    depende_de: [T-02.03]
    paralelizavel: false
    concluida_em: 2026-10-12
    suite: verde
  - id: T-02.05
    titulo: Spawn git push e aviso do Pages
    fase: F-02.2
    status: concluida
    objetivo: Executar git push origin master somente apos o health check da Function e imprimir aviso de que o build do Pages foi disparado e onde conferir
    arquivos:
      cria: []
      altera: [scripts/deploy.mjs, scripts/deploy.test.ts]
    teste_integracao: Repositorio temporario com origin bare local: push real empurra o commit e o origin recebe a branch master
    teste_funcional: Push so e chamado depois do health check, verificado pela ordem de chamadas dos executores falsos, e o comando imprime mensagem informando que o build do Pages foi disparado e onde conferir
    criterio_aceite: Push real empurra master para origin bare local apos o health check e a mensagem pos-push informa o Pages
    origem: [D-04, D-18]
    depende_de: [T-02.06]
    paralelizavel: false
    concluida_em: 2026-10-12
    suite: verde
  - id: T-02.06
    titulo: Health check com retry
    fase: F-02.2
    status: concluida
    objetivo: Fazer GET /health da Function apos espera fixa com retry ate o limite, somente quando a Function foi deployada, entre o deploy e o push
    arquivos:
      cria: []
      altera: [scripts/deploy.mjs, scripts/deploy.test.ts]
    teste_integracao: Servidor HTTP local efemero respondendo /health 200 faz o health check passar
    teste_funcional: Fetch falso que falha duas vezes e depois responde 200 converge com retry, fetch que falha sempre aborta com mensagem apos o limite e ramos sem deploy da Function nao chamam o health check
    criterio_aceite: Health check passa com 200, faz retry em falha transitoria, aborta apos o limite e so roda quando a Function foi deployada
    origem: [D-08, D-15, D-17]
    depende_de: [T-02.04]
    paralelizavel: false
    concluida_em: 2026-10-12
    suite: verde
  - id: T-02.07
    titulo: Entrada e DEPLOY.md
    fase: F-02.2
    status: concluida
    objetivo: Publicar a entrada deploy no package.json e o DEPLOY.md com o checklist do que fica fora do script, incluindo migration em production
    arquivos:
      cria: [DEPLOY.md, .deploy-tree-suja.tmp (temporario de teste, removido em finally)]
      altera: [package.json]
    teste_integracao: Em repositorio temporario controlado com o arquivo .deploy-tree-suja.tmp presente na tree o script aborta exitCode 1 com mensagem que identifica tree suja e o arquivo e removido em finally, e, em arvore limpa apos a limpeza, --sim imprime a sequencia (deploy, health, push) sem executar acao e termina exitCode 0
    teste_funcional: DEPLOY.md contem as secoes de env vars do Pages, dominio confiavel, migration em production e reposicao de FUNCTION_ALLOWED_ORIGINS pos-deploy, e a entrada deploy resolve para node scripts/deploy.mjs
    criterio_aceite: Tree suja aborta exitCode 1 com mensagem de tree suja e temporario limpo em finally, --sim exit 0 imprimindo o plano e DEPLOY.md existe com as secoes externas incluindo migration
    origem: [D-01, D-03, D-07]
    depende_de: [T-02.05]
    paralelizavel: false
    concluida_em: 2026-10-12
    suite: verde
---

# Tasks — Sprint 02

---

```yaml
id: T-02.01
titulo: Orquestração, matriz de ramos e dry-run
objetivo: Rodar a sequência (checagens, gate, function, health, push) com modo --sim e pinar a matriz functionMudou × commitsAPushar (F+C+ completo; F+C− Function e health sem push; F−C+ só push; F−C− exit 0), com estado ausente fail-closed em F+C+
arquivos:
  cria: []
  altera: [scripts/deploy.mjs, scripts/deploy.test.ts]
teste_integracao: Dry-run com executores falsos registrando chamadas em repositório temporário imprime a sequência e não chama neon, git push nem health check
teste_funcional: Com executores falsos registrando chamadas, as quatro células da matriz produzem a sequência esperada, estado ausente conta Function e migrations pendentes e branch errada ou .neon fora de production abortam exitCode 1
criterio_aceite: As quatro células chamam os executores certos, estado ausente fail-closed, dry-run não chama nenhum executor de ação e gates de branch abortam exitCode 1
origem: [D-01, D-04, D-06, D-10, D-11, D-13, D-14, D-15]
depende_de: [T-01.03]
paralelizavel: false
status: concluida
```

---

```yaml
id: T-02.02
titulo: Gate de migration
objetivo: Abortar o fluxo quando há migration pendente, inclusive no estado ausente, até confirmação manual de aplicação em production
arquivos:
  cria: []
  altera: [scripts/deploy.mjs, scripts/deploy.test.ts]
teste_integracao: Fluxo com migrationsMudaram true ou estado ausente em repositório temporário aborta com exitCode 1 antes do push quando a resposta é não
teste_funcional: Resposta sim prossegue e resposta não aborta com mensagem única de migration pendente, inclusive no estado ausente
criterio_aceite: Migration pendente ou estado ausente sem confirmação aborta o fluxo com exitCode 1
origem: [D-03, D-10]
depende_de: [T-02.01]
paralelizavel: false
status: concluida
```

---

```yaml
id: T-02.03
titulo: Confirmação da Function
objetivo: Confirmar interativamente o deploy da Function imprimindo os caminhos que mudaram antes de perguntar
arquivos:
  cria: []
  altera: [scripts/deploy.mjs, scripts/deploy.test.ts]
teste_integracao: Confirmação com readline real lendo "s" do stdin devolve true
teste_funcional: Prompt imprime os caminhos das mudanças antes de perguntar e com resposta negativa o executor do neon nunca é chamado, verificado pela ordem de chamadas
criterio_aceite: Resposta negativa jamais executa o neon deploy e o prompt imprime os caminhos detectados
origem: [D-02]
depende_de: [T-02.02]
paralelizavel: false
status: concluida
```

---

```yaml
id: T-02.04
titulo: Spawn npx neon deploy
objetivo: Executar `npx neon deploy --env` via ComSpec validando FUNCTION_ALLOWED_ORIGINS (ausente ou vazio) antes e gravando o SHA após sucesso
arquivos:
  cria: []
  altera: [scripts/deploy.mjs, scripts/deploy.test.ts]
teste_integracao: Diretório temporário com .env.local sem FUNCTION_ALLOWED_ORIGINS ou com valor vazio aborta antes de qualquer spawn e `npx neon --version` via ComSpec responde
teste_funcional: Com env válido e executor neon falso bem-sucedido o SHA do HEAD é gravado no .deploy-state.json e valor vazio ou só espaços aborta igual à ausência
criterio_aceite: FUNCTION_ALLOWED_ORIGINS ausente ou vazio aborta antes do spawn, ComSpec invoca o npx neon e sucesso grava o SHA
origem: [D-02, D-05, D-09, D-16]
depende_de: [T-02.03]
paralelizavel: false
status: concluida
```

---

```yaml
id: T-02.05
titulo: Spawn git push e aviso do Pages
objetivo: Executar git push origin master somente após o health check da Function e imprimir aviso de que o build do Pages foi disparado e onde conferir
arquivos:
  cria: []
  altera: [scripts/deploy.mjs, scripts/deploy.test.ts]
teste_integracao: Repositório temporário com origin bare local: push real empurra o commit e o origin recebe a branch master
teste_funcional: Push só é chamado depois do health check, verificado pela ordem de chamadas dos executores falsos, e o comando imprime mensagem informando que o build do Pages foi disparado e onde conferir
criterio_aceite: Push real empurra master para origin bare local após o health check e a mensagem pós-push informa o Pages
origem: [D-04, D-18]
depende_de: [T-02.06]
paralelizavel: false
status: concluida
```

---

```yaml
id: T-02.06
titulo: Health check com retry
objetivo: Fazer GET /health da Function após espera fixa com retry até o limite, somente quando a Function foi deployada, entre o deploy e o push
arquivos:
  cria: []
  altera: [scripts/deploy.mjs, scripts/deploy.test.ts]
teste_integracao: Servidor HTTP local efêmero respondendo /health 200 faz o health check passar
teste_funcional: Fetch falso que falha duas vezes e depois responde 200 converge com retry, fetch que falha sempre aborta com mensagem após o limite e ramos sem deploy da Function não chamam o health check
criterio_aceite: Health check passa com 200, faz retry em falha transitória, aborta após o limite e só roda quando a Function foi deployada
origem: [D-08, D-15, D-17]
depende_de: [T-02.04]
paralelizavel: false
status: concluida
```

---

```yaml
id: T-02.07
titulo: Entrada e DEPLOY.md
objetivo: Publicar a entrada deploy no package.json e o DEPLOY.md com o checklist do que fica fora do script, incluindo migration em production
arquivos:
  cria: [DEPLOY.md, .deploy-tree-suja.tmp (temporário de teste, removido em finally)]
  altera: [package.json]
teste_integracao: Em repositório temporário controlado com o arquivo .deploy-tree-suja.tmp presente na tree o script aborta exitCode 1 com mensagem que identifica tree suja e o arquivo é removido em finally, e, em árvore limpa após a limpeza, --sim imprime a sequência (deploy, health, push) sem executar ação e termina exitCode 0
teste_funcional: DEPLOY.md contém as seções de env vars do Pages, domínio confiável, migration em production e reposição de FUNCTION_ALLOWED_ORIGINS pós-deploy, e a entrada deploy resolve para `node scripts/deploy.mjs`
criterio_aceite: Tree suja aborta exitCode 1 com mensagem de tree suja e temporário limpo em finally, --sim exit 0 imprimindo o plano e DEPLOY.md existe com as seções externas incluindo migration
origem: [D-01, D-03, D-07]
depende_de: [T-02.05]
paralelizavel: false
status: concluida
```
