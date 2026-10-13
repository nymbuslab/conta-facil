---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: idempotencia-escrita-financeira
sprint_id: sprint-01
atualizado_em: 2026-10-11
tasks:
  - id: T-01.01
    titulo: Criar fixtures idempotentes
    fase: F-01.1
    status: concluida
    objetivo: Fornecer chaves e cenarios reutilizaveis para repeticao e conflito
    arquivos:
      cria: [src/test/idempotencia-fixtures.ts, src/test/idempotencia-fixtures.test.ts]
      altera: []
    teste_integracao: Importa a fixture no Vitest e cria cenarios para lancamento deposito e resgate sem compartilhar referencias mutaveis
    teste_funcional: Gera UUID valido preserva o primeiro payload e altera somente o segundo quando solicitado
    criterio_aceite: Os tres cenarios usam UUID valido mesma chave e objetos independentes com variacao controlada
    origem: [capacidade-teste]
    depende_de: []
    paralelizavel: false
    concluida_em: 2026-10-11
    suite: verde
---

# Tasks - Sprint 01

```yaml
id: T-01.01
titulo: Criar fixtures idempotentes
objetivo: Fornecer chaves e cenários reutilizáveis para repetição e conflito
arquivos:
  cria: [src/test/idempotencia-fixtures.ts, src/test/idempotencia-fixtures.test.ts]
  altera: []
teste_integracao: Importa a fixture no Vitest para lançamento depósito e resgate sem referências compartilhadas
teste_funcional: Gera UUID válido preserva o primeiro payload e altera somente o segundo
criterio_aceite: Os três cenários usam UUID válido mesma chave e objetos independentes
origem: [capacidade-teste]
depende_de: []
paralelizavel: false
status: concluida
```

Conclusão T-01.01: 2026-10-11 · suíte: 3 cenários, 0 failed · real: 0,2 h.
