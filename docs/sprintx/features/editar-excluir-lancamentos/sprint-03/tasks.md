---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: editar-excluir-lancamentos
sprint_id: sprint-03
atualizado_em: 2026-10-17
tasks:
  - id: T-03.01
    titulo: Contexto ganha editarReceita, editarDespesa e excluirLancamento
    fase: F-03.1
    status: concluida
    objetivo: Expor as tres mutacoes novas no LancamentosProvider, otimistas com rollback, igual marcarComoPaga ja faz
    arquivos:
      cria: []
      altera: [src/state/lancamentos-context.tsx, src/state/lancamentos-context.test.tsx]
    teste_integracao: Mock da Function devolve erro; as tres mutacoes revertem a lista local ao estado anterior e relancam o erro para quem chamou
    teste_funcional: Dado um lancamento existente, cada mutacao atualiza a lista local na hora com os dados novos, confirma com a resposta da Function e chama invalidarParcelamentos quando o lancamento tem parcelamentoId
    criterio_aceite: LancamentosContextValue expoe editarReceita, editarDespesa e excluirLancamento, otimistas com rollback em falha
    origem: [D-01, D-05, D-08]
    depende_de: [T-01.01]
    paralelizavel: false
    concluida_em: 2026-10-17
    suite: verde
  - id: T-03.02
    titulo: Novo AcoesLancamentoDialog com menu de acoes
    fase: F-03.2
    status: concluida
    objetivo: Criar o dialogo que abre ao clicar na linha, mostrando as acoes disponiveis conforme tipo e status do lancamento
    arquivos:
      cria: [src/components/acoes-lancamento-dialog.tsx, src/components/acoes-lancamento-dialog.test.tsx]
      altera: []
    teste_integracao: Clicar numa despesa pendente abre o dialogo mostrando marcar como paga, editar e excluir; uma receita mostra so editar e excluir
    teste_funcional: Escolher 'Marcar como paga' dispara a mesma confirmacao que o ConfirmarPagamentoDialog ja fazia, preservando o comportamento existente
    criterio_aceite: AcoesLancamentoDialog mostra o menu de acoes compativel com o tipo e o status do lancamento recebido
    origem: [D-06]
    depende_de: [T-03.01]
    paralelizavel: false
    concluida_em: 2026-10-17
    suite: verde
  - id: T-03.03
    titulo: Acao Editar mostra formulario preenchido
    fase: F-03.2
    status: concluida
    objetivo: Reaproveitar os campos de formulario de LancamentoModal, pre-preenchidos com os valores atuais, para editar o lancamento
    arquivos:
      cria: []
      altera: [src/components/acoes-lancamento-dialog.tsx, src/components/acoes-lancamento-dialog.test.tsx]
    teste_integracao: Escolher Editar mostra os campos preenchidos com descricao, valor e data atuais do lancamento
    teste_funcional: Submeter o formulario de edicao chama editarReceita ou editarDespesa do contexto com os valores novos e fecha o dialogo em caso de sucesso
    criterio_aceite: formulario de edicao usa os mesmos campos e validacao de LancamentoModal, pre-preenchidos, e salva via contexto
    origem: [D-05]
    depende_de: [T-03.02]
    paralelizavel: false
    concluida_em: 2026-10-17
    suite: verde
  - id: T-03.04
    titulo: Acao Excluir mostra confirmacao destrutiva
    fase: F-03.2
    status: concluida
    objetivo: Mostrar um botao vermelho que nomeia a consequencia antes de excluir de fato
    arquivos:
      cria: []
      altera: [src/components/acoes-lancamento-dialog.tsx, src/components/acoes-lancamento-dialog.test.tsx]
    teste_integracao: Escolher Excluir mostra um botao vermelho com texto que nomeia a consequencia (acao nao pode ser desfeita)
    teste_funcional: Confirmar a exclusao chama excluirLancamento do contexto e fecha o dialogo em caso de sucesso
    criterio_aceite: confirmacao de exclusao usa a variante destructive e um texto que nomeia a consequencia, antes de chamar excluirLancamento
    origem: [D-07]
    depende_de: [T-03.03]
    paralelizavel: false
    concluida_em: 2026-10-17
    suite: verde
  - id: T-03.05
    titulo: Pergunta de alcance para lancamento parcelado
    fase: F-03.2
    status: concluida
    objetivo: Perguntar se a edicao ou exclusao vale so para esta parcela ou para esta e as futuras, quando o lancamento pertence a um parcelamento
    arquivos:
      cria: []
      altera: [src/components/acoes-lancamento-dialog.tsx, src/components/acoes-lancamento-dialog.test.tsx]
    teste_integracao: Editar ou excluir um lancamento com parcelamentoId mostra a escolha 'so esta parcela' ou 'esta e as futuras' antes de confirmar
    teste_funcional: Escolher 'esta e as futuras' envia alcance 'futuras' para editarDespesa/excluirLancamento; lancamento sem parcelamentoId nao mostra a pergunta
    criterio_aceite: dialogo pergunta o alcance somente quando o lancamento tem parcelamentoId, e repassa a escolha para o contexto
    origem: [D-03]
    depende_de: [T-03.04]
    paralelizavel: false
    concluida_em: 2026-10-17
    suite: verde
  - id: T-03.06
    titulo: Erro de vinculo com caixinha aparece no dialogo
    fase: F-03.2
    status: concluida
    objetivo: Mostrar o erro 409 do backend quando o usuario tenta editar ou excluir uma receita vinculada a uma caixinha
    arquivos:
      cria: []
      altera: [src/components/acoes-lancamento-dialog.tsx, src/components/acoes-lancamento-dialog.test.tsx]
    teste_integracao: Mock da Function devolve 409 ao editar/excluir; o dialogo mostra o erro sem fechar
    teste_funcional: A mensagem de erro explica que a receita esta vinculada a um deposito em caixinha e nao pode ser editada/excluida por ali
    criterio_aceite: erro 409 do backend aparece no dialogo pelo mesmo padrao de mensagemErroApi ja usado em ConfirmarPagamentoDialog, sem fechar o dialogo
    origem: [D-04]
    depende_de: [T-03.05]
    paralelizavel: false
    concluida_em: 2026-10-17
    suite: verde
