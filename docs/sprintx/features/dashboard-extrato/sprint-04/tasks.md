---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: dashboard-extrato
sprint_id: sprint-04
atualizado_em: 2026-10-17
tasks:
  - id: T-04.01
    titulo: Contexto ganha contasVencendo
    fase: F-04.1
    status: concluida
    objetivo: Adicionar estado contasVencendo e metodo carregarContasVencendo a LancamentosProvider, chamando GET /lancamentos/vencendo
    arquivos:
      cria: []
      altera: [src/state/lancamentos-context.tsx, src/state/lancamentos-context.test.tsx]
    teste_integracao: lancamentos-context.test.tsx chama carregarContasVencendo com o cliente fake da sprint-01 e confere o estado resultante
    teste_funcional: Dado o cliente fake com despesas vencendo em 2 dias, carregarContasVencendo() preenche contasVencendo com elas; dado erro do cliente, erroContasVencendo recebe mensagemErroApi
    criterio_aceite: npm run test -- lancamentos-context.test.tsx passa cobrindo sucesso e erro de contasVencendo
    origem: [D-04, D-06, D-16]
    depende_de: []
    paralelizavel: false
    concluida_em: 2026-10-17
    suite: verde
  - id: T-04.02
    titulo: Contexto ganha ultimosLancamentos
    fase: F-04.1
    status: concluida
    objetivo: Adicionar estado ultimosLancamentos e metodo carregarUltimosLancamentos a LancamentosProvider, chamando GET /lancamentos/recentes
    arquivos:
      cria: []
      altera: [src/state/lancamentos-context.tsx, src/state/lancamentos-context.test.tsx]
    teste_integracao: lancamentos-context.test.tsx chama carregarUltimosLancamentos com o cliente fake da sprint-01 e confere o estado resultante
    teste_funcional: Dado o cliente fake com receitas e despesas intercaladas, carregarUltimosLancamentos() preenche ultimosLancamentos misturando tipo; dado erro do cliente, erroUltimosLancamentos recebe mensagemErroApi
    criterio_aceite: npm run test -- lancamentos-context.test.tsx passa cobrindo sucesso e erro de ultimosLancamentos
    origem: [D-04, D-07, D-16]
    depende_de: [T-04.01]
    paralelizavel: false
    concluida_em: 2026-10-17
    suite: verde
  - id: T-04.03
    titulo: Componente CardContasVencendo
    fase: F-04.2
    status: concluida
    objetivo: Criar o card que lista ate 3 despesas vencendo com link ver mais para /extrato na aba despesas
    arquivos:
      cria: [src/components/card-contas-vencendo.tsx, src/components/card-contas-vencendo.test.tsx]
      altera: []
    teste_integracao: card-contas-vencendo.test.tsx renderiza o card com 0, 2 e 3 despesas fake
    teste_funcional: Dado 3 despesas vencendo, a lista mostra as 3 com valor em vermelho; dado nenhuma, mostra o estado vazio sem o link ver mais
    criterio_aceite: npm run test -- card-contas-vencendo.test.tsx passa cobrindo 0, 1-2 e 3 itens
    origem: [D-04]
    depende_de: [T-04.01]
    paralelizavel: false
    concluida_em: 2026-10-17
    suite: verde
  - id: T-04.04
    titulo: Componente CardUltimosLancamentos
    fase: F-04.2
    status: concluida
    objetivo: Criar o card que lista os ultimos lancamentos (receita e despesa misturados) com link ver mais para /extrato
    arquivos:
      cria: [src/components/card-ultimos-lancamentos.tsx, src/components/card-ultimos-lancamentos.test.tsx]
      altera: []
    teste_integracao: card-ultimos-lancamentos.test.tsx renderiza o card com lista vazia e com 5 itens mistos
    teste_funcional: Dados 5 lancamentos mistos, cada linha colore o valor pelo sinal (verde receita, vermelho despesa); dado lista vazia, mostra estado vazio
    criterio_aceite: npm run test -- card-ultimos-lancamentos.test.tsx passa cobrindo vazio e preenchido
    origem: [D-04]
    depende_de: [T-04.02]
    paralelizavel: false
    concluida_em: 2026-10-17
    suite: verde
  - id: T-04.05
    titulo: index.tsx reescrito como dashboard
    fase: F-04.2
    status: concluida
    objetivo: Remover FiltrosLancamentos, ListaLancamentos e RegistrarFab de index.tsx, manter os 4 cards e acrescentar os dois cards novos, disparando os dois carregamentos no mount
    arquivos:
      cria: []
      altera: [src/routes/index.tsx, src/routes/index.test.tsx]
    teste_integracao: index.test.tsx renderiza TelaPrincipal e confere ausencia do FAB e presenca dos dois cards novos
    teste_funcional: Dado o mount da tela, carregarContasVencendo e carregarUltimosLancamentos sao chamados uma vez; o FAB e a barra de busca nao aparecem mais
    criterio_aceite: npm run test -- index.test.tsx passa cobrindo a nova composicao
    origem: [D-01, D-04, D-08]
    depende_de: [T-04.03, T-04.04]
    paralelizavel: false
    concluida_em: 2026-10-17
    suite: verde
  - id: T-04.06
    titulo: Skeleton do dashboard reescrito
    fase: F-04.2
    status: concluida
    objetivo: Atualizar EstadoCarregandoInicio para refletir a composicao nova (sem linhas de tabela, com os dois blocos de card novos)
    arquivos:
      cria: []
      altera: [src/components/estado-dados.tsx]
    teste_integracao: index.test.tsx (ja existente) cobre o skeleton aparecendo so na primeira carga sem dados
    teste_funcional: Dado carregando=true e nenhum dado ainda, o skeleton mostra blocos para os 4 cards mais os dois cards novos, sem bloco de tabela
    criterio_aceite: npm run test -- index.test.tsx passa cobrindo o skeleton novo
    origem: [D-04]
    depende_de: [T-04.05]
    paralelizavel: false
    concluida_em: 2026-10-17
    suite: verde
