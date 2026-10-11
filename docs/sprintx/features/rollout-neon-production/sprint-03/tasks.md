---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: rollout-neon-production
sprint_id: sprint-03
atualizado_em: 2026-10-11
tasks:
  - id: T-03.01
    titulo: Verificar token e criar o projeto Cloudflare Pages
    fase: F-03.1
    status: concluida
    objetivo: Confirmar que CLOUDFLARE_API_TOKEN esta no ambiente e criar (ou confirmar existente) o projeto Pages para o build do Vite via wrangler
    arquivos:
      cria: []
      altera: []
    teste_integracao: wrangler whoami confirma a conta autenticada antes de criar o projeto
    teste_funcional: wrangler pages project list mostra o projeto conta-facil criado apos o comando
    criterio_aceite: O projeto Cloudflare Pages existe e esta associado a conta de nymbuslab.com.br
    origem: [D-03, D-12]
    depende_de: []
    paralelizavel: true
    concluida_em: 2026-10-11
    suite: verde
  - id: T-03.02
    titulo: Configurar VITE_NEON_FUNCTION_API_BASE_URL no Cloudflare Pages
    fase: F-03.1
    status: concluida
    objetivo: Definir, nas env vars de producao do projeto Pages, a URL real da Function de production implantada em T-02.02
    arquivos:
      cria: []
      altera: []
    teste_integracao: A configuracao de env vars do projeto Pages lista VITE_NEON_FUNCTION_API_BASE_URL
    teste_funcional: O valor da variavel bate com a URL retornada por list_functions da branch production
    criterio_aceite: VITE_NEON_FUNCTION_API_BASE_URL esta configurada no Cloudflare Pages com a URL real da Function production
    origem: [D-10]
    depende_de: [T-02.02, T-03.01]
    paralelizavel: false
    concluida_em: 2026-10-11
    suite: verde
  - id: T-03.03
    titulo: Configurar o DNS de contafacil.nymbuslab.com.br
    fase: F-03.1
    status: concluida
    objetivo: Apontar o dominio contafacil.nymbuslab.com.br no Cloudflare para o projeto Pages criado em T-03.01
    arquivos:
      cria: []
      altera: []
    teste_integracao: wrangler pages domain list mostra o dominio customizado associado ao projeto
    teste_funcional: Uma consulta DNS a contafacil.nymbuslab.com.br resolve para o Cloudflare Pages
    criterio_aceite: O dominio contafacil.nymbuslab.com.br resolve para o projeto Cloudflare Pages
    origem: [D-04, D-11]
    depende_de: [T-03.01]
    paralelizavel: false
    concluida_em: 2026-10-11
    suite: verde
  - id: T-03.04
    titulo: Buildar e publicar o deploy de producao
    fase: F-03.1
    status: concluida
    objetivo: Rodar npm run build e publicar o resultado como deploy de producao no projeto Pages
    arquivos:
      cria: []
      altera: []
    teste_integracao: wrangler pages deployment list mostra um deployment de producao recem-criado
    teste_funcional: Uma requisicao HTTP a https://contafacil.nymbuslab.com.br retorna 200 e o HTML do SPA
    criterio_aceite: https://contafacil.nymbuslab.com.br responde 200 com o build atual do app
    origem: [D-03]
    depende_de: [T-03.02, T-03.03]
    paralelizavel: false
    concluida_em: 2026-10-11
    suite: verde
---

# Tasks — Sprint 03

---

```yaml
id: T-03.01
titulo: Verificar token e criar o projeto Cloudflare Pages
objetivo: Confirmar que CLOUDFLARE_API_TOKEN esta no ambiente e criar (ou confirmar existente) o projeto Pages para o build do Vite via wrangler
arquivos:
  cria: []
  altera: []
teste_integracao: wrangler whoami confirma a conta autenticada antes de criar o projeto
teste_funcional: wrangler pages project list mostra o projeto conta-facil criado apos o comando
criterio_aceite: O projeto Cloudflare Pages existe e esta associado a conta de nymbuslab.com.br
origem: [D-03, D-12]
depende_de: []
paralelizavel: true
status: concluida
```

**2026-10-11 · suíte: wrangler whoami confirmou a conta Nymbuslab@gmail.com's Account; wrangler pages project list mostra `conta-facil` criado · real: 0,2 h**

---

```yaml
id: T-03.02
titulo: Configurar VITE_NEON_FUNCTION_API_BASE_URL no Cloudflare Pages
objetivo: Definir, nas env vars de producao do projeto Pages, a URL real da Function de production implantada em T-02.02
arquivos:
  cria: []
  altera: []
teste_integracao: A configuracao de env vars do projeto Pages lista VITE_NEON_FUNCTION_API_BASE_URL
teste_funcional: O valor da variavel bate com a URL retornada por list_functions da branch production
criterio_aceite: VITE_NEON_FUNCTION_API_BASE_URL esta configurada no Cloudflare Pages com a URL real da Function production
origem: [D-10]
depende_de: [T-02.02, T-03.01]
paralelizavel: false
status: concluida
```

**2026-10-11 · suíte: PATCH na API do Cloudflare confirmou deployment_configs.production.env_vars.VITE_NEON_FUNCTION_API_BASE_URL igual à URL real da Function · real: 0,2 h**

---

```yaml
id: T-03.03
titulo: Configurar o DNS de contafacil.nymbuslab.com.br
objetivo: Apontar o dominio contafacil.nymbuslab.com.br no Cloudflare para o projeto Pages criado em T-03.01
arquivos:
  cria: []
  altera: []
teste_integracao: wrangler pages domain list mostra o dominio customizado associado ao projeto
teste_funcional: Uma consulta DNS a contafacil.nymbuslab.com.br resolve para o Cloudflare Pages
criterio_aceite: O dominio contafacil.nymbuslab.com.br resolve para o projeto Cloudflare Pages
origem: [D-04, D-11]
depende_de: [T-03.01]
paralelizavel: false
status: concluida
```

**2026-10-11 · suíte: Pages domain status "active" em verification/validation; GET contafacil.nymbuslab.com.br → 200 com HTML do SPA · real: 1,0 h (incluindo diagnóstico do Worker avulso)**

---

```yaml
id: T-03.04
titulo: Buildar e publicar o deploy de producao
objetivo: Rodar npm run build e publicar o resultado como deploy de producao no projeto Pages
arquivos:
  cria: []
  altera: []
teste_integracao: wrangler pages deployment list mostra um deployment de producao recem-criado
teste_funcional: Uma requisicao HTTP a https://contafacil.nymbuslab.com.br retorna 200 e o HTML do SPA
criterio_aceite: https://contafacil.nymbuslab.com.br responde 200 com o build atual do app
origem: [D-03]
depende_de: [T-03.02, T-03.03]
paralelizavel: false
status: concluida
```

**2026-10-11 · suíte: `wrangler pages deployment list` mostra o deployment de produção; `GET https://contafacil.nymbuslab.com.br` → 200 com o HTML do SPA · real: 0,3 h**
