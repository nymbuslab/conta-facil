---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: navegacao-inferior
sprint_id: sprint-03
atualizado_em: 2026-10-08
tasks:
  - id: T-03.01
    titulo: Estender tipos e schema de Despesa para parcelamento
    fase: F-03.1
    status: concluida
    objetivo: Adicionar os campos de parcelamento ao tipo Despesa e a validacao condicional ao schema do formulario
    arquivos:
      cria: [src/types/lancamento.test.ts]
      altera: [src/types/lancamento.ts, src/lib/mock-data.ts]
    teste_integracao: despesaFormSchema.safeParse com parcelado true e quantidadeParcelas ausente retorna success false
    teste_funcional: despesaFormSchema.safeParse com parcelado false aceita uma despesa comum sem exigir quantidadeParcelas
    criterio_aceite: o schema rejeita parcelado true sem quantidadeParcelas maior ou igual a 2 e aceita com um valor valido
    origem: [D-05, D-06]
    depende_de: []
    paralelizavel: false
    concluida_em: 2026-10-08
    suite: verde
  - id: T-03.02
    titulo: Gerar parcelas no adicionarDespesa do contexto
    fase: F-03.1
    status: concluida
    objetivo: Fazer adicionarDespesa criar N despesas mensais quando parcelado, dividindo o valor total com ajuste de centavos
    arquivos:
      cria: [src/lib/datas.ts, src/state/lancamentos-context.test.tsx]
      altera: [src/state/lancamentos-context.tsx]
    teste_integracao: chamar adicionarDespesa com parcelado true, valor total 1.000,00 e quantidadeParcelas 3 insere 3 despesas no estado compartilhando o mesmo parcelamentoId, com valores 333,33, 333,33 e 333,34, nessa ordem, o resto de centavos sempre somado a ultima parcela
    teste_funcional: a soma dos valores das 3 despesas geradas e exatamente 1000,00 e nenhuma parcela antes da ultima recebe o resto de centavos
    criterio_aceite: cada despesa gerada tem vencimento um mes apos a anterior e a mesma dataEmissao do grupo
    origem: [D-06, D-07, D-08, D-09]
    depende_de: [T-03.01]
    paralelizavel: false
    concluida_em: 2026-10-08
    suite: verde
  - id: T-03.03
    titulo: Implementar marcarComoPaga no contexto
    fase: F-03.1
    status: concluida
    objetivo: Permitir alternar o campo paga de uma despesa existente
    arquivos:
      cria: []
      altera: [src/state/lancamentos-context.tsx]
    teste_integracao: chamar marcarComoPaga com o id de uma despesa existente altera o campo paga dela para true no estado
    teste_funcional: despesas com outros ids permanecem com paga inalterado apos a chamada
    criterio_aceite: a despesa com o id chamado tem paga true depois da chamada e as demais continuam false
    origem: [D-11]
    depende_de: [T-03.02]
    paralelizavel: false
    concluida_em: 2026-10-08
    suite: verde
  - id: T-03.04
    titulo: Checkbox Parcelado no modal de Despesa
    fase: F-03.2
    status: concluida
    objetivo: Adicionar o checkbox Parcelado e o campo de quantidade de parcelas ao formulario de Despesa
    arquivos:
      cria: [src/components/ui/checkbox.tsx, src/components/lancamento-modal.test.tsx]
      altera: [src/components/lancamento-modal.tsx, src/test/setup.ts]
    teste_integracao: marcar o checkbox Parcelado no formulario exibe o campo Quantidade de parcelas
    teste_funcional: submeter o formulario com parcelado marcado e quantidade 3 chama adicionarDespesa com parcelado true e quantidadeParcelas 3
    criterio_aceite: o rotulo do campo Valor muda para Valor total da divida quando o checkbox esta marcado
    origem: [D-05, D-06]
    depende_de: [T-03.01, T-03.02]
    paralelizavel: false
    concluida_em: 2026-10-08
    suite: verde
  - id: T-03.05
    titulo: Popup de confirmar pagamento na tela Inicio
    fase: F-03.2
    status: concluida
    objetivo: Tornar as linhas de Despesa clicaveis, abrindo um dialogo de confirmacao de pagamento
    arquivos:
      cria: [src/components/confirmar-pagamento-dialog.tsx, src/components/lista-lancamentos.test.tsx]
      altera: [src/components/lista-lancamentos.tsx, src/components/data-table.tsx]
    teste_integracao: clicar numa linha de despesa na lista abre o dialogo de confirmacao com a descricao da despesa
    teste_funcional: confirmar no dialogo chama marcarComoPaga com o id da despesa clicada
    criterio_aceite: cancelar no dialogo fecha sem chamar marcarComoPaga
    origem: [D-12]
    depende_de: [T-03.03]
    paralelizavel: false
    concluida_em: 2026-10-08
    suite: verde
  - id: T-03.06
    titulo: Cards de parcelamento na aba Parcelas
    fase: F-03.2
    status: concluida
    objetivo: Agrupar despesas por parcelamentoId e mostrar um card de progresso por compra
    arquivos:
      cria: [src/components/parcela-card.tsx, src/components/parcela-card.test.tsx, src/lib/parcelamento.ts]
      altera: [src/routes/parcelas.tsx, src/routes/parcelas.test.tsx]
    teste_integracao: renderizar a rota /parcelas com despesas parceladas no estado mostra um card por parcelamentoId
    teste_funcional: dado 3 de 12 parcelas marcadas como pagas, o card mostra Pago igual a 3 vezes o valor da parcela e Falta igual a 9 vezes
    criterio_aceite: o card mostra o badge no formato X/N correspondente a quantidade de parcelas pagas sobre o total
    origem: [D-10]
    depende_de: [T-03.02, T-03.03]
    paralelizavel: false
    concluida_em: 2026-10-08
    suite: verde
