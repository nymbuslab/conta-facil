---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: editar-excluir-lancamentos
sprint_id: sprint-05
atualizado_em: 2026-10-17
tasks:
  - id: T-05.01
    titulo: Aviso de despesa ja paga no dialogo
    fase: F-05.1
    status: concluida
    objetivo: Mostrar no menu de acoes um aviso quando a despesa ja foi paga, explicando que editar/excluir afeta o card Total Pago
    arquivos:
      cria: []
      altera: [src/components/acoes-lancamento-dialog.tsx, src/components/acoes-lancamento-dialog.test.tsx]
    teste_integracao: Menu de acoes de uma despesa paga mostra o aviso; menu de despesa nao paga ou de receita nao mostra
    teste_funcional: O texto do aviso menciona que a despesa ja foi paga e que a mudanca afeta o card Total Pago
    criterio_aceite: TelaMenu mostra o aviso quando lancamento.tipo === 'despesa' e lancamento.paga, e so nesse caso
    origem: [D-02]
    depende_de: []
    paralelizavel: false
    concluida_em: 2026-10-17
    suite: verde
---

# Tasks — Sprint 05

---

```yaml
id: T-05.01
titulo: Aviso de despesa ja paga no dialogo
objetivo: Mostrar no menu de acoes um aviso quando a despesa ja foi paga, explicando que editar/excluir afeta o card Total Pago
arquivos:
  cria: []
  altera: [src/components/acoes-lancamento-dialog.tsx, src/components/acoes-lancamento-dialog.test.tsx]
teste_integracao: Menu de acoes de uma despesa paga mostra o aviso; menu de despesa nao paga ou de receita nao mostra
teste_funcional: O texto do aviso menciona que a despesa ja foi paga e que a mudanca afeta o card Total Pago
criterio_aceite: TelaMenu mostra o aviso quando lancamento.tipo === 'despesa' e lancamento.paga, e so nesse caso
origem: [D-02]
depende_de: []
paralelizavel: false
status: concluida
```

Concluída em 2026-10-17 · suíte: 11 passed, 0 failed (`acoes-lancamento-dialog.test.tsx`) · real: 0,3 h.
