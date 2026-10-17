---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: dashboard-extrato
sprint_id: sprint-02
atualizado_em: 2026-10-17
tasks:
  - id: T-02.01
    titulo: Repositorio listarVencendo
    fase: F-02.1
    status: concluida
    objetivo: Adicionar listarVencendo ao RepositorioLancamentos, filtrando despesas nao pagas com vencimento numa janela de dias, ordenadas por vencimento
    arquivos:
      cria: []
      altera: [src/functions/api/lancamentos.ts, src/functions/api/lancamentos.test.ts]
    teste_integracao: lancamentos.test.ts chama repositorio.listarVencendo com um repositorio de teste e despesas de datas variadas
    teste_funcional: Dado despesas nao pagas vencendo em 1, 3 e 10 dias e uma paga vencendo em 2 dias, listarVencendo(userId, {dias:3,limite:3}) devolve so as duas nao pagas dentro da janela, ordenadas por vencimento
    criterio_aceite: npm run test -- lancamentos.test.ts passa cobrindo janela de dias, exclusao de pagas e isolamento por userId
    origem: [D-06]
    depende_de: []
    paralelizavel: false
    concluida_em: 2026-10-17
    suite: verde
  - id: T-02.02
    titulo: Rota GET /lancamentos/vencendo
    fase: F-02.1
    status: concluida
    objetivo: Expor listarVencendo como rota validando os parametros dias e limite
    arquivos:
      cria: []
      altera: [src/functions/api/lancamentos.ts, src/functions/api/lancamentos.test.ts]
    teste_integracao: lancamentos.test.ts chama app.request('/vencendo') com um repositorio fake e confere o corpo da resposta
    teste_funcional: Dado dias=3 na query, a rota devolve 200 com o itens do repositorio; dado dias invalido (nao numerico), devolve 400
    criterio_aceite: npm run test -- lancamentos.test.ts passa cobrindo 200 e 400 da rota nova
    origem: [D-06]
    depende_de: [T-02.01]
    paralelizavel: false
    concluida_em: 2026-10-17
    suite: verde
  - id: T-02.03
    titulo: Repositorio listarRecentes
    fase: F-02.1
    status: concluida
    objetivo: Adicionar listarRecentes ao RepositorioLancamentos, misturando tipo e ordenando por criadoEm desc, sem paginacao por cursor
    arquivos:
      cria: []
      altera: [src/functions/api/lancamentos.ts, src/functions/api/lancamentos.test.ts]
    teste_integracao: lancamentos.test.ts chama repositorio.listarRecentes com um repositorio de teste e lancamentos de tipos variados
    teste_funcional: Dados 8 lancamentos fake intercalando receita e despesa, listarRecentes(userId, {limite:5}) devolve os 5 mais recentes misturando tipo
    criterio_aceite: npm run test -- lancamentos.test.ts passa cobrindo mistura de tipo, ordenacao desc e isolamento por userId
    origem: [D-07]
    depende_de: [T-02.02]
    paralelizavel: false
    concluida_em: 2026-10-17
    suite: verde
  - id: T-02.04
    titulo: Rota GET /lancamentos/recentes
    fase: F-02.1
    status: concluida
    objetivo: Expor listarRecentes como rota validando o parametro limite
    arquivos:
      cria: []
      altera: [src/functions/api/lancamentos.ts, src/functions/api/lancamentos.test.ts]
    teste_integracao: lancamentos.test.ts chama app.request('/recentes') com um repositorio fake e confere o corpo da resposta
    teste_funcional: Dado limite=5 na query, a rota devolve 200 com os itens do repositorio; dado limite acima de LIMITE_MAXIMO, a rota normaliza para o maximo
    criterio_aceite: npm run test -- lancamentos.test.ts passa cobrindo a rota nova e a normalizacao de limite
    origem: [D-07]
    depende_de: [T-02.03]
    paralelizavel: false
    concluida_em: 2026-10-17
    suite: verde
  - id: T-02.05
    titulo: Integracao real de /lancamentos/vencendo
    fase: F-02.2
    status: concluida
    objetivo: Provar o endpoint de contas vencendo contra a branch Neon test, com isolamento por usuario
    arquivos:
      cria: []
      altera: [src/test/lancamentos-setup.ts]
    teste_integracao: lancamentos-setup.ts cria despesas para dois usuarios de teste com vencimentos variados e chama GET /lancamentos/vencendo contra o Postgres real
    teste_funcional: Dado despesas do usuario A e do usuario B com vencimentos dentro da janela, a resposta de A so contem despesas de A
    criterio_aceite: npm run test:integration:lancamentos passa cobrindo /lancamentos/vencendo
    origem: [D-06]
    depende_de: [T-02.02]
    paralelizavel: false
    concluida_em: 2026-10-17
    suite: verde
  - id: T-02.06
    titulo: Integracao real de /lancamentos/recentes
    fase: F-02.2
    status: concluida
    objetivo: Provar o endpoint de ultimos lancamentos contra a branch Neon test, com isolamento por usuario
    arquivos:
      cria: []
      altera: [src/test/lancamentos-setup.ts]
    teste_integracao: lancamentos-setup.ts cria receitas e despesas intercaladas para um usuario de teste e chama GET /lancamentos/recentes contra o Postgres real
    teste_funcional: Dados lancamentos de tipos variados, a resposta mistura tipo e vem ordenada por mais recente
    criterio_aceite: npm run test:integration:lancamentos passa cobrindo /lancamentos/recentes
    origem: [D-07]
    depende_de: [T-02.04, T-02.05]
    paralelizavel: false
    concluida_em: 2026-10-17
    suite: verde
---

# Tasks — Sprint 02

---

