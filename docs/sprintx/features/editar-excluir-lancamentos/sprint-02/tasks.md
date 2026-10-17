---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: editar-excluir-lancamentos
sprint_id: sprint-02
atualizado_em: 2026-10-17
tasks:
  - id: T-02.01
    titulo: Repositorio ganha buscarPorId e estaVinculadoACaixinha
    fase: F-02.1
    status: concluida
    objetivo: Dar as rotas de editar/excluir como ler um lancamento e checar se ele esta vinculado a uma caixinha antes de mexer nele
    arquivos:
      cria: []
      altera: [src/functions/api/lancamentos.ts, src/functions/api/lancamentos.test.ts, src/test/lancamentos-setup.ts]
    teste_integracao: Contra o repositorioPadrao real (branch test), buscarPorId devolve null para id inexistente e a linha para id existente do usuario
    teste_funcional: estaVinculadoACaixinha devolve true quando existe caixinha_movimentacoes.lancamentoId igual ao id informado, false caso contrario
    criterio_aceite: RepositorioLancamentos expoe buscarPorId(userId, id) e estaVinculadoACaixinha(id)
    origem: [D-04]
    depende_de: []
    paralelizavel: false
    concluida_em: 2026-10-17
    suite: verde
  - id: T-02.02
    titulo: Schema zod de edicao de lancamento
    fase: F-02.2
    status: concluida
    objetivo: Validar o payload de PATCH /lancamentos/:id com os mesmos campos do formulario de criacao, mais o alcance opcional para parcela
    arquivos:
      cria: []
      altera: [src/functions/api/lancamentos.ts, src/functions/api/lancamentos.test.ts]
    teste_integracao: editarLancamentoSchema.safeParse rejeita payload sem os campos obrigatorios do tipo (receita ou despesa)
    teste_funcional: Dado um payload valido de despesa parcelada com alcance 'futuras', o schema aceita; sem parcelamentoId no lancamento, alcance 'futuras' e rejeitado
    criterio_aceite: editarLancamentoSchema valida receita e despesa com os mesmos campos de criarLancamentoSchema, mais alcance opcional ('somente' | 'futuras')
    origem: [D-05, D-03]
    depende_de: [T-02.01]
    paralelizavel: false
    concluida_em: 2026-10-17
    suite: verde
  - id: T-02.03
    titulo: Repositorio.editar aplica na parcela indicada ou nas futuras
    fase: F-02.2
    status: concluida
    objetivo: Persistir a edicao de descricao/valor/data so na linha indicada, ou propaga-la as parcelas nao pagas seguintes do mesmo parcelamento
    arquivos:
      cria: []
      altera: [src/functions/api/lancamentos.ts, src/functions/api/lancamentos.test.ts, src/test/lancamentos-setup.ts]
    teste_integracao: Contra o repositorioPadrao real (branch test), editar sem alcance (ou alcance 'somente') atualiza so a linha pedida
    teste_funcional: Dado um parcelamento de 3 parcelas, editar a parcela 2 com alcance 'futuras' atualiza descricao e valor das parcelas 2 e 3 nao pagas, preservando a parcela 1 ja paga
    criterio_aceite: repositorio.editar(userId, id, dados, alcance) atualiza 1 linha com alcance 'somente' e as linhas nao pagas com parcelaAtual maior ou igual a atual com alcance 'futuras'
    origem: [D-03, D-05]
    depende_de: [T-02.02]
    paralelizavel: false
    concluida_em: 2026-10-17
    suite: verde
  - id: T-02.04
    titulo: Rota PATCH /lancamentos/:id com idempotencia e bloqueio de caixinha
    fase: F-02.2
    status: concluida
    objetivo: Expor a edicao como rota HTTP, recusando lancamento vinculado a caixinha e exigindo Idempotency-Key
    arquivos:
      cria: []
      altera: [src/functions/api/lancamentos.ts, src/functions/api/lancamentos.test.ts]
    teste_integracao: PATCH /lancamentos/:id sem Idempotency-Key devolve 400; com a mesma chave e payload diferente devolve 409
    teste_funcional: PATCH /lancamentos/:id de uma receita vinculada a caixinha_movimentacoes devolve 409 sem chamar repositorio.editar
    criterio_aceite: rota PATCH /lancamentos/:id valida com editarLancamentoSchema, devolve 409 em vinculo de caixinha, usa executarComIdempotencia e devolve 200 com o(s) lancamento(s) atualizado(s) ou 404
    origem: [D-04, D-08]
    depende_de: [T-02.03, T-01.02]
    paralelizavel: false
    concluida_em: 2026-10-17
    suite: verde
  - id: T-02.05
    titulo: Repositorio.excluir remove a linha indicada ou as futuras
    fase: F-02.3
    status: concluida
    objetivo: Remover a linha pedida (ou as parcelas nao pagas seguintes com alcance futuras) e manter totalParcelas correto nas linhas remanescentes do grupo
    arquivos:
      cria: []
      altera: [src/functions/api/lancamentos.ts, src/functions/api/lancamentos.test.ts, src/test/lancamentos-setup.ts]
    teste_integracao: Contra o repositorioPadrao real (branch test), excluir com alcance 'somente' remove so a linha pedida e corrige totalParcelas das linhas remanescentes do mesmo parcelamentoId
    teste_funcional: Dado um parcelamento de 3 parcelas, excluir a parcela 2 com alcance 'futuras' remove as parcelas 2 e 3 nao pagas e atualiza totalParcelas da parcela 1 restante para 1
    criterio_aceite: repositorio.excluir(userId, id, alcance) remove 1 linha com alcance 'somente' e as linhas nao pagas com parcelaAtual maior ou igual a atual com alcance 'futuras', e em ambos os casos corrige totalParcelas das linhas remanescentes do grupo quando havia parcelamentoId
    origem: [D-03]
    depende_de: [T-02.04]
    paralelizavel: false
    concluida_em: 2026-10-17
    suite: verde
  - id: T-02.06
    titulo: Rota DELETE /lancamentos/:id com idempotencia e bloqueio de caixinha
    fase: F-02.3
    status: concluida
    objetivo: Expor a exclusao como rota HTTP, recusando lancamento vinculado a caixinha e exigindo Idempotency-Key
    arquivos:
      cria: []
      altera: [src/functions/api/lancamentos.ts, src/functions/api/lancamentos.test.ts]
    teste_integracao: DELETE /lancamentos/:id sem Idempotency-Key devolve 400; id inexistente devolve 404
    teste_funcional: DELETE /lancamentos/:id de uma receita vinculada a caixinha_movimentacoes devolve 409 sem chamar repositorio.excluir
    criterio_aceite: rota DELETE /lancamentos/:id devolve 409 em vinculo de caixinha, usa executarComIdempotencia e devolve 200 com os ids excluidos ou 404
    origem: [D-04, D-08]
    depende_de: [T-02.05, T-01.02]
    paralelizavel: false
    concluida_em: 2026-10-17
    suite: verde
