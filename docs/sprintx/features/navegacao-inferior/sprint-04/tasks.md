---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: navegacao-inferior
sprint_id: sprint-04
atualizado_em: 2026-10-08
tasks:
  - id: T-04.01
    titulo: Tipos e schemas de Caixinha
    fase: F-04.1
    status: concluida
    objetivo: Definir o tipo Caixinha e os schemas zod de criar e de movimentar valor
    arquivos:
      cria: [src/types/caixinha.ts, src/types/caixinha.test.ts]
      altera: []
    teste_integracao: o schema de criacao rejeita nome vazio
    teste_funcional: o schema de movimentacao aceita um valor positivo em formato pt-BR e rejeita valor menor ou igual a zero
    criterio_aceite: o schema de criacao exige nome e meta validos
    origem: [D-14]
    depende_de: []
    paralelizavel: false
    concluida_em: 2026-10-08
    suite: verde
  - id: T-04.02
    titulo: CaixinhasProvider
    fase: F-04.1
    status: concluida
    objetivo: Implementar o provider de Caixinhas com criar depositar resgatar excluir e totalGuardado
    arquivos:
      cria: [src/state/caixinhas-context.tsx, src/state/caixinhas-context.test.tsx]
      altera: [src/routes/__root.tsx]
    teste_integracao: criar uma caixinha e depositar reflete no valorGuardado dela e no totalGuardado agregado
    teste_funcional: resgatar um valor maior que o guardado em uma caixinha nao altera o estado e sinaliza erro
    criterio_aceite: excluir uma caixinha remove ela da lista e reduz totalGuardado pelo valor que ela tinha
    origem: [D-13, D-15, D-17]
    depende_de: [T-04.01]
    paralelizavel: false
    concluida_em: 2026-10-08
    suite: verde
  - id: T-04.03
    titulo: Hook useSaldoAcumulado combinando Lancamentos e Caixinhas
    fase: F-04.2
    status: concluida
    objetivo: Calcular Receita menos Despesa menos totalGuardado a partir dos dois contextos
    arquivos:
      cria: [src/hooks/use-saldo-acumulado.ts, src/hooks/use-saldo-acumulado.test.tsx]
      altera: []
    teste_integracao: dado receitas despesas e uma caixinha com valor guardado no estado, o hook retorna o saldo combinando os tres
    teste_funcional: depositar numa caixinha reduz o valor retornado pelo hook em uma nova renderizacao
    criterio_aceite: o resultado do hook e igual a saldoReceita menos saldoDespesa menos totalGuardado arredondado a duas casas
    origem: [D-16]
    depende_de: [T-04.02]
    paralelizavel: false
    concluida_em: 2026-10-08
    suite: verde
  - id: T-04.04
    titulo: Componente CaixinhaCard
    fase: F-04.2
    status: concluida
    objetivo: Mostrar nome valor guardado meta e barra de progresso de uma caixinha
    arquivos:
      cria: [src/components/caixinha-card.tsx, src/components/caixinha-card.test.tsx]
      altera: []
    teste_integracao: renderizar CaixinhaCard com uma caixinha mockada mostra o nome e o valor guardado
    teste_funcional: dado valorGuardado 2400 e meta 6000, a barra de progresso reflete 40 por cento
    criterio_aceite: o percentual exibido e igual a valorGuardado dividido pela meta vezes 100 arredondado
    origem: [D-14]
    depende_de: [T-04.02]
    paralelizavel: false
    concluida_em: 2026-10-08
    suite: verde
  - id: T-04.05
    titulo: Modal de nova caixinha
    fase: F-04.2
    status: concluida
    objetivo: Formulario para criar uma caixinha nova com nome e meta
    arquivos:
      cria: [src/components/nova-caixinha-modal.tsx, src/components/nova-caixinha-modal.test.tsx]
      altera: [src/test/test-utils.tsx]
    teste_integracao: submeter o formulario de nova caixinha chama a funcao criar do provider com os dados corretos
    teste_funcional: validacao bloqueia submissao com nome vazio
    criterio_aceite: apos submissao valida o modal fecha e o formulario e limpo
    origem: [D-13, D-14]
    depende_de: [T-04.01, T-04.02]
    paralelizavel: false
    concluida_em: 2026-10-08
    suite: verde
  - id: T-04.06
    titulo: Modal de depositar e resgatar
    fase: F-04.2
    status: concluida
    objetivo: Formulario para depositar ou resgatar valor de uma caixinha existente
    arquivos:
      cria: [src/components/movimentar-caixinha-modal.tsx, src/components/movimentar-caixinha-modal.test.tsx]
      altera: []
    teste_integracao: submeter deposito soma ao valorGuardado da caixinha selecionada
    teste_funcional: submeter resgate maior que o valor guardado exibe mensagem de erro e nao altera o estado
    criterio_aceite: resgate com valor valido subtrai do valorGuardado da caixinha selecionada
    origem: [D-15]
    depende_de: [T-04.01, T-04.02]
    paralelizavel: false
    concluida_em: 2026-10-08
    suite: verde
  - id: T-04.07
    titulo: Montar a rota Caixinhas de fato
    fase: F-04.3
    status: concluida
    objetivo: Compor CaixinhaCard, modal de nova caixinha, modal de movimentar e acao de excluir na rota caixinhas
    arquivos:
      cria: [src/routes/caixinhas.test.tsx]
      altera: [src/routes/caixinhas.tsx]
    teste_integracao: renderizar a rota caixinhas com caixinhas no estado mostra um card por caixinha com nome e progresso
    teste_funcional: clicar em excluir numa caixinha remove o card correspondente da lista renderizada
    criterio_aceite: a rota mostra um botao de nova caixinha que abre o modal de criacao
    origem: [D-13, D-14, D-18]
    depende_de: [T-04.04, T-04.05, T-04.06]
    paralelizavel: false
    concluida_em: 2026-10-08
    suite: verde
  - id: T-04.08
    titulo: Card Guardado e saldo acumulado na Inicio
    fase: F-04.3
    status: concluida
    objetivo: Mostrar o terceiro card Guardado e usar useSaldoAcumulado na tela Inicio
    arquivos:
      cria: [src/components/saldo-card.test.tsx, src/routes/index.test.tsx]
      altera: [src/components/saldo-card.tsx, src/routes/index.tsx]
    teste_integracao: renderizar a tela Inicio com caixinhas no estado mostra o card Guardado com o total correto
    teste_funcional: alterar o valor guardado em caixinhas via provider reflete no saldo acumulado renderizado na Inicio
    criterio_aceite: a tela Inicio mostra 3 cards lado a lado Receita Despesa e Guardado
    origem: [D-16, D-18]
    depende_de: [T-04.03]
    paralelizavel: false
    concluida_em: 2026-10-08
    suite: verde
