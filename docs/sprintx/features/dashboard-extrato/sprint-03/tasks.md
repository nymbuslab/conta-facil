---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: dashboard-extrato
sprint_id: sprint-03
atualizado_em: 2026-10-17
tasks:
  - id: T-03.01
    titulo: Componente Sheet novo sobre radix-dialog
    fase: F-03.1
    status: concluida
    objetivo: Criar um primitivo Sheet (gaveta lateral) reusando o Dialog do radix ja instalado, sem dependencia nova
    arquivos:
      cria: [src/components/ui/sheet.tsx, src/components/ui/sheet.test.tsx]
      altera: []
    teste_integracao: sheet.test.tsx monta o Sheet com open controlado e confere presenca/ausencia do conteudo
    teste_funcional: Dado open=true, o conteudo do Sheet aparece deslizando pela lateral; dado onOpenChange(false) disparado por Esc ou clique no overlay, o Sheet fecha
    criterio_aceite: npm run test -- sheet.test.tsx passa cobrindo abrir e fechar
    origem: [D-09]
    depende_de: []
    paralelizavel: false
    concluida_em: 2026-10-17
    suite: verde
  - id: T-03.02
    titulo: Componente MenuMais com navegacao e logout
    fase: F-03.1
    status: concluida
    objetivo: Criar o conteudo do painel Mais com links para Inicio, Extrato, Parcelas, Caixinhas, Perfil e o item Sair com logout direto
    arquivos:
      cria: [src/components/menu-mais.tsx, src/components/menu-mais.test.tsx]
      altera: []
    teste_integracao: menu-mais.test.tsx monta MenuMais dentro do AuthProvider de teste e simula clique em cada link e no Sair
    teste_funcional: Dado clique em Perfil, navega para /perfil e fecha o painel; dado clique em Sair, chama sair() do AuthProvider sem navegar antes para /perfil
    criterio_aceite: npm run test -- menu-mais.test.tsx passa cobrindo navegacao de cada link e o logout direto
    origem: [D-10, D-12, D-13]
    depende_de: [T-03.01]
    paralelizavel: false
    concluida_em: 2026-10-17
    suite: verde
  - id: T-03.03
    titulo: BottomNav atualizado para 5 itens
    fase: F-03.2
    status: concluida
    objetivo: Trocar Perfil pelo item Mais (icone hamburguer) que abre o Sheet com o MenuMais, mantendo Inicio, acrescentando Extrato, e preservando Parcelas e Caixinhas
    arquivos:
      cria: []
      altera: [src/components/bottom-nav.tsx, src/components/bottom-nav.test.tsx]
    teste_integracao: bottom-nav.test.tsx renderiza BottomNav e confere os 5 rotulos e o clique no item Mais abrindo o painel
    teste_funcional: Dado o pathname /extrato, o item Extrato fica marcado ativo; dado clique em Mais, o Sheet com MenuMais abre sem navegar
    criterio_aceite: npm run test -- bottom-nav.test.tsx passa cobrindo os 5 itens e a abertura do painel
    origem: [D-02]
    depende_de: [T-03.01, T-03.02]
    paralelizavel: false
    concluida_em: 2026-10-17
    suite: verde
  - id: T-03.04
    titulo: perfil.test.tsx atualizado para a navegacao nova
    fase: F-03.2
    status: concluida
    objetivo: Corrigir o teste que hoje espera Perfil dentro do BottomNav, já que Perfil saiu da barra inferior
    arquivos:
      cria: []
      altera: [src/routes/perfil.test.tsx]
    teste_integracao: perfil.test.tsx renderiza /perfil e confere que o BottomNav mostra os 5 itens novos, sem Perfil entre eles
    teste_funcional: Dado a rota /perfil renderizada, o rotulo Perfil nao aparece dentro do nav; a pagina continua mostrando o titulo Perfil
    criterio_aceite: npm run test -- perfil.test.tsx passa
    origem: [D-02]
    depende_de: [T-03.03]
    paralelizavel: false
    concluida_em: 2026-10-17
    suite: verde
