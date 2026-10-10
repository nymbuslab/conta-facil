---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: integracao-neon
sprint_id: sprint-04
atualizado_em: 2026-10-10
tasks:
  - id: T-04.01
    titulo: Client HTTP autenticado para a Function
    fase: F-04.1
    status: concluida
    objetivo: Centralizar as chamadas a Function anexando o Bearer token da sessao e tratando erro de forma consistente
    arquivos:
      cria: [src/lib/api-client.ts, src/lib/api-client.test.ts]
      altera: []
    teste_integracao: Chamar apiClient.get sobre a Function local autenticada responde 200 quando o token da sessao e valido
    teste_funcional: Resposta nao-2xx da Function faz apiClient lancar ApiError com status e mensagem
    criterio_aceite: Toda chamada de apiClient inclui o Bearer token da sessao atual e uma resposta nao-2xx chega ao chamador como ApiError
    origem: [D-02]
    depende_de: [T-02.01]
    paralelizavel: true
    concluida_em: 2026-10-10
    suite: npm run test -- --run src/lib/api-client.test.ts; npm run test:integration:api-client
  - id: T-04.02
    titulo: Migrar LancamentosProvider para a Function
    fase: F-04.1
    status: concluida
    objetivo: Trocar o useState em memoria pelas chamadas via apiClient, mantendo a mesma assinatura de useLancamentos
    arquivos:
      cria: []
      altera: [src/state/lancamentos-context.tsx, src/state/lancamentos-context.test.tsx]
    teste_integracao: useLancamentos carrega os lancamentos reais do usuario de teste ao montar o provider contra a Function
    teste_funcional: Chamar adicionarDespesa resulta em lancamentos refletindo o novo item apos a chamada resolver
    criterio_aceite: useLancamentos mantem os mesmos campos e funcoes de hoje, lendo e escrevendo via apiClient, com estado de erro visivel em falha de rede
    origem: [D-02, D-06, D-11]
    depende_de: [T-03.03, T-04.01]
    paralelizavel: true
    concluida_em: 2026-10-10
    suite: npm run test -- --run src/state/lancamentos-context.test.tsx; npm run test:integration:lancamentos-provider; npm run build
  - id: T-04.03
    titulo: Migrar CaixinhasProvider para a Function
    fase: F-04.1
    status: concluida
    objetivo: Trocar o useState em memoria pelas chamadas via apiClient, mantendo a mesma assinatura de useCaixinhas
    arquivos:
      cria: []
      altera: [src/state/caixinhas-context.tsx, src/state/caixinhas-context.test.tsx]
    teste_integracao: useCaixinhas carrega as caixinhas reais do usuario de teste ao montar o provider contra a Function
    teste_funcional: Resgatar um valor maior que o guardado devolve sucesso false sem alterar caixinhas
    criterio_aceite: useCaixinhas mantem os mesmos campos e funcoes de hoje, lendo e escrevendo via apiClient, com estado de erro visivel em falha de rede
    origem: [D-02, D-06, D-11]
    depende_de: [T-03.04, T-04.01]
    paralelizavel: true
    concluida_em: 2026-10-10
    suite: npm run test -- --run src/state/caixinhas-context.test.tsx; npm run test:integration:caixinhas-provider; npm run build
  - id: T-04.04
    titulo: Estados de carregando e erro nas telas de dados
    fase: F-04.1
    status: concluida
    objetivo: Mostrar carregando, erro com tentar novamente, vazio e populado nas telas que consomem lancamentos e caixinhas
    arquivos:
      cria: []
      altera: [src/routes/index.tsx, src/routes/parcelas.tsx, src/routes/caixinhas.tsx]
    teste_integracao: Derrubar a Function durante o carregamento da Inicio mostra o estado de erro com tentar novamente, e clicar refaz a chamada
    teste_funcional: Enquanto a chamada inicial nao resolve, a tela mostra o estado de carregando, nunca uma lista vazia
    criterio_aceite: As tres telas mostram carregando, erro com tentar novamente, vazio e populado, nunca lista vazia enquanto ainda carrega
    origem: [D-06, D-11]
    depende_de: [T-04.02, T-04.03]
    paralelizavel: false
    concluida_em: 2026-10-10
    suite: npm run test -- --run; npm run build; npm run lint
---

