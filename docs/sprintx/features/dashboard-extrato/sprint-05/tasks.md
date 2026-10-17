---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: dashboard-extrato
sprint_id: sprint-05
atualizado_em: 2026-10-17
tasks:
  - id: T-05.01
    titulo: Componente ExtratoLista com abas Receita e Despesas
    fase: F-05.1
    status: concluida
    objetivo: Criar ExtratoLista reaproveitando as colunas e o DataTable existentes, alternando entre Receita e Despesas por dois Button em vez das secoes empilhadas atuais
    arquivos:
      cria: [src/components/extrato-lista.tsx, src/components/extrato-lista.test.tsx]
      altera: []
    teste_integracao: extrato-lista.test.tsx renderiza o componente com receitas e despesas fake e simula clique nas duas abas
    teste_funcional: Dado a aba Receita ativa, so a tabela de receitas aparece; dado clique em Despesas, a tabela troca para despesas sem desmontar o restante da tela
    criterio_aceite: npm run test -- extrato-lista.test.tsx passa cobrindo a troca de aba e o carregar mais de cada lista
    origem: [D-05, D-14]
    depende_de: []
    paralelizavel: false
    concluida_em: 2026-10-17
    suite: verde
  - id: T-05.02
    titulo: extrato.tsx com busca, mes, abas e FAB
    fase: F-05.1
    status: concluida
    objetivo: Compor a rota /extrato com Header, FiltrosLancamentos, ExtratoLista e RegistrarFab, migrados do Inicio antigo
    arquivos:
      cria: []
      altera: [src/routes/extrato.tsx, src/routes/extrato.test.tsx]
    teste_integracao: extrato.test.tsx renderiza a rota completa e simula busca, navegacao de mes e abertura do FAB
    teste_funcional: Dado texto digitado na busca, a lista filtra por descricao; dado clique no FAB seguido de Despesa, o modal de registrar despesa abre
    criterio_aceite: npm run test -- extrato.test.tsx passa cobrindo busca, mes, abas e FAB
    origem: [D-01, D-03, D-05]
    depende_de: [T-05.01]
    paralelizavel: false
    concluida_em: 2026-10-17
    suite: verde
  - id: T-05.03
    titulo: Skeleton do Extrato
    fase: F-05.2
    status: concluida
    objetivo: Criar EstadoCarregandoExtrato (busca + mes + abas + linhas de tabela), seguindo o mesmo padrao dos outros skeletons
    arquivos:
      cria: []
      altera: [src/components/estado-dados.tsx]
    teste_integracao: extrato.test.tsx cobre o skeleton aparecendo so na primeira carga sem dados
    teste_funcional: Dado carregando=true e nenhum lancamento ainda, o skeleton mostra os blocos do layout novo; apos carregar, o skeleton desaparece
    criterio_aceite: npm run test -- extrato.test.tsx passa cobrindo o skeleton novo
    origem: [D-05]
    depende_de: [T-05.02]
    paralelizavel: false
    concluida_em: 2026-10-17
    suite: verde
---

# Tasks — Sprint 05

---

```yaml
id: T-05.01
titulo: Componente ExtratoLista com abas Receita e Despesas
objetivo: Criar ExtratoLista reaproveitando as colunas e o DataTable existentes, alternando entre Receita e Despesas por dois Button em vez das secoes empilhadas atuais
arquivos:
  cria: [src/components/extrato-lista.tsx, src/components/extrato-lista.test.tsx]
  altera: []
teste_integracao: extrato-lista.test.tsx renderiza o componente com receitas e despesas fake e simula clique nas duas abas
teste_funcional: Dado a aba Receita ativa, so a tabela de receitas aparece; dado clique em Despesas, a tabela troca para despesas sem desmontar o restante da tela
criterio_aceite: npm run test -- extrato-lista.test.tsx passa cobrindo a troca de aba e o carregar mais de cada lista
origem: [D-05, D-14]
depende_de: []
paralelizavel: false
status: concluida
```

Concluída em 2026-10-17 · suíte: 4 passed, 0 failed (extrato-lista.test.tsx) · real: 0,45 h

---

```yaml
id: T-05.02
titulo: extrato.tsx com busca, mes, abas e FAB
objetivo: Compor a rota /extrato com Header, FiltrosLancamentos, ExtratoLista e RegistrarFab, migrados do Inicio antigo
arquivos:
  cria: []
  altera: [src/routes/extrato.tsx, src/routes/extrato.test.tsx]
teste_integracao: extrato.test.tsx renderiza a rota completa e simula busca, navegacao de mes e abertura do FAB
teste_funcional: Dado texto digitado na busca, a lista filtra por descricao; dado clique no FAB seguido de Despesa, o modal de registrar despesa abre
criterio_aceite: npm run test -- extrato.test.tsx passa cobrindo busca, mes, abas e FAB
origem: [D-01, D-03, D-05]
depende_de: [T-05.01]
paralelizavel: false
status: concluida
```

Concluída em 2026-10-17 · suíte: 4 passed, 0 failed (extrato.test.tsx) · real: 0,5 h

---

```yaml
id: T-05.03
titulo: Skeleton do Extrato
objetivo: Criar EstadoCarregandoExtrato (busca + mes + abas + linhas de tabela), seguindo o mesmo padrao dos outros skeletons
arquivos:
  cria: []
  altera: [src/components/estado-dados.tsx]
teste_integracao: extrato.test.tsx cobre o skeleton aparecendo so na primeira carga sem dados
teste_funcional: Dado carregando=true e nenhum lancamento ainda, o skeleton mostra os blocos do layout novo; apos carregar, o skeleton desaparece
criterio_aceite: npm run test -- extrato.test.tsx passa cobrindo o skeleton novo
origem: [D-05]
depende_de: [T-05.02]
paralelizavel: false
status: concluida
```

Concluída em 2026-10-17 · suíte: 4 passed, 0 failed (extrato.test.tsx) · real: 0,2 h