---

# Tasks — Sprint 03

---

```yaml
id: T-03.01
titulo: Componente Sheet novo sobre radix-dialog
objetivo: Criar um primitivo Sheet (gaveta lateral) reusando o Dialog do radix ja instalado, sem dependencia nova
arquivos:
  cria: [src/components/ui/sheet.tsx, src/components/ui/sheet.test.tsx]
  altera: []
teste_integracao: sheet.test.tsx monta o Sheet com open controlado e confere presenca/ausencia do conteudo
teste_funcional: Dado open=true, o conteudo do Sheet aparece deslizando pela lateral; dado onOpenChange(false) disparado por Esc ou clique no overlay, o Sheet fecha
criterio_aceite: npm run test -- sheet.test.tsx passa cobrindo abrir e fechar
origem: [D-09]
depende_de: []
paralelizavel: false
status: concluida
```

Concluída em 2026-10-17 · suíte: 3 passed, 0 failed · real: 0,3 h

---

```yaml
id: T-03.02
titulo: Componente MenuMais com navegacao e logout
objetivo: Criar o conteudo do painel Mais com links para Inicio, Extrato, Parcelas, Caixinhas, Perfil e o item Sair com logout direto
arquivos:
  cria: [src/components/menu-mais.tsx, src/components/menu-mais.test.tsx]
  altera: []
teste_integracao: menu-mais.test.tsx monta MenuMais dentro do AuthProvider de teste e simula clique em cada link e no Sair
teste_funcional: Dado clique em Perfil, navega para /perfil e fecha o painel; dado clique em Sair, chama sair() do AuthProvider sem navegar antes para /perfil
criterio_aceite: npm run test -- menu-mais.test.tsx passa cobrindo navegacao de cada link e o logout direto
origem: [D-10, D-12, D-13]
depende_de: [T-03.01]
paralelizavel: false
status: concluida
```

Concluída em 2026-10-17 · suíte: 3 passed, 0 failed · real: 0,4 h

---

```yaml
id: T-03.03
titulo: BottomNav atualizado para 5 itens
objetivo: Trocar Perfil pelo item Mais (icone hamburguer) que abre o Sheet com o MenuMais, mantendo Inicio, acrescentando Extrato, e preservando Parcelas e Caixinhas
arquivos:
  cria: []
  altera: [src/components/bottom-nav.tsx, src/components/bottom-nav.test.tsx]
teste_integracao: bottom-nav.test.tsx renderiza BottomNav e confere os 5 rotulos e o clique no item Mais abrindo o painel
teste_funcional: Dado o pathname /extrato, o item Extrato fica marcado ativo; dado clique em Mais, o Sheet com MenuMais abre sem navegar
criterio_aceite: npm run test -- bottom-nav.test.tsx passa cobrindo os 5 itens e a abertura do painel
origem: [D-02]
depende_de: [T-03.01, T-03.02]
paralelizavel: false
status: concluida
```

Concluída em 2026-10-17 · suíte: 6 passed, 0 failed · real: 0,35 h

---

```yaml
id: T-03.04
titulo: perfil.test.tsx atualizado para a navegacao nova
objetivo: Corrigir o teste que hoje espera Perfil dentro do BottomNav, já que Perfil saiu da barra inferior
arquivos:
  cria: []
  altera: [src/routes/perfil.test.tsx]
teste_integracao: perfil.test.tsx renderiza /perfil e confere que o BottomNav mostra os 5 itens novos, sem Perfil entre eles
teste_funcional: Dado a rota /perfil renderizada, o rotulo Perfil nao aparece dentro do nav; a pagina continua mostrando o titulo Perfil
criterio_aceite: npm run test -- perfil.test.tsx passa
origem: [D-02]
depende_de: [T-03.03]
paralelizavel: false
status: concluida
```

Concluída em 2026-10-17 · suíte: 5 passed, 0 failed · real: 0,15 h