# Tasks — Sprint 04

---

```yaml
id: T-04.01
titulo: Client HTTP autenticado para a Function
objetivo: Centralizar as chamadas a Function anexando o Bearer token da sessao e tratando erro de forma consistente
arquivos:
  cria: [src/lib/api-client.ts, src/lib/api-client.test.ts]
  altera: []
teste_integracao: Chamar apiClient.get sobre a Function local autenticada responde 200 quando o token da sessao e valido
teste_funcional: Resposta nao-2xx da Function faz apiClient lancar ApiError com status e mensagem
criterio_aceite: Toda chamada de apiClient inclui o Bearer token da sessao atual e uma resposta nao-2xx chega ao chamador como ApiError
origem: [D-02]
depende_de: [T-02.01]
paralelizavel: true
status: concluida
concluida_em: 2026-10-10
suite: npm run test -- --run src/lib/api-client.test.ts; npm run test:integration:api-client
```

---

```yaml
id: T-04.02
titulo: Migrar LancamentosProvider para a Function
objetivo: Trocar o useState em memoria pelas chamadas via apiClient, mantendo a mesma assinatura de useLancamentos
arquivos:
  cria: []
  altera: [src/state/lancamentos-context.tsx, src/state/lancamentos-context.test.tsx]
teste_integracao: useLancamentos carrega os lancamentos reais do usuario de teste ao montar o provider contra a Function
teste_funcional: Chamar adicionarDespesa resulta em lancamentos refletindo o novo item apos a chamada resolver
criterio_aceite: useLancamentos mantem os mesmos campos e funcoes de hoje, lendo e escrevendo via apiClient, com estado de erro visivel em falha de rede
origem: [D-02, D-06, D-11]
depende_de: [T-03.03, T-04.01]
paralelizavel: true
status: concluida
concluida_em: 2026-10-10
suite: npm run test -- --run src/state/lancamentos-context.test.tsx; npm run test:integration:lancamentos-provider; npm run build
```

---

```yaml
id: T-04.03
titulo: Migrar CaixinhasProvider para a Function
objetivo: Trocar o useState em memoria pelas chamadas via apiClient, mantendo a mesma assinatura de useCaixinhas
arquivos:
  cria: []
  altera: [src/state/caixinhas-context.tsx, src/state/caixinhas-context.test.tsx]
teste_integracao: useCaixinhas carrega as caixinhas reais do usuario de teste ao montar o provider contra a Function
teste_funcional: Resgatar um valor maior que o guardado devolve sucesso false sem alterar caixinhas
criterio_aceite: useCaixinhas mantem os mesmos campos e funcoes de hoje, lendo e escrevendo via apiClient, com estado de erro visivel em falha de rede
origem: [D-02, D-06, D-11]
depende_de: [T-03.04, T-04.01]
paralelizavel: true
status: concluida
concluida_em: 2026-10-10
suite: npm run test -- --run src/state/caixinhas-context.test.tsx; npm run test:integration:caixinhas-provider; npm run build
```

---

```yaml
id: T-04.04
titulo: Estados de carregando e erro nas telas de dados
objetivo: Mostrar carregando, erro com tentar novamente, vazio e populado nas telas que consomem lancamentos e caixinhas
arquivos:
  cria: []
  altera: [src/routes/index.tsx, src/routes/parcelas.tsx, src/routes/caixinhas.tsx]
teste_integracao: Derrubar a Function durante o carregamento da Inicio mostra o estado de erro com tentar novamente, e clicar refaz a chamada
teste_funcional: Enquanto a chamada inicial nao resolve, a tela mostra o estado de carregando, nunca uma lista vazia
criterio_aceite: As tres telas mostram carregando, erro com tentar novamente, vazio e populado, nunca lista vazia enquanto ainda carrega
origem: [D-06, D-11]
depende_de: [T-04.02, T-04.03]
paralelizavel: false
status: concluida
concluida_em: 2026-10-10
suite: npm run test -- --run; npm run build; npm run lint
```

> **Portão de design.** Estados de carregando/erro/vazio são elementos visuais novos (nenhuma
> tela do projeto tem exemplo hoje — `base/perfil-mock-e-testes.md`). Antes de escrever o
> código de interface, gerar o protótipo no Stitch e aguardar aprovação explícita do usuário.
