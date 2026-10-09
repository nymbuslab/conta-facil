---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: navegacao-inferior
sprint_id: sprint-02
atualizado_em: 2026-10-08
tasks:
  - id: T-02.01
    titulo: Mover LancamentosProvider de index.tsx para __root.tsx
    fase: F-02.1
    status: concluida
    objetivo: Fazer o LancamentosProvider envolver toda a arvore de rotas a partir do root
    arquivos:
      cria: [src/test/render-route.tsx, src/routes/__root.test.tsx]
      altera: [src/routes/__root.tsx, src/routes/index.tsx, src/router.tsx]
    teste_integracao: renderizar a arvore de rotas via RouterProvider com o router real nao lanca o erro useLancamentos deve ser usado dentro de LancamentosProvider
    teste_funcional: dentro da rota raiz, useLancamentos retorna saldoReceita igual a soma dos valores mockados de receita
    criterio_aceite: a suite que monta RouterProvider com o router real passa sem erro de contexto ausente
    origem: [D-20]
    depende_de: []
    paralelizavel: true
    concluida_em: 2026-10-08
    suite: verde
  - id: T-02.02
    titulo: Criar rotas Parcelas, Caixinhas e Perfil
    fase: F-02.1
    status: concluida
    objetivo: Registrar as tres rotas novas com conteudo placeholder temporario
    arquivos:
      cria: [src/routes/parcelas.tsx, src/routes/caixinhas.tsx, src/routes/perfil.tsx, src/routes/parcelas.test.tsx]
      altera: [src/router.tsx]
    teste_integracao: o router resolve /parcelas, /caixinhas e /perfil sem lancar erro de rota nao encontrada
    teste_funcional: navegar para /parcelas via router.navigate renderiza o texto Parcelas no documento
    criterio_aceite: as tres rotas aparecem na arvore do router, resolvem sem 404, e cada uma renderiza o titulo da sua propria tela
    origem: [D-02, D-22]
    depende_de: []
    paralelizavel: true
    concluida_em: 2026-10-08
    suite: verde
  - id: T-02.03
    titulo: Componente BottomNav com os 4 itens
    fase: F-02.1
    status: concluida
    objetivo: Criar a barra de navegacao inferior com Inicio Parcelas Caixinhas Perfil e estado ativo
    arquivos:
      cria: [src/components/bottom-nav.tsx, src/components/bottom-nav.test.tsx]
      altera: []
    teste_integracao: renderizar BottomNav dentro do RouterProvider do app na rota raiz marca o item Inicio como ativo
    teste_funcional: dado pathname atual caixinhas, o item Caixinhas recebe o estado ativo e os demais nao
    criterio_aceite: os 4 rotulos Inicio Parcelas Caixinhas Perfil estao presentes no documento ao renderizar BottomNav
    origem: [D-02, D-23]
    depende_de: [T-02.02]
    paralelizavel: false
    concluida_em: 2026-10-08
    suite: verde
  - id: T-02.04
    titulo: Montar BottomNav no root
    fase: F-02.2
    status: concluida
    objetivo: Deixar o BottomNav visivel em todas as rotas da aplicacao
    arquivos:
      cria: [src/routes/perfil.test.tsx]
      altera: [src/routes/__root.tsx, src/routes/parcelas.test.tsx]
    teste_integracao: renderizar a rota /perfil via RouterProvider tambem mostra o BottomNav
    teste_funcional: clicar no item Parcelas do BottomNav navega a aplicacao para a rota /parcelas
    criterio_aceite: a suite confirma o BottomNav presente em pelo menos duas rotas diferentes renderizadas
    origem: [D-23]
    depende_de: [T-02.01, T-02.02, T-02.03]
    paralelizavel: false
    concluida_em: 2026-10-08
    suite: verde
  - id: T-02.05
    titulo: Ajustar RegistrarFab e padding das telas
    fase: F-02.2
    status: concluida
    objetivo: Impedir que o FAB e a ultima linha das listas fiquem cobertos pelo BottomNav
    arquivos:
      cria: [src/components/registrar-fab.test.tsx]
      altera: [src/components/registrar-fab.tsx, src/routes/index.tsx]
    teste_integracao: renderizar a tela Inicio junto do BottomNav nao resulta em classes de posicao conflitantes entre os dois elementos fixos
    teste_funcional: o botao principal do FAB tem uma classe de distancia do rodape maior que a usada antes do ajuste
    criterio_aceite: a className do FAB contem um valor de bottom maior que bottom-6
    origem: [D-21]
    depende_de: [T-02.04]
    paralelizavel: false
    concluida_em: 2026-10-08
    suite: verde
