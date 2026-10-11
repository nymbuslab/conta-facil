---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: rollout-neon-production
sprint_id: sprint-04
atualizado_em: 2026-10-11
tasks:
  - id: T-04.01
    titulo: Executar o checklist do golden path em production
    fase: F-04.1
    status: concluida
    objetivo: Seguir CHECKLIST-GOLDEN-PATH.md contra https://contafacil.nymbuslab.com.br e registrar o resultado de cada passo
    arquivos:
      cria: []
      altera: [docs/sprintx/features/rollout-neon-production/CHECKLIST-GOLDEN-PATH.md]
    teste_integracao: Cada passo do checklist fica marcado como passou ou falhou, com a data da execucao
    teste_funcional: Um lancamento e uma caixinha criados no fluxo sobrevivem a um reload da pagina em producao
    criterio_aceite: Todos os passos do checklist passam, sem nenhum marcado como falhou
    origem: [D-06, D-07]
    depende_de: [T-01.02, T-02.01, T-02.02, T-03.04]
    paralelizavel: false
    concluida_em: 2026-10-11
    suite: verde
  - id: T-04.02
    titulo: Atualizar a documentacao viva com o rollout concluido
    fase: F-04.1
    status: concluida
    objetivo: Atualizar PROGRESSO.md, ROADMAP.md, README.md, CHANGELOG.md e CLAUDE.md refletindo o rollout em production
    arquivos:
      cria: []
      altera: [PROGRESSO.md, ROADMAP.md, README.md, CHANGELOG.md, CLAUDE.md]
    teste_integracao: Nenhum dos cinco arquivos menciona mais a promocao para production como pendente ou fora de escopo
    teste_funcional: PROGRESSO.md lista o item do rollout em Concluido com a data da execucao
    criterio_aceite: Os cinco documentos refletem o estado real pos-rollout, sem frase desatualizada sobre production
    origem: [D-07]
    depende_de: [T-04.01]
    paralelizavel: false
    concluida_em: 2026-10-11
    suite: verde
---

# Tasks — Sprint 04

---

```yaml
id: T-04.01
titulo: Executar o checklist do golden path em production
objetivo: Seguir CHECKLIST-GOLDEN-PATH.md contra https://contafacil.nymbuslab.com.br e registrar o resultado de cada passo
arquivos:
  cria: []
  altera: [docs/sprintx/features/rollout-neon-production/CHECKLIST-GOLDEN-PATH.md]
teste_integracao: Cada passo do checklist fica marcado como passou ou falhou, com a data da execucao
teste_funcional: Um lancamento e uma caixinha criados no fluxo sobrevivem a um reload da pagina em producao
criterio_aceite: Todos os passos do checklist passam, sem nenhum marcado como falhou
origem: [D-06, D-07]
depende_de: [T-01.02, T-02.01, T-02.02, T-03.04]
paralelizavel: false
status: concluida
```

**2026-10-11 · suíte: 6/6 passos do CHECKLIST-GOLDEN-PATH.md passaram via automação de browser contra https://contafacil.nymbuslab.com.br real · real: 0,6 h (incluindo diagnóstico do 403 de Neon Auth)**

---

```yaml
id: T-04.02
titulo: Atualizar a documentacao viva com o rollout concluido
objetivo: Atualizar PROGRESSO.md, ROADMAP.md, README.md, CHANGELOG.md e CLAUDE.md refletindo o rollout em production
arquivos:
  cria: []
  altera: [PROGRESSO.md, ROADMAP.md, README.md, CHANGELOG.md, CLAUDE.md]
teste_integracao: Nenhum dos cinco arquivos menciona mais a promocao para production como pendente ou fora de escopo
teste_funcional: PROGRESSO.md lista o item do rollout em Concluido com a data da execucao
criterio_aceite: Os cinco documentos refletem o estado real pos-rollout, sem frase desatualizada sobre production
origem: [D-07]
depende_de: [T-04.01]
paralelizavel: false
status: concluida
```

**2026-10-11 · suíte: grep confirmou que PROGRESSO.md, ROADMAP.md, README.md, CHANGELOG.md e CLAUDE.md não mencionam mais a promoção para production como pendente · real: 0,4 h**