```yaml
id: T-02.01
titulo: Repositorio listarVencendo
objetivo: Adicionar listarVencendo ao RepositorioLancamentos, filtrando despesas nao pagas com vencimento numa janela de dias, ordenadas por vencimento
arquivos:
  cria: []
  altera: [src/functions/api/lancamentos.ts, src/functions/api/lancamentos.test.ts]
teste_integracao: lancamentos.test.ts chama repositorio.listarVencendo com um repositorio de teste e despesas de datas variadas
teste_funcional: Dado despesas nao pagas vencendo em 1, 3 e 10 dias e uma paga vencendo em 2 dias, listarVencendo(userId, {dias:3,limite:3}) devolve so as duas nao pagas dentro da janela, ordenadas por vencimento
criterio_aceite: npm run test -- lancamentos.test.ts passa cobrindo janela de dias, exclusao de pagas e isolamento por userId
origem: [D-06]
depende_de: []
paralelizavel: false
status: concluida
```

Concluída em 2026-10-17 · suíte: 21 passed, 0 failed (lancamentos.test.ts) · real: 0,3 h

---

```yaml
id: T-02.02
titulo: Rota GET /lancamentos/vencendo
objetivo: Expor listarVencendo como rota validando os parametros dias e limite
arquivos:
  cria: []
  altera: [src/functions/api/lancamentos.ts, src/functions/api/lancamentos.test.ts]
teste_integracao: lancamentos.test.ts chama app.request('/vencendo') com um repositorio fake e confere o corpo da resposta
teste_funcional: Dado dias=3 na query, a rota devolve 200 com o itens do repositorio; dado dias invalido (nao numerico), devolve 400
criterio_aceite: npm run test -- lancamentos.test.ts passa cobrindo 200 e 400 da rota nova
origem: [D-06]
depende_de: [T-02.01]
paralelizavel: false
status: concluida
```

Concluída em 2026-10-17 · suíte: 21 passed, 0 failed (lancamentos.test.ts) · real: 0,3 h

---

```yaml
id: T-02.03
titulo: Repositorio listarRecentes
objetivo: Adicionar listarRecentes ao RepositorioLancamentos, misturando tipo e ordenando por criadoEm desc, sem paginacao por cursor
arquivos:
  cria: []
  altera: [src/functions/api/lancamentos.ts, src/functions/api/lancamentos.test.ts]
teste_integracao: lancamentos.test.ts chama repositorio.listarRecentes com um repositorio de teste e lancamentos de tipos variados
teste_funcional: Dados 8 lancamentos fake intercalando receita e despesa, listarRecentes(userId, {limite:5}) devolve os 5 mais recentes misturando tipo
criterio_aceite: npm run test -- lancamentos.test.ts passa cobrindo mistura de tipo, ordenacao desc e isolamento por userId
origem: [D-07]
depende_de: [T-02.02]
paralelizavel: false
status: concluida
```

Concluída em 2026-10-17 · suíte: 21 passed, 0 failed (lancamentos.test.ts) · real: 0,25 h

---

```yaml
id: T-02.04
titulo: Rota GET /lancamentos/recentes
objetivo: Expor listarRecentes como rota validando o parametro limite
arquivos:
  cria: []
  altera: [src/functions/api/lancamentos.ts, src/functions/api/lancamentos.test.ts]
teste_integracao: lancamentos.test.ts chama app.request('/recentes') com um repositorio fake e confere o corpo da resposta
teste_funcional: Dado limite=5 na query, a rota devolve 200 com os itens do repositorio; dado limite acima de LIMITE_MAXIMO, a rota normaliza para o maximo
criterio_aceite: npm run test -- lancamentos.test.ts passa cobrindo a rota nova e a normalizacao de limite
origem: [D-07]
depende_de: [T-02.03]
paralelizavel: false
status: concluida
```

Concluída em 2026-10-17 · suíte: 21 passed, 0 failed (lancamentos.test.ts) · real: 0,25 h

---

```yaml
id: T-02.05
titulo: Integracao real de /lancamentos/vencendo
objetivo: Provar o endpoint de contas vencendo contra a branch Neon test, com isolamento por usuario
arquivos:
  cria: []
  altera: [src/test/lancamentos-setup.ts]
teste_integracao: lancamentos-setup.ts cria despesas para dois usuarios de teste com vencimentos variados e chama GET /lancamentos/vencendo contra o Postgres real
teste_funcional: Dado despesas do usuario A e do usuario B com vencimentos dentro da janela, a resposta de A so contem despesas de A
criterio_aceite: npm run test:integration:lancamentos passa cobrindo /lancamentos/vencendo
origem: [D-06]
depende_de: [T-02.02]
paralelizavel: false
status: concluida
```

Concluída em 2026-10-17 · suíte: integração real passou (test:integration:lancamentos) · real: 0,4 h

---

```yaml
id: T-02.06
titulo: Integracao real de /lancamentos/recentes
objetivo: Provar o endpoint de ultimos lancamentos contra a branch Neon test, com isolamento por usuario
arquivos:
  cria: []
  altera: [src/test/lancamentos-setup.ts]
teste_integracao: lancamentos-setup.ts cria receitas e despesas intercaladas para um usuario de teste e chama GET /lancamentos/recentes contra o Postgres real
teste_funcional: Dados lancamentos de tipos variados, a resposta mistura tipo e vem ordenada por mais recente
criterio_aceite: npm run test:integration:lancamentos passa cobrindo /lancamentos/recentes
origem: [D-07]
depende_de: [T-02.04, T-02.05]
paralelizavel: false
status: concluida
```

Concluída em 2026-10-17 · suíte: integração real passou (test:integration:lancamentos) · real: 0,3 h