---

# Tasks — Sprint 02

---

```yaml
id: T-02.01
titulo: Mover LancamentosProvider de index.tsx para __root.tsx
objetivo: Fazer o LancamentosProvider envolver toda a árvore de rotas a partir do root
arquivos:
  cria: [src/test/render-route.tsx, src/routes/__root.test.tsx]
  altera: [src/routes/__root.tsx, src/routes/index.tsx, src/router.tsx]
teste_integracao: renderizar a árvore de rotas via RouterProvider com o router real não lança o erro "useLancamentos deve ser usado dentro de LancamentosProvider"
teste_funcional: dentro da rota raiz, useLancamentos() retorna saldoReceita igual à soma dos valores mockados de receita
criterio_aceite: a suíte que monta RouterProvider com o router real passa sem erro de contexto ausente
origem: [D-20]
depende_de: []
paralelizavel: true
status: concluida
# 2026-10-08 · suíte: 4 passed, 0 failed · real: 0,4 h
```

---

```yaml
id: T-02.02
titulo: Criar rotas Parcelas, Caixinhas e Perfil
objetivo: Registrar as três rotas novas com conteúdo placeholder temporário
arquivos:
  cria: [src/routes/parcelas.tsx, src/routes/caixinhas.tsx, src/routes/perfil.tsx, src/routes/parcelas.test.tsx]
  altera: [src/router.tsx]
teste_integracao: o router resolve /parcelas, /caixinhas e /perfil sem lançar erro de rota não encontrada
teste_funcional: navegar para /parcelas via router.navigate renderiza o texto "Parcelas" no documento
criterio_aceite: as três rotas aparecem na árvore do router, resolvem sem 404, e cada uma renderiza o título da sua própria tela
origem: [D-02, D-22]
depende_de: []
paralelizavel: true
status: concluida
# 2026-10-08 · suíte: 5 passed, 0 failed · real: 0,3 h
```

---

```yaml
id: T-02.03
titulo: Componente BottomNav com os 4 itens
objetivo: Criar a barra de navegação inferior com Início, Parcelas, Caixinhas, Perfil e estado ativo
arquivos:
  cria: [src/components/bottom-nav.tsx, src/components/bottom-nav.test.tsx]
  altera: []
teste_integracao: renderizar BottomNav dentro do RouterProvider do app na rota raiz marca o item "Início" como ativo
teste_funcional: dado pathname atual "/caixinhas", o item "Caixinhas" recebe o estado ativo e os demais não
criterio_aceite: os 4 rótulos "Início", "Parcelas", "Caixinhas", "Perfil" estão presentes no documento ao renderizar BottomNav
origem: [D-02, D-23]
depende_de: [T-02.02]
paralelizavel: false
status: concluida
# 2026-10-08 · suíte: 8 passed, 0 failed · real: 0,5 h
```

---

```yaml
id: T-02.04
titulo: Montar BottomNav no root
objetivo: Deixar o BottomNav visível em todas as rotas da aplicação
arquivos:
  cria: [src/routes/perfil.test.tsx]
  altera: [src/routes/__root.tsx, src/routes/parcelas.test.tsx]
teste_integracao: renderizar a rota /perfil via RouterProvider também mostra o BottomNav
teste_funcional: clicar no item "Parcelas" do BottomNav navega a aplicação para a rota /parcelas
criterio_aceite: a suíte confirma o BottomNav presente em pelo menos duas rotas diferentes renderizadas
origem: [D-23]
depende_de: [T-02.01, T-02.02, T-02.03]
paralelizavel: false
status: concluida
# 2026-10-08 · suíte: 10 passed, 0 failed · real: 0,4 h
```

---

```yaml
id: T-02.05
titulo: Ajustar RegistrarFab e padding das telas
objetivo: Impedir que o FAB e a última linha das listas fiquem cobertos pelo BottomNav
arquivos:
  cria: [src/components/registrar-fab.test.tsx]
  altera: [src/components/registrar-fab.tsx, src/routes/index.tsx]
teste_integracao: renderizar a tela Início junto do BottomNav não resulta em classes de posição conflitantes entre os dois elementos fixos
teste_funcional: o botão principal do FAB tem uma classe de distância do rodapé maior que a usada antes do ajuste
criterio_aceite: a className do FAB contém um valor de bottom-* maior que bottom-6
origem: [D-21]
depende_de: [T-02.04]
paralelizavel: false
status: concluida
# 2026-10-08 · suíte: 11 passed, 0 failed · real: 0,3 h
```