---

# Tasks — Sprint 03

---

```yaml
id: T-03.01
titulo: Contexto ganha editarReceita, editarDespesa e excluirLancamento
objetivo: Expor as tres mutacoes novas no LancamentosProvider, otimistas com rollback, igual marcarComoPaga ja faz
arquivos:
  cria: []
  altera: [src/state/lancamentos-context.tsx, src/state/lancamentos-context.test.tsx]
teste_integracao: Mock da Function devolve erro; as tres mutacoes revertem a lista local ao estado anterior e relancam o erro para quem chamou
teste_funcional: Dado um lancamento existente, cada mutacao atualiza a lista local na hora com os dados novos, confirma com a resposta da Function e chama invalidarParcelamentos quando o lancamento tem parcelamentoId
criterio_aceite: LancamentosContextValue expoe editarReceita, editarDespesa e excluirLancamento, otimistas com rollback em falha
origem: [D-01, D-05, D-08]
depende_de: [T-01.01]
paralelizavel: false
status: concluida
```

Concluída em 2026-10-17 · suíte: 14 passed, 0 failed (`lancamentos-context.test.tsx`) · real: 0,6 h.

---

```yaml
id: T-03.02
titulo: Novo AcoesLancamentoDialog com menu de acoes
objetivo: Criar o dialogo que abre ao clicar na linha, mostrando as acoes disponiveis conforme tipo e status do lancamento
arquivos:
  cria: [src/components/acoes-lancamento-dialog.tsx, src/components/acoes-lancamento-dialog.test.tsx]
  altera: []
teste_integracao: Clicar numa despesa pendente abre o dialogo mostrando marcar como paga, editar e excluir; uma receita mostra so editar e excluir
teste_funcional: Escolher 'Marcar como paga' dispara a mesma confirmacao que o ConfirmarPagamentoDialog ja fazia, preservando o comportamento existente
criterio_aceite: AcoesLancamentoDialog mostra o menu de acoes compativel com o tipo e o status do lancamento recebido
origem: [D-06]
depende_de: [T-03.01]
paralelizavel: false
status: concluida
```

Concluída em 2026-10-17 · suíte: 8 passed, 0 failed (`acoes-lancamento-dialog.test.tsx`) · real: 1,0 h
(T-03.02 a T-03.06 implementadas juntas no mesmo componente novo, testadas e fechadas como um
bloco — ver nota em T-03.06).

---