---

# Tasks — Sprint 03

---

```yaml
id: T-03.01
titulo: Estender tipos e schema de Despesa para parcelamento
objetivo: Adicionar os campos de parcelamento ao tipo Despesa e a validação condicional ao schema do formulário
arquivos:
  cria: [src/types/lancamento.test.ts]
  altera: [src/types/lancamento.ts, src/lib/mock-data.ts]
teste_integracao: despesaFormSchema.safeParse com parcelado:true e quantidadeParcelas ausente retorna success:false
teste_funcional: despesaFormSchema.safeParse com parcelado:false aceita uma despesa comum sem exigir quantidadeParcelas
criterio_aceite: o schema rejeita parcelado:true sem quantidadeParcelas >= 2 e aceita com um valor válido
origem: [D-05, D-06]
depende_de: []
paralelizavel: false
status: concluida
# 2026-10-08 · suíte: 15 passed, 0 failed · real: 0,5 h
```

---

```yaml
id: T-03.02
titulo: Gerar parcelas no adicionarDespesa do contexto
objetivo: Fazer adicionarDespesa criar N despesas mensais quando parcelado, dividindo o valor total com ajuste de centavos
arquivos:
  cria: [src/lib/datas.ts, src/state/lancamentos-context.test.tsx]
  altera: [src/state/lancamentos-context.tsx]
teste_integracao: chamar adicionarDespesa com parcelado:true, valor total "1.000,00" e quantidadeParcelas:3 insere 3 despesas no estado compartilhando o mesmo parcelamentoId, com valores 333,33 / 333,33 / 333,34, nessa ordem — o resto de centavos sempre somado à ÚLTIMA parcela
teste_funcional: a soma dos valores das 3 despesas geradas é exatamente 1000,00 e nenhuma parcela antes da última recebe o resto de centavos
criterio_aceite: cada despesa gerada tem vencimento um mês após a anterior e a mesma dataEmissao do grupo
origem: [D-06, D-07, D-08, D-09]
depende_de: [T-03.01]
paralelizavel: false
status: concluida
# 2026-10-08 · suíte: 18 passed, 0 failed · real: 0,8 h
```

