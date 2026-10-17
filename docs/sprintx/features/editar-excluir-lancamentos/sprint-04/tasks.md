---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: editar-excluir-lancamentos
sprint_id: sprint-04
atualizado_em: 2026-10-17
tasks:
  - id: T-04.01
    titulo: Linha de receita abre AcoesLancamentoDialog
    fase: F-04.1
    status: concluida
    objetivo: Fazer ExtratoLista e ListaLancamentos abrirem o novo dialogo tambem ao clicar numa linha de receita
    arquivos:
      cria: []
      altera: [src/components/extrato-lista.tsx, src/components/lista-lancamentos.tsx, src/components/extrato-lista.test.tsx, src/components/lista-lancamentos.test.tsx, src/lib/colunas-lancamento.tsx, src/components/fluxos-assincronos.test.tsx, src/components/acessibilidade.test.tsx]
    teste_integracao: Clicar numa linha de receita no Extrato abre AcoesLancamentoDialog
    teste_funcional: ExtratoLista e ListaLancamentos passam onRowClick e rotuloLinha tambem na tabela de receita, usando AcoesLancamentoDialog no lugar de ConfirmarPagamentoDialog
    criterio_aceite: clicar em qualquer linha, de receita ou despesa, abre AcoesLancamentoDialog com as acoes certas para aquele lancamento
    origem: [D-01, D-06]
    depende_de: [T-03.06]
    paralelizavel: false
    concluida_em: 2026-10-17
    suite: verde
  - id: T-04.02
    titulo: Despesa ja paga tambem abre o dialogo
    fase: F-04.1
    status: concluida
    objetivo: Permitir editar/excluir uma despesa ja paga, com aviso de que ela ja foi paga
    arquivos:
      cria: []
      altera: [src/components/extrato-lista.tsx, src/components/lista-lancamentos.tsx, src/components/extrato-lista.test.tsx, src/components/lista-lancamentos.test.tsx]
    teste_integracao: Clicar numa despesa paga abre o dialogo, sem a opcao marcar como paga
    teste_funcional: Despesa ja paga mostra editar e excluir no dialogo, com um aviso de que a despesa ja foi paga
    criterio_aceite: linhaDesabilitada nao desabilita mais despesa paga; o dialogo mostra editar/excluir com aviso para despesa paga
    origem: [D-02]
    depende_de: [T-04.01]
    paralelizavel: false
    concluida_em: 2026-10-17
    suite: verde
  - id: T-04.03
    titulo: Tela Parcelas reflete edicao/exclusao de parcela
    fase: F-04.1
    status: concluida
    objetivo: Confirmar que editar ou excluir uma parcela no Extrato atualiza os agregados que a tela Parcelas mostra, sem nova navegacao
    arquivos:
      cria: []
      altera: [src/routes/parcelas.test.tsx, src/test/api-client-mocks.ts, src/test/api-client-mocks.test.ts]
    teste_integracao: Apos editar/excluir uma parcela no Extrato, a tela Parcelas recarrega (via versaoParcelamentos) e mostra os agregados atualizados
    teste_funcional: Editar o valor de uma parcela nao paga muda valorTotal do grupo na tela Parcelas; excluir uma parcela muda totalParcelas e valorTotal
    criterio_aceite: tela Parcelas reflete edicao/exclusao de parcela sem precisar de nova navegacao, via versaoParcelamentos
    origem: [D-10]
    depende_de: [T-04.02]
    paralelizavel: false
    concluida_em: 2026-10-17
    suite: verde
---

# Tasks — Sprint 04

---

