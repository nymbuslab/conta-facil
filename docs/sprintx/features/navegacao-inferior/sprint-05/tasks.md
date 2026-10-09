---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: navegacao-inferior
sprint_id: sprint-05
atualizado_em: 2026-10-08
tasks:
  - id: T-05.01
    titulo: Dados ficticios na rota Perfil
    fase: F-05.1
    status: concluida
    objetivo: Mostrar nome e email ficticios mockados na rota perfil, somente leitura
    arquivos:
      cria: [src/lib/perfil-mock.ts]
      altera: [src/routes/perfil.tsx, src/routes/perfil.test.tsx]
    teste_integracao: renderizar a rota perfil via RouterProvider mostra o nome ficticio definido em perfil-mock
    teste_funcional: a tela nao renderiza nenhum campo de formulario editavel, sem input nem botao de salvar
    criterio_aceite: o texto do email ficticio aparece no documento ao renderizar a rota perfil
    origem: [D-19]
    depende_de: []
    paralelizavel: true
    concluida_em: 2026-10-08
    suite: verde
---

# Tasks — Sprint 05

---

```yaml
id: T-05.01
titulo: Dados fictícios na rota Perfil
objetivo: Mostrar nome e e-mail fictícios mockados na rota /perfil, somente leitura
arquivos:
  cria: [src/lib/perfil-mock.ts]
  altera: [src/routes/perfil.tsx, src/routes/perfil.test.tsx]
teste_integracao: renderizar a rota /perfil via RouterProvider mostra o nome fictício definido em perfil-mock
teste_funcional: a tela não renderiza nenhum campo de formulário editável (sem <input> nem botão de salvar)
criterio_aceite: o texto do e-mail fictício aparece no documento ao renderizar a rota /perfil
origem: [D-19]
depende_de: []
paralelizavel: true
status: concluida
# 2026-10-08 · suíte: 49 passed, 0 failed · real: 0,4 h
```