---

# Tasks — Sprint 04

---

```yaml
id: T-04.01
titulo: Tipos e schemas de Caixinha
objetivo: Definir o tipo Caixinha e os schemas zod de criar e de movimentar valor
arquivos:
  cria: [src/types/caixinha.ts, src/types/caixinha.test.ts]
  altera: []
teste_integracao: o schema de criação rejeita nome vazio
teste_funcional: o schema de movimentação aceita um valor positivo em formato pt-BR e rejeita valor <= 0
criterio_aceite: o schema de criação exige nome e meta válidos
origem: [D-14]
depende_de: []
paralelizavel: false
status: concluida
# 2026-10-08 · suíte: 4 passed, 0 failed (arquivo isolado) · real: 0,4 h
```

---

```yaml
id: T-04.02
titulo: CaixinhasProvider
objetivo: Implementar o provider de Caixinhas com criar, depositar, resgatar, excluir e totalGuardado
arquivos:
  cria: [src/state/caixinhas-context.tsx, src/state/caixinhas-context.test.tsx]
  altera: [src/routes/__root.tsx]
teste_integracao: criar uma caixinha e depositar reflete no valorGuardado dela e no totalGuardado agregado
teste_funcional: resgatar um valor maior que o guardado em uma caixinha não altera o estado e sinaliza erro
criterio_aceite: excluir uma caixinha remove ela da lista e reduz totalGuardado pelo valor que ela tinha
origem: [D-13, D-15, D-17]
depende_de: [T-04.01]
paralelizavel: false
status: concluida
# 2026-10-08 · suíte: 34 passed, 0 failed · real: 1,0 h
```

---

```yaml
id: T-04.03
titulo: Hook useSaldoAcumulado combinando Lançamentos e Caixinhas
objetivo: Calcular Receita − Despesa − totalGuardado a partir dos dois contextos
arquivos:
  cria: [src/hooks/use-saldo-acumulado.ts, src/hooks/use-saldo-acumulado.test.tsx]
  altera: []
teste_integracao: dado receitas, despesas e uma caixinha com valor guardado no estado, o hook retorna o saldo combinando os três
teste_funcional: depositar numa caixinha reduz o valor retornado pelo hook numa nova renderização
criterio_aceite: o resultado do hook é igual a saldoReceita − saldoDespesa − totalGuardado, arredondado a 2 casas
origem: [D-16]
depende_de: [T-04.02]
paralelizavel: false
status: concluida
# 2026-10-08 · suíte: 35 passed, 0 failed · real: 0,3 h
```