---

# Tasks — Sprint 02

---

```yaml
id: T-02.01
titulo: Repositorio ganha buscarPorId e estaVinculadoACaixinha
objetivo: Dar as rotas de editar/excluir como ler um lancamento e checar se ele esta vinculado a uma caixinha antes de mexer nele
arquivos:
  cria: []
  altera: [src/functions/api/lancamentos.ts, src/functions/api/lancamentos.test.ts, src/test/lancamentos-setup.ts]
teste_integracao: Contra o repositorioPadrao real (branch test), buscarPorId devolve null para id inexistente e a linha para id existente do usuario
teste_funcional: estaVinculadoACaixinha devolve true quando existe caixinha_movimentacoes.lancamentoId igual ao id informado, false caso contrario
criterio_aceite: RepositorioLancamentos expoe buscarPorId(userId, id) e estaVinculadoACaixinha(id)
origem: [D-04]
depende_de: []
paralelizavel: false
status: concluida
```

Concluída em 2026-10-17 · suíte: 407 passed, 1 failed (pré-existente, pentest) ·
`npm run test:integration:lancamentos` provou isolamento por usuário contra o Postgres real
da branch `test` · real: 1,2 h.

---

```yaml
id: T-02.02
titulo: Schema zod de edicao de lancamento
objetivo: Validar o payload de PATCH /lancamentos/:id com os mesmos campos do formulario de criacao, mais o alcance opcional para parcela
arquivos:
  cria: []
  altera: [src/functions/api/lancamentos.ts, src/functions/api/lancamentos.test.ts]
teste_integracao: editarLancamentoSchema.safeParse rejeita payload sem os campos obrigatorios do tipo (receita ou despesa)
teste_funcional: Dado um payload valido de despesa parcelada com alcance 'futuras', o schema aceita; sem parcelamentoId no lancamento, alcance 'futuras' e rejeitado
criterio_aceite: editarLancamentoSchema valida receita e despesa com os mesmos campos de criarLancamentoSchema, mais alcance opcional ('somente' | 'futuras')
origem: [D-05, D-03]
depende_de: [T-02.01]
paralelizavel: false
status: concluida
```

Concluída em 2026-10-17 · suíte: 30 passed, 0 failed (`lancamentos.test.ts`) · real: 0,4 h.

---