---

```yaml
id: T-03.03
titulo: Implementar marcarComoPaga no contexto
objetivo: Permitir alternar o campo paga de uma despesa existente
arquivos:
  cria: []
  altera: [src/state/lancamentos-context.tsx]
teste_integracao: chamar marcarComoPaga com o id de uma despesa existente altera o campo paga dela para true no estado
teste_funcional: despesas com outros ids permanecem com paga inalterado após a chamada
criterio_aceite: a despesa com o id chamado tem paga:true depois da chamada e as demais continuam false
origem: [D-11]
depende_de: [T-03.02]
paralelizavel: false
status: concluida
# 2026-10-08 · suíte: 18 passed, 0 failed · real: 0,2 h
```

---

```yaml
id: T-03.04
titulo: Checkbox "Parcelado?" no modal de Despesa
objetivo: Adicionar o checkbox "Parcelado?" e o campo de quantidade de parcelas ao formulário de Despesa
arquivos:
  cria: [src/components/ui/checkbox.tsx, src/components/lancamento-modal.test.tsx]
  altera: [src/components/lancamento-modal.tsx, src/test/setup.ts]
teste_integracao: marcar o checkbox "Parcelado?" no formulário exibe o campo "Quantidade de parcelas"
teste_funcional: submeter o formulário com parcelado marcado e quantidade 3 chama adicionarDespesa com parcelado:true e quantidadeParcelas:3
criterio_aceite: o rótulo do campo Valor muda para "Valor total da dívida" quando o checkbox está marcado
origem: [D-05, D-06]
depende_de: [T-03.01, T-03.02]
paralelizavel: false
status: concluida
# 2026-10-08 · suíte: 21 passed, 0 failed · real: 0,9 h
```

---

```yaml
id: T-03.05
titulo: Popup de confirmar pagamento na tela Início
objetivo: Tornar as linhas de Despesa clicáveis, abrindo um diálogo de confirmação de pagamento
arquivos:
  cria: [src/components/confirmar-pagamento-dialog.tsx, src/components/lista-lancamentos.test.tsx]
  altera: [src/components/lista-lancamentos.tsx, src/components/data-table.tsx]
teste_integracao: clicar numa linha de despesa na lista abre o diálogo de confirmação com a descrição da despesa
teste_funcional: confirmar no diálogo chama marcarComoPaga com o id da despesa clicada
criterio_aceite: cancelar no diálogo fecha sem chamar marcarComoPaga
origem: [D-12]
depende_de: [T-03.03]
paralelizavel: false
status: concluida
# 2026-10-08 · suíte: 24 passed, 0 failed · real: 0,8 h
```

---

```yaml
id: T-03.06
titulo: Cards de parcelamento na aba Parcelas
objetivo: Agrupar despesas por parcelamentoId e mostrar um card de progresso por compra
arquivos:
  cria: [src/components/parcela-card.tsx, src/components/parcela-card.test.tsx, src/lib/parcelamento.ts]
  altera: [src/routes/parcelas.tsx, src/routes/parcelas.test.tsx]
teste_integracao: renderizar a rota /parcelas com despesas parceladas no estado mostra um card por parcelamentoId
teste_funcional: dado 3 de 12 parcelas marcadas como pagas, o card mostra Pago = 3× o valor da parcela e Falta = 9× o valor da parcela
criterio_aceite: o card mostra o badge no formato "X/N" correspondente à quantidade de parcelas pagas sobre o total
origem: [D-10]
depende_de: [T-03.02, T-03.03]
paralelizavel: false
status: concluida
# 2026-10-08 · suíte: 27 passed, 0 failed · real: 1,0 h
```
