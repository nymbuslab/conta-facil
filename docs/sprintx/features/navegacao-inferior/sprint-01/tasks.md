---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: navegacao-inferior
sprint_id: sprint-01
atualizado_em: 2026-10-08
tasks:
  - id: T-01.01
    titulo: Instalar e configurar Vitest com ambiente jsdom
    fase: F-01.1
    status: concluida
    objetivo: Adicionar Vitest ao projeto e configurar o ambiente jsdom e o script de teste
    arquivos:
      cria: []
      altera: [vite.config.ts, package.json, package-lock.json]
    teste_integracao: npm run test -- --run --passWithNoTests executa sem erro de configuracao
    teste_funcional: a configuracao exportada em vite.config.ts declara test.environment igual a jsdom
    criterio_aceite: npm run test -- --run --passWithNoTests termina com codigo de saida 0 e test.environment e jsdom
    origem: [capacidade-teste]
    depende_de: []
    paralelizavel: false
    concluida_em: 2026-10-08
    suite: verde
  - id: T-01.02
    titulo: Setup do Testing Library e helper renderWithProviders
    fase: F-01.1
    status: concluida
    objetivo: Configurar os matchers do jest-dom e criar um helper de render que envolve o LancamentosProvider
    arquivos:
      cria: [src/test/setup.ts, src/test/test-utils.tsx]
      altera: [vite.config.ts, package.json, package-lock.json]
    teste_integracao: o Vitest carrega src/test/setup.ts via setupFiles sem lancar erro
    teste_funcional: renderWithProviders(um componente simples) retorna um resultado com getByText funcional
    criterio_aceite: renderWithProviders(<div>ok</div>) permite encontrar o texto ok no documento
    origem: [capacidade-teste]
    depende_de: [T-01.01]
    paralelizavel: false
    concluida_em: 2026-10-08
    suite: verde
  - id: T-01.03
    titulo: Smoke test do componente Header
    fase: F-01.1
    status: concluida
    objetivo: Provar que a suite roda de ponta a ponta com um teste real sobre um componente existente
    arquivos:
      cria: [src/components/header.test.tsx]
      altera: []
    teste_integracao: npm run test -- --run executa o arquivo de smoke test e ele passa
    teste_funcional: renderizar Header com renderWithProviders encontra o texto Conta Simples no documento
    criterio_aceite: npm run test -- --run termina com 0 failed e ao menos 1 passed
    origem: [capacidade-teste]
    depende_de: [T-01.02]
    paralelizavel: false
    concluida_em: 2026-10-08
    suite: verde
---

# Tasks — Sprint 01

---

```yaml
id: T-01.01
titulo: Instalar e configurar Vitest com ambiente jsdom
objetivo: Adicionar Vitest ao projeto e configurar o ambiente jsdom e o script de teste
arquivos:
  cria: []
  altera: [vite.config.ts, package.json, package-lock.json]
teste_integracao: npm run test -- --run --passWithNoTests executa sem erro de configuração
teste_funcional: a configuração exportada em vite.config.ts declara test.environment igual a "jsdom"
criterio_aceite: npm run test -- --run --passWithNoTests termina com código de saída 0 e test.environment é "jsdom"
origem: [capacidade-teste]
depende_de: []
paralelizavel: false
status: concluida
# 2026-10-08 · suíte: 0 passed, 0 failed (passWithNoTests) · real: 0,1 h
```

---

```yaml
id: T-01.02
titulo: Setup do Testing Library e helper renderWithProviders
objetivo: Configurar os matchers do jest-dom e criar um helper de render que envolve o LancamentosProvider
arquivos:
  cria: [src/test/setup.ts, src/test/test-utils.tsx]
  altera: [vite.config.ts, package.json, package-lock.json]
teste_integracao: o Vitest carrega src/test/setup.ts via setupFiles sem lançar erro
teste_funcional: renderWithProviders(um componente simples) retorna um resultado com getByText funcional
criterio_aceite: renderWithProviders(<div>ok</div>) permite encontrar o texto "ok" no documento
origem: [capacidade-teste]
depende_de: [T-01.01]
paralelizavel: false
status: concluida
# 2026-10-08 · suíte: 1 passed, 0 failed · real: 0,2 h
```

---

```yaml
id: T-01.03
titulo: Smoke test do componente Header
objetivo: Provar que a suíte roda de ponta a ponta com um teste real sobre um componente existente
arquivos:
  cria: [src/components/header.test.tsx]
  altera: []
teste_integracao: npm run test -- --run executa o arquivo de smoke test e ele passa
teste_funcional: renderizar <Header /> com renderWithProviders encontra o texto "Conta Simples" no documento
criterio_aceite: npm run test -- --run termina com 0 failed e ao menos 1 passed
origem: [capacidade-teste]
depende_de: [T-01.02]
paralelizavel: false
status: concluida
# 2026-10-08 · suíte: 2 passed, 0 failed · real: 0,2 h
```
