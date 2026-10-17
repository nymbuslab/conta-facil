---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: editar-excluir-lancamentos
sprint_id: sprint-01
atualizado_em: 2026-10-17
tasks:
  - id: T-01.01
    titulo: Mock da API client simula editar/excluir lancamentos
    fase: F-01.1
    status: concluida
    objetivo: Fazer o cliente de teste responder PATCH e DELETE em /lancamentos/:id, incluindo o bloqueio quando o lancamento esta vinculado a uma caixinha
    arquivos:
      cria: []
      altera: [src/test/api-client-mocks.ts, src/test/api-client-mocks.test.ts, src/lib/api-client.ts, src/lib/api-client.test.ts]
    teste_integracao: Cliente de teste chamado com PATCH e DELETE em /lancamentos/:id contra o mock devolve o lancamento atualizado ou a lista sem o excluido
    teste_funcional: Dado um lancamento cujo id aparece em caixinha_movimentacoes.lancamentoId do estado de teste, o mock recusa patch/delete com status 409
    criterio_aceite: api-client-mocks.ts responde PATCH e DELETE em /lancamentos/:id e recusa com 409 quando ha vinculo com caixinha_movimentacoes
    origem: [capacidade-teste]
    depende_de: []
    paralelizavel: true
    concluida_em: 2026-10-17
    suite: verde
  - id: T-01.02
    titulo: Fake RepositorioLancamentos ganha editar e excluir
    fase: F-01.1
    status: concluida
    objetivo: Dar ao teste de rota um repositorio fake que mocka editar e excluir, igual ja faz com marcarComoPaga
    arquivos:
      cria: []
      altera: [src/functions/api/lancamentos.test.ts]
    teste_integracao: criarRepositorio() de teste expoe editar e excluir como vi.fn() mockaveis por teste
    teste_funcional: Um teste de rota consegue mockar repositorio.editar e repositorio.excluir com mockResolvedValue e mockRejectedValue proprios
    criterio_aceite: criarRepositorio() em lancamentos.test.ts inclui editar e excluir no objeto devolvido
    origem: [capacidade-teste]
    depende_de: []
    paralelizavel: true
    concluida_em: 2026-10-17
    suite: verde
---

# Tasks — Sprint 01

---

```yaml
id: T-01.01
titulo: Mock da API client simula editar/excluir lancamentos
objetivo: Fazer o cliente de teste responder PATCH e DELETE em /lancamentos/:id, incluindo o bloqueio quando o lancamento esta vinculado a uma caixinha
arquivos:
  cria: []
  altera: [src/test/api-client-mocks.ts]
teste_integracao: Cliente de teste chamado com PATCH e DELETE em /lancamentos/:id contra o mock devolve o lancamento atualizado ou a lista sem o excluido
teste_funcional: Dado um lancamento cujo id aparece em caixinha_movimentacoes.lancamentoId do estado de teste, o mock recusa patch/delete com status 409
criterio_aceite: api-client-mocks.ts responde PATCH e DELETE em /lancamentos/:id e recusa com 409 quando ha vinculo com caixinha_movimentacoes
origem: [capacidade-teste]
depende_de: []
paralelizavel: true
status: concluida
```

Concluída em 2026-10-17 · suíte: 22 passed, 0 failed (`api-client.test.ts` + `api-client-mocks.test.ts`) · real: 0,5 h.

Divergência: o plano não previa que `patch`/`delete` do `ApiClient` real não enviam
`Idempotency-Key` (só `postIdempotente` enviava) — foi preciso acrescentar `patchIdempotente`
e `deleteIdempotente` em `src/lib/api-client.ts`, fora da lista original de arquivos da task,
para D-08 (idempotência em editar/excluir) ser realizável.

---

```yaml
id: T-01.02
titulo: Fake RepositorioLancamentos ganha editar e excluir
objetivo: Dar ao teste de rota um repositorio fake que mocka editar e excluir, igual ja faz com marcarComoPaga
arquivos:
  cria: []
  altera: [src/functions/api/lancamentos.test.ts]
teste_integracao: criarRepositorio() de teste expoe editar e excluir como vi.fn() mockaveis por teste
teste_funcional: Um teste de rota consegue mockar repositorio.editar e repositorio.excluir com mockResolvedValue e mockRejectedValue proprios
criterio_aceite: criarRepositorio() em lancamentos.test.ts inclui editar e excluir no objeto devolvido
origem: [capacidade-teste]
depende_de: []
paralelizavel: true
status: concluida
```

Concluída em 2026-10-17 · suíte: 22 passed, 0 failed (`lancamentos.test.ts`) · real: 0,3 h.