```yaml
id: T-04.01
titulo: Linha de receita abre AcoesLancamentoDialog
objetivo: Fazer ExtratoLista e ListaLancamentos abrirem o novo dialogo tambem ao clicar numa linha de receita
arquivos:
  cria: []
  altera: [src/components/extrato-lista.tsx, src/components/lista-lancamentos.tsx, src/components/extrato-lista.test.tsx, src/components/lista-lancamentos.test.tsx, src/lib/colunas-lancamento.tsx, src/components/fluxos-assincronos.test.tsx, src/components/acessibilidade.test.tsx]
teste_integracao: Clicar numa linha de receita no Extrato abre AcoesLancamentoDialog
teste_funcional: ExtratoLista e ListaLancamentos passam onRowClick e rotuloLinha tambem na tabela de receita, usando AcoesLancamentoDialog no lugar de ConfirmarPagamentoDialog
criterio_aceite: clicar em qualquer linha, de receita ou despesa, abre AcoesLancamentoDialog com as acoes certas para aquele lancamento
origem: [D-01, D-06]
depende_de: [T-03.06]
paralelizavel: false
status: concluida
```

Concluída em 2026-10-17 · suíte: 423 passed, 1 failed (pré-existente, pentest) · real: 1,5 h.
Divergências: `rotuloLinhaDespesa` virou `rotuloLinhaLancamento` (generico, cobre receita e
despesa); `ConfirmarPagamentoDialog` ficou sem uso e foi removido
(`src/components/confirmar-pagamento-dialog.tsx`); os dois testes que exercitavam o fluxo antigo
de clique direto (`fluxos-assincronos.test.tsx`, `acessibilidade.test.tsx`) foram atualizados
para passar pelo menu de ações primeiro — nenhum estava na lista original de arquivos da task.

---

```yaml
id: T-04.02
titulo: Despesa ja paga tambem abre o dialogo
objetivo: Permitir editar/excluir uma despesa ja paga, com aviso de que ela ja foi paga
arquivos:
  cria: []
  altera: [src/components/extrato-lista.tsx, src/components/lista-lancamentos.tsx, src/components/extrato-lista.test.tsx, src/components/lista-lancamentos.test.tsx]
teste_integracao: Clicar numa despesa paga abre o dialogo, sem a opcao marcar como paga
teste_funcional: Despesa ja paga mostra editar e excluir no dialogo, com um aviso de que a despesa ja foi paga
criterio_aceite: linhaDesabilitada nao desabilita mais despesa paga; o dialogo mostra editar/excluir com aviso para despesa paga
origem: [D-02]
depende_de: [T-04.01]
paralelizavel: false
status: concluida
```

Concluída em 2026-10-17 · suíte verde (mesmo conjunto de arquivos de T-04.01) · real: incluído em
T-04.01 — despesa paga e não paga passaram a usar o mesmo `onRowClick`, sem `linhaDesabilitada`.

---

```yaml
id: T-04.03
titulo: Tela Parcelas reflete edicao/exclusao de parcela
objetivo: Confirmar que editar ou excluir uma parcela no Extrato atualiza os agregados que a tela Parcelas mostra, sem nova navegacao
arquivos:
  cria: []
  altera: [src/routes/parcelas.test.tsx, src/test/api-client-mocks.ts, src/test/api-client-mocks.test.ts]
teste_integracao: Apos editar/excluir uma parcela no Extrato, a tela Parcelas recarrega (via versaoParcelamentos) e mostra os agregados atualizados
teste_funcional: Editar o valor de uma parcela nao paga muda valorTotal do grupo na tela Parcelas; excluir uma parcela muda totalParcelas e valorTotal
criterio_aceite: tela Parcelas reflete edicao/exclusao de parcela sem precisar de nova navegacao, via versaoParcelamentos
origem: [D-10]
depende_de: [T-04.02]
paralelizavel: false
status: concluida
```

Concluída em 2026-10-17 · suíte: 6 passed, 0 failed (`parcelas.test.tsx`) · real: 0,8 h.
Divergência: o mock `patchIdempotente` (T-01.01) devolvia um objeto único para editar; a Function
real sempre devolve array (por causa do alcance "futuras" afetar várias linhas) — corrigido em
`src/test/api-client-mocks.ts` e `src/test/api-client-mocks.test.ts`, fora da lista original de
arquivos da task. Sem essa correção, `editarDespesa` quebraria em produção para qualquer edição
real, não só para "futuras".