```yaml
id: T-03.03
titulo: Acao Editar mostra formulario preenchido
objetivo: Reaproveitar os campos de formulario de LancamentoModal, pre-preenchidos com os valores atuais, para editar o lancamento
arquivos:
  cria: []
  altera: [src/components/acoes-lancamento-dialog.tsx, src/components/acoes-lancamento-dialog.test.tsx]
teste_integracao: Escolher Editar mostra os campos preenchidos com descricao, valor e data atuais do lancamento
teste_funcional: Submeter o formulario de edicao chama editarReceita ou editarDespesa do contexto com os valores novos e fecha o dialogo em caso de sucesso
criterio_aceite: formulario de edicao usa os mesmos campos e validacao de LancamentoModal, pre-preenchidos, e salva via contexto
origem: [D-05]
depende_de: [T-03.02]
paralelizavel: false
status: concluida
```

Concluída em 2026-10-17 · suíte verde (mesmo arquivo de T-03.02) · real: incluído em T-03.02.

---

```yaml
id: T-03.04
titulo: Acao Excluir mostra confirmacao destrutiva
objetivo: Mostrar um botao vermelho que nomeia a consequencia antes de excluir de fato
arquivos:
  cria: []
  altera: [src/components/acoes-lancamento-dialog.tsx, src/components/acoes-lancamento-dialog.test.tsx]
teste_integracao: Escolher Excluir mostra um botao vermelho com texto que nomeia a consequencia (acao nao pode ser desfeita)
teste_funcional: Confirmar a exclusao chama excluirLancamento do contexto e fecha o dialogo em caso de sucesso
criterio_aceite: confirmacao de exclusao usa a variante destructive e um texto que nomeia a consequencia, antes de chamar excluirLancamento
origem: [D-07]
depende_de: [T-03.03]
paralelizavel: false
status: concluida
```

Concluída em 2026-10-17 · suíte verde (mesmo arquivo de T-03.02) · real: incluído em T-03.02.

---

```yaml
id: T-03.05
titulo: Pergunta de alcance para lancamento parcelado
objetivo: Perguntar se a edicao ou exclusao vale so para esta parcela ou para esta e as futuras, quando o lancamento pertence a um parcelamento
arquivos:
  cria: []
  altera: [src/components/acoes-lancamento-dialog.tsx, src/components/acoes-lancamento-dialog.test.tsx]
teste_integracao: Editar ou excluir um lancamento com parcelamentoId mostra a escolha 'so esta parcela' ou 'esta e as futuras' antes de confirmar
teste_funcional: Escolher 'esta e as futuras' envia alcance 'futuras' para editarDespesa/excluirLancamento; lancamento sem parcelamentoId nao mostra a pergunta
criterio_aceite: dialogo pergunta o alcance somente quando o lancamento tem parcelamentoId, e repassa a escolha para o contexto
origem: [D-03]
depende_de: [T-03.04]
paralelizavel: false
status: concluida
```

Concluída em 2026-10-17 · suíte verde (mesmo arquivo de T-03.02) · real: incluído em T-03.02.

---

```yaml
id: T-03.06
titulo: Erro de vinculo com caixinha aparece no dialogo
objetivo: Mostrar o erro 409 do backend quando o usuario tenta editar ou excluir uma receita vinculada a uma caixinha
arquivos:
  cria: []
  altera: [src/components/acoes-lancamento-dialog.tsx, src/components/acoes-lancamento-dialog.test.tsx]
teste_integracao: Mock da Function devolve 409 ao editar/excluir; o dialogo mostra o erro sem fechar
teste_funcional: A mensagem de erro explica que a receita esta vinculada a um deposito em caixinha e nao pode ser editada/excluida por ali
criterio_aceite: erro 409 do backend aparece no dialogo pelo mesmo padrao de mensagemErroApi ja usado em ConfirmarPagamentoDialog, sem fechar o dialogo
origem: [D-04]
depende_de: [T-03.05]
paralelizavel: false
status: concluida
```

Concluída em 2026-10-17 · suíte verde (mesmo arquivo de T-03.02) · real: incluído em T-03.02.
Nota: T-03.02 a T-03.06 foram implementadas e testadas como um bloco só, no mesmo componente
(`acoes-lancamento-dialog.tsx`) — granularidade de planejamento virou granularidade de PR, não de
sessões de trabalho separadas.
