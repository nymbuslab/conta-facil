---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: rollout-neon-production
sprint_id: sprint-05
atualizado_em: 2026-10-11
tasks:
  - id: T-05.01
    titulo: Destravar .env.production.local.example do gitignore
    fase: F-05.1
    status: concluida
    objetivo: Abrir excecao no .gitignore para o arquivo de exemplo poder ser versionado, igual ja existe para .env.example
    arquivos:
      cria: []
      altera: [.gitignore]
    teste_integracao: git check-ignore -v .env.production.local.example mostra a regra de negacao (!.env.production.local.example) como ultima regra aplicada, confirmando que o arquivo nao esta mais ignorado
    teste_funcional: git add .env.production.local.example funciona sem --force e o arquivo aparece como staged (A) em git status, depois desfeito com git restore --staged
    criterio_aceite: .env.production.local.example pode ser adicionado ao git sem --force
    origem: [capacidade-teste]
    depende_de: []
    paralelizavel: true
    concluida_em: 2026-10-11
    suite: verde
  - id: T-05.02
    titulo: Corrigir VERIFICACAO.md sobre test:function:deployed
    fase: F-05.1
    status: concluida
    objetivo: Remover a afirmacao de que test:function:deployed le .env.production.local, documentando o comportamento real (hardcoded em .env.test.local, com guard de branch)
    arquivos:
      cria: []
      altera: [docs/sprintx/features/rollout-neon-production/VERIFICACAO.md]
    teste_integracao: VERIFICACAO.md nao contem mais a frase afirmando que test:function:deployed le .env.production.local
    teste_funcional: VERIFICACAO.md explica que test:function:deployed e travado em test por garantirBranchDeTeste() e aponta um caminho alternativo para checar a Function de production
    criterio_aceite: VERIFICACAO.md descreve o comportamento real dos dois scripts, sem prometer verificacao de production que o script nao faz
    origem: [capacidade-teste]
    depende_de: []
    paralelizavel: true
    concluida_em: 2026-10-11
    suite: verde
  - id: T-05.03
    titulo: Corrigir fonte dos nomes de tool em ROLLBACK.md
    fase: F-05.1
    status: concluida
    objetivo: Substituir a citacao de fonte do procedimento de Instant Restore pelas tools MCP do Neon de fato confirmadas nesta sessao, em vez de implicar que vem das skills locais
    arquivos:
      cria: []
      altera: [docs/sprintx/features/rollout-neon-production/ROLLBACK.md]
    teste_integracao: ROLLBACK.md cita explicitamente que os nomes de tool (create_snapshot, restore_snapshot, list_snapshots, finalize_branch_restore, deploy_function) vem do schema do MCP do Neon, nao das skills locais
    teste_funcional: Uma pessoa lendo ROLLBACK.md consegue distinguir o que e decisao confirmada (D-05, Instant Restore sem migration reversa) do que e mecanismo de tool sujeito a mudanca de versao do MCP
    criterio_aceite: ROLLBACK.md nao atribui mais os nomes de tool a uma fonte documental que nao os contem
    origem: [D-05]
    depende_de: []
    paralelizavel: true
    concluida_em: 2026-10-11
    suite: verde
---

# Tasks — Sprint 05

---

```yaml
id: T-05.01
titulo: Destravar .env.production.local.example do gitignore
objetivo: Abrir excecao no .gitignore para o arquivo de exemplo poder ser versionado, igual ja existe para .env.example
arquivos:
  cria: []
  altera: [.gitignore]
teste_integracao: git check-ignore -v .env.production.local.example mostra a regra de negacao (!.env.production.local.example) como ultima regra aplicada, confirmando que o arquivo nao esta mais ignorado
teste_funcional: git add .env.production.local.example funciona sem --force e o arquivo aparece como staged (A) em git status, depois desfeito com git restore --staged
criterio_aceite: .env.production.local.example pode ser adicionado ao git sem --force
origem: [capacidade-teste]
depende_de: []
paralelizavel: true
status: concluida
```

**2026-10-11 · verificado: git check-ignore mostra a regra de negação; git add + restore --staged confirmou · real: 0,1 h**

---

```yaml
id: T-05.02
titulo: Corrigir VERIFICACAO.md sobre test:function:deployed
objetivo: Remover a afirmacao de que test:function:deployed le .env.production.local, documentando o comportamento real (hardcoded em .env.test.local, com guard de branch)
arquivos:
  cria: []
  altera: [docs/sprintx/features/rollout-neon-production/VERIFICACAO.md]
teste_integracao: VERIFICACAO.md nao contem mais a frase afirmando que test:function:deployed le .env.production.local
teste_funcional: VERIFICACAO.md explica que test:function:deployed e travado em test por garantirBranchDeTeste() e aponta um caminho alternativo para checar a Function de production
criterio_aceite: VERIFICACAO.md descreve o comportamento real dos dois scripts, sem prometer verificacao de production que o script nao faz
origem: [capacidade-teste]
depende_de: []
paralelizavel: true
status: concluida
```

**2026-10-11 · verificado: frase incorreta removida, comportamento real documentado, alternativa via curl adicionada · real: 0,2 h**

---

```yaml
id: T-05.03
titulo: Corrigir fonte dos nomes de tool em ROLLBACK.md
objetivo: Substituir a citacao de fonte do procedimento de Instant Restore pelas tools MCP do Neon de fato confirmadas nesta sessao, em vez de implicar que vem das skills locais
arquivos:
  cria: []
  altera: [docs/sprintx/features/rollout-neon-production/ROLLBACK.md]
teste_integracao: ROLLBACK.md cita explicitamente que os nomes de tool (create_snapshot, restore_snapshot, list_snapshots, finalize_branch_restore, deploy_function) vem do schema do MCP do Neon, nao das skills locais
teste_funcional: Uma pessoa lendo ROLLBACK.md consegue distinguir o que e decisao confirmada (D-05, Instant Restore sem migration reversa) do que e mecanismo de tool sujeito a mudanca de versao do MCP
criterio_aceite: ROLLBACK.md nao atribui mais os nomes de tool a uma fonte documental que nao os contem
origem: [D-05]
depende_de: []
paralelizavel: true
status: concluida
```

**2026-10-11 · verificado: nota de fonte adicionada citando o schema ao vivo do MCP, com aviso de revalidação se o MCP mudar de versão · real: 0,2 h**
