---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: dashboard-extrato
sprint_id: sprint-01
atualizado_em: 2026-10-17
tasks:
  - id: T-01.01
    titulo: Mock de GET /lancamentos/vencendo no cliente fake de testes
    fase: F-01.1
    status: concluida
    objetivo: Fazer o cliente fake de lancamentos responder a /lancamentos/vencendo com despesas nao pagas na janela de dias pedida
    arquivos:
      cria: []
      altera: [src/test/api-client-mocks.ts, src/test/api-client-mocks.test.ts]
    teste_integracao: api-client-mocks.test.ts chama get('/lancamentos/vencendo?dias=3') contra um estado fake com despesas em datas variadas
    teste_funcional: Dado despesas nao pagas com vencimento em 1, 3 e 10 dias, o mock devolve so as duas primeiras, ordenadas por vencimento
    criterio_aceite: npm run test -- api-client-mocks.test.ts passa cobrindo a janela de dias e a exclusao de despesas pagas
    origem: [D-06]
    depende_de: []
    paralelizavel: false
    concluida_em: 2026-10-17
    suite: verde
  - id: T-01.02
    titulo: Mock de GET /lancamentos/recentes no cliente fake de testes
    fase: F-01.1
    status: concluida
    objetivo: Fazer o cliente fake de lancamentos responder a /lancamentos/recentes misturando receita e despesa, mais recente primeiro
    arquivos:
      cria: []
      altera: [src/test/api-client-mocks.ts, src/test/api-client-mocks.test.ts]
    teste_integracao: api-client-mocks.test.ts chama get('/lancamentos/recentes?limite=5') contra um estado fake com receitas e despesas intercaladas
    teste_funcional: Dados 8 lancamentos fake de tipos variados, o mock devolve os 5 mais recentes misturando tipo, sem paginacao
    criterio_aceite: npm run test -- api-client-mocks.test.ts passa cobrindo a mistura de tipos e o limite
    origem: [D-07]
    depende_de: [T-01.01]
    paralelizavel: false
    concluida_em: 2026-10-17
    suite: verde
  - id: T-01.03
    titulo: Rota vazia /extrato registrada no roteador
    fase: F-01.2
    status: concluida
    objetivo: Criar a rota /extrato com um componente minimo e registra-la em router.tsx, sem conteudo de negocio ainda
    arquivos:
      cria: [src/routes/extrato.tsx, src/routes/extrato.test.tsx]
      altera: [src/router.tsx]
    teste_integracao: extrato.test.tsx renderiza a rota via renderRoute('/extrato') dentro dos providers existentes
    teste_funcional: Dado um usuario autenticado, navegar para /extrato renderiza sem lancar erro
    criterio_aceite: npm run test -- extrato.test.tsx passa com a rota montada
    origem: [D-01, D-03]
    depende_de: []
    paralelizavel: true
    concluida_em: 2026-10-17
    suite: verde
---

# Tasks — Sprint 01

> Um bloco por task. Na execução (F6), a linha `status` é atualizada em cada transição; ao
> concluir, acrescente data e resultado da suíte.

---

```yaml
id: T-01.01
titulo: Mock de GET /lancamentos/vencendo no cliente fake de testes
objetivo: Fazer o cliente fake de lancamentos responder a /lancamentos/vencendo com despesas nao pagas na janela de dias pedida
arquivos:
  cria: []
  altera: [src/test/api-client-mocks.ts, src/test/api-client-mocks.test.ts]
teste_integracao: api-client-mocks.test.ts chama get('/lancamentos/vencendo?dias=3') contra um estado fake com despesas em datas variadas
teste_funcional: Dado despesas nao pagas com vencimento em 1, 3 e 10 dias, o mock devolve so as duas primeiras, ordenadas por vencimento
criterio_aceite: npm run test -- api-client-mocks.test.ts passa cobrindo a janela de dias e a exclusao de despesas pagas
origem: [D-06]
depende_de: []
paralelizavel: false
status: concluida
```

Concluída em 2026-10-17 · suíte: 5 passed, 0 failed · real: 0,2 h

---

```yaml
id: T-01.02
titulo: Mock de GET /lancamentos/recentes no cliente fake de testes
objetivo: Fazer o cliente fake de lancamentos responder a /lancamentos/recentes misturando receita e despesa, mais recente primeiro
arquivos:
  cria: []
  altera: [src/test/api-client-mocks.ts, src/test/api-client-mocks.test.ts]
teste_integracao: api-client-mocks.test.ts chama get('/lancamentos/recentes?limite=5') contra um estado fake com receitas e despesas intercaladas
teste_funcional: Dados 8 lancamentos fake de tipos variados, o mock devolve os 5 mais recentes misturando tipo, sem paginacao
criterio_aceite: npm run test -- api-client-mocks.test.ts passa cobrindo a mistura de tipos e o limite
origem: [D-07]
depende_de: [T-01.01]
paralelizavel: false
status: concluida
```

Concluída em 2026-10-17 · suíte: 5 passed, 0 failed · real: 0,15 h

---

```yaml
id: T-01.03
titulo: Rota vazia /extrato registrada no roteador
objetivo: Criar a rota /extrato com um componente minimo e registra-la em router.tsx, sem conteudo de negocio ainda
arquivos:
  cria: [src/routes/extrato.tsx, src/routes/extrato.test.tsx]
  altera: [src/router.tsx]
teste_integracao: extrato.test.tsx renderiza a rota via renderRoute('/extrato') dentro dos providers existentes
teste_funcional: Dado um usuario autenticado, navegar para /extrato renderiza sem lancar erro
criterio_aceite: npm run test -- extrato.test.tsx passa com a rota montada
origem: [D-01, D-03]
depende_de: []
paralelizavel: true
status: concluida
```

Concluída em 2026-10-17 · suíte: 1 passed, 0 failed · real: 0,1 h