---

# Tasks — Sprint 04

---

```yaml
id: T-04.01
titulo: Contexto ganha contasVencendo
objetivo: Adicionar estado contasVencendo e metodo carregarContasVencendo a LancamentosProvider, chamando GET /lancamentos/vencendo
arquivos:
  cria: []
  altera: [src/state/lancamentos-context.tsx, src/state/lancamentos-context.test.tsx]
teste_integracao: lancamentos-context.test.tsx chama carregarContasVencendo com o cliente fake da sprint-01 e confere o estado resultante
teste_funcional: Dado o cliente fake com despesas vencendo em 2 dias, carregarContasVencendo() preenche contasVencendo com elas; dado erro do cliente, erroContasVencendo recebe mensagemErroApi
criterio_aceite: npm run test -- lancamentos-context.test.tsx passa cobrindo sucesso e erro de contasVencendo
origem: [D-04, D-06, D-16]
depende_de: []
paralelizavel: false
status: concluida
```

Concluída em 2026-10-17 · suíte: 10 passed, 0 failed (lancamentos-context.test.tsx) · real: 0,3 h

---

```yaml
id: T-04.02
titulo: Contexto ganha ultimosLancamentos
objetivo: Adicionar estado ultimosLancamentos e metodo carregarUltimosLancamentos a LancamentosProvider, chamando GET /lancamentos/recentes
arquivos:
  cria: []
  altera: [src/state/lancamentos-context.tsx, src/state/lancamentos-context.test.tsx]
teste_integracao: lancamentos-context.test.tsx chama carregarUltimosLancamentos com o cliente fake da sprint-01 e confere o estado resultante
teste_funcional: Dado o cliente fake com receitas e despesas intercaladas, carregarUltimosLancamentos() preenche ultimosLancamentos misturando tipo; dado erro do cliente, erroUltimosLancamentos recebe mensagemErroApi
criterio_aceite: npm run test -- lancamentos-context.test.tsx passa cobrindo sucesso e erro de ultimosLancamentos
origem: [D-04, D-07, D-16]
depende_de: [T-04.01]
paralelizavel: false
status: concluida
```