---

```yaml
id: T-04.04
titulo: Componente CaixinhaCard
objetivo: Mostrar nome, valor guardado, meta e barra de progresso de uma caixinha
arquivos:
  cria: [src/components/caixinha-card.tsx, src/components/caixinha-card.test.tsx]
  altera: []
teste_integracao: renderizar CaixinhaCard com uma caixinha mockada mostra o nome e o valor guardado
teste_funcional: dado valorGuardado 2400 e meta 6000, a barra de progresso reflete 40%
criterio_aceite: o percentual exibido é igual a (valorGuardado / meta) × 100, arredondado
origem: [D-14]
depende_de: [T-04.02]
paralelizavel: false
status: concluida
# 2026-10-08 · suíte: 37 passed, 0 failed · real: 0,5 h
```

---

```yaml
id: T-04.05
titulo: Modal de nova caixinha
objetivo: Formulário para criar uma caixinha nova com nome e meta
arquivos:
  cria: [src/components/nova-caixinha-modal.tsx, src/components/nova-caixinha-modal.test.tsx]
  altera: [src/test/test-utils.tsx]
teste_integracao: submeter o formulário de nova caixinha chama a função criar do provider com os dados corretos
teste_funcional: validação bloqueia submissão com nome vazio
criterio_aceite: após submissão válida o modal fecha e o formulário é limpo
origem: [D-13, D-14]
depende_de: [T-04.01, T-04.02]
paralelizavel: false
status: concluida
# 2026-10-08 · suíte: 39 passed, 0 failed · real: 0,6 h
```

---

```yaml
id: T-04.06
titulo: Modal de depositar e resgatar
objetivo: Formulário para depositar ou resgatar valor de uma caixinha existente
arquivos:
  cria: [src/components/movimentar-caixinha-modal.tsx, src/components/movimentar-caixinha-modal.test.tsx]
  altera: []
teste_integracao: submeter depósito soma ao valorGuardado da caixinha selecionada
teste_funcional: submeter resgate maior que o valor guardado exibe mensagem de erro e não altera o estado
criterio_aceite: resgate com valor válido subtrai do valorGuardado da caixinha selecionada
origem: [D-15]
depende_de: [T-04.01, T-04.02]
paralelizavel: false
status: concluida
# 2026-10-08 · suíte: 41 passed, 0 failed · real: 0,7 h
```

---

```yaml
id: T-04.07
titulo: Montar a rota Caixinhas de fato
objetivo: Compor CaixinhaCard, modal de nova caixinha, modal de movimentar e ação de excluir na rota /caixinhas
arquivos:
  cria: [src/routes/caixinhas.test.tsx]
  altera: [src/routes/caixinhas.tsx]
teste_integracao: renderizar a rota /caixinhas com caixinhas no estado mostra um card por caixinha com nome e progresso
teste_funcional: clicar em excluir numa caixinha remove o card correspondente da lista renderizada
criterio_aceite: a rota mostra um botão de "Nova caixinha" que abre o modal de criação
origem: [D-13, D-14, D-18]
depende_de: [T-04.04, T-04.05, T-04.06]
paralelizavel: false
status: concluida
# 2026-10-08 · suíte: 44 passed, 0 failed · real: 0,6 h
```

---

```yaml
id: T-04.08
titulo: Card "Guardado" e saldo acumulado na Início
objetivo: Mostrar o 3º card "Guardado" e usar useSaldoAcumulado na tela Início
arquivos:
  cria: [src/components/saldo-card.test.tsx, src/routes/index.test.tsx]
  altera: [src/components/saldo-card.tsx, src/routes/index.tsx]
teste_integracao: renderizar a tela Início com caixinhas no estado mostra o card "Guardado" com o total correto
teste_funcional: alterar o valor guardado em caixinhas via provider reflete no saldo acumulado renderizado na Início
criterio_aceite: a tela Início mostra 3 cards lado a lado — Receita, Despesa e Guardado
origem: [D-16, D-18]
depende_de: [T-04.03]
paralelizavel: false
status: concluida
# 2026-10-08 · suíte: 47 passed, 0 failed · real: 0,5 h
```