```yaml
id: T-02.03
titulo: Repositorio.editar aplica na parcela indicada ou nas futuras
objetivo: Persistir a edicao de descricao/valor/data so na linha indicada, ou propaga-la as parcelas nao pagas seguintes do mesmo parcelamento
arquivos:
  cria: []
  altera: [src/functions/api/lancamentos.ts, src/functions/api/lancamentos.test.ts, src/test/lancamentos-setup.ts]
teste_integracao: Contra o repositorioPadrao real (branch test), editar sem alcance (ou alcance 'somente') atualiza so a linha pedida
teste_funcional: Dado um parcelamento de 3 parcelas, editar a parcela 2 com alcance 'futuras' atualiza descricao e valor das parcelas 2 e 3 nao pagas, preservando a parcela 1 ja paga
criterio_aceite: repositorio.editar(userId, id, dados, alcance) atualiza 1 linha com alcance 'somente' e as linhas nao pagas com parcelaAtual maior ou igual a atual com alcance 'futuras'
origem: [D-03, D-05]
depende_de: [T-02.02]
paralelizavel: false
status: concluida
```

Concluída em 2026-10-17 · suíte verde · `npm run test:integration:lancamentos` provou o filtro por
índice de parcela (não por status pago), endereçando o achado MÉDIA da F5 sobre T-02.03 · real: 0,6 h.

---

```yaml
id: T-02.04
titulo: Rota PATCH /lancamentos/:id com idempotencia e bloqueio de caixinha
objetivo: Expor a edicao como rota HTTP, recusando lancamento vinculado a caixinha e exigindo Idempotency-Key
arquivos:
  cria: []
  altera: [src/functions/api/lancamentos.ts, src/functions/api/lancamentos.test.ts]
teste_integracao: PATCH /lancamentos/:id sem Idempotency-Key devolve 400; com a mesma chave e payload diferente devolve 409
teste_funcional: PATCH /lancamentos/:id de uma receita vinculada a caixinha_movimentacoes devolve 409 sem chamar repositorio.editar
criterio_aceite: rota PATCH /lancamentos/:id valida com editarLancamentoSchema, devolve 409 em vinculo de caixinha, usa executarComIdempotencia e devolve 200 com o(s) lancamento(s) atualizado(s) ou 404
origem: [D-04, D-08]
depende_de: [T-02.03, T-01.02]
paralelizavel: false
status: concluida
```

Concluída em 2026-10-17 · suíte: 30 passed, 0 failed (`lancamentos.test.ts`) · real: 0,5 h.

---

```yaml
id: T-02.05
titulo: Repositorio.excluir remove a linha indicada ou as futuras
objetivo: Remover a linha pedida (ou as parcelas nao pagas seguintes com alcance futuras) e manter totalParcelas correto nas linhas remanescentes do grupo
arquivos:
  cria: []
  altera: [src/functions/api/lancamentos.ts, src/functions/api/lancamentos.test.ts, src/test/lancamentos-setup.ts]
teste_integracao: Contra o repositorioPadrao real (branch test), excluir com alcance 'somente' remove so a linha pedida e corrige totalParcelas das linhas remanescentes do mesmo parcelamentoId
teste_funcional: Dado um parcelamento de 3 parcelas, excluir a parcela 2 com alcance 'futuras' remove as parcelas 2 e 3 nao pagas e atualiza totalParcelas da parcela 1 restante para 1
criterio_aceite: repositorio.excluir(userId, id, alcance) remove 1 linha com alcance 'somente' e as linhas nao pagas com parcelaAtual maior ou igual a atual com alcance 'futuras', e em ambos os casos corrige totalParcelas das linhas remanescentes do grupo quando havia parcelamentoId
origem: [D-03]
depende_de: [T-02.04]
paralelizavel: false
status: concluida
```

Concluída em 2026-10-17 · suíte verde · `npm run test:integration:lancamentos` excluiu a parcela do
MEIO do grupo (não a última) e provou a correção de `totalParcelas`, endereçando o achado MÉDIA
da F5 sobre T-02.05 · real: 0,6 h.

---

```yaml
id: T-02.06
titulo: Rota DELETE /lancamentos/:id com idempotencia e bloqueio de caixinha
objetivo: Expor a exclusao como rota HTTP, recusando lancamento vinculado a caixinha e exigindo Idempotency-Key
arquivos:
  cria: []
  altera: [src/functions/api/lancamentos.ts, src/functions/api/lancamentos.test.ts]
teste_integracao: DELETE /lancamentos/:id sem Idempotency-Key devolve 400; id inexistente devolve 404
teste_funcional: DELETE /lancamentos/:id de uma receita vinculada a caixinha_movimentacoes devolve 409 sem chamar repositorio.excluir
criterio_aceite: rota DELETE /lancamentos/:id devolve 409 em vinculo de caixinha, usa executarComIdempotencia e devolve 200 com os ids excluidos ou 404
origem: [D-04, D-08]
depende_de: [T-02.05, T-01.02]
paralelizavel: false
status: concluida
```

Concluída em 2026-10-17 · suíte: 30 passed, 0 failed (`lancamentos.test.ts`) · real: 0,4 h.