Concluída em 2026-10-17 · suíte: 10 passed, 0 failed (lancamentos-context.test.tsx) · real: 0,25 h

---

```yaml
id: T-04.03
titulo: Componente CardContasVencendo
objetivo: Criar o card que lista ate 3 despesas vencendo com link ver mais para /extrato na aba despesas
arquivos:
  cria: [src/components/card-contas-vencendo.tsx, src/components/card-contas-vencendo.test.tsx]
  altera: []
teste_integracao: card-contas-vencendo.test.tsx renderiza o card com 0, 2 e 3 despesas fake
teste_funcional: Dado 3 despesas vencendo, a lista mostra as 3 com valor em vermelho; dado nenhuma, mostra o estado vazio sem o link ver mais
criterio_aceite: npm run test -- card-contas-vencendo.test.tsx passa cobrindo 0, 1-2 e 3 itens
origem: [D-04]
depende_de: [T-04.01]
paralelizavel: false
status: concluida
```

Concluída em 2026-10-17 · suíte: 3 passed, 0 failed · real: 0,3 h

---

```yaml
id: T-04.04
titulo: Componente CardUltimosLancamentos
objetivo: Criar o card que lista os ultimos lancamentos (receita e despesa misturados) com link ver mais para /extrato
arquivos:
  cria: [src/components/card-ultimos-lancamentos.tsx, src/components/card-ultimos-lancamentos.test.tsx]
  altera: []
teste_integracao: card-ultimos-lancamentos.test.tsx renderiza o card com lista vazia e com 5 itens mistos
teste_funcional: Dados 5 lancamentos mistos, cada linha colore o valor pelo sinal (verde receita, vermelho despesa); dado lista vazia, mostra estado vazio
criterio_aceite: npm run test -- card-ultimos-lancamentos.test.tsx passa cobrindo vazio e preenchido
origem: [D-04]
depende_de: [T-04.02]
paralelizavel: false
status: concluida
```

Concluída em 2026-10-17 · suíte: 2 passed, 0 failed · real: 0,25 h

---

```yaml
id: T-04.05
titulo: index.tsx reescrito como dashboard
objetivo: Remover FiltrosLancamentos, ListaLancamentos e RegistrarFab de index.tsx, manter os 4 cards e acrescentar os dois cards novos, disparando os dois carregamentos no mount
arquivos:
  cria: []
  altera: [src/routes/index.tsx, src/routes/index.test.tsx]
teste_integracao: index.test.tsx renderiza TelaPrincipal e confere ausencia do FAB e presenca dos dois cards novos
teste_funcional: Dado o mount da tela, carregarContasVencendo e carregarUltimosLancamentos sao chamados uma vez; o FAB e a barra de busca nao aparecem mais
criterio_aceite: npm run test -- index.test.tsx passa cobrindo a nova composicao
origem: [D-01, D-04, D-08]
depende_de: [T-04.03, T-04.04]
paralelizavel: false
status: concluida
```

Concluída em 2026-10-17 · suíte: 6 passed, 0 failed (index.test.tsx) · real: 0,6 h

---

```yaml
id: T-04.06
titulo: Skeleton do dashboard reescrito
objetivo: Atualizar EstadoCarregandoInicio para refletir a composicao nova (sem linhas de tabela, com os dois blocos de card novos)
arquivos:
  cria: []
  altera: [src/components/estado-dados.tsx]
teste_integracao: index.test.tsx (ja existente) cobre o skeleton aparecendo so na primeira carga sem dados
teste_funcional: Dado carregando=true e nenhum dado ainda, o skeleton mostra blocos para os 4 cards mais os dois cards novos, sem bloco de tabela
criterio_aceite: npm run test -- index.test.tsx passa cobrindo o skeleton novo
origem: [D-04]
depende_de: [T-04.05]
paralelizavel: false
status: concluida
```

Concluída em 2026-10-17 · suíte: 6 passed, 0 failed (index.test.tsx) · real: 0,15 h
