---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: integracao-neon
sprint_id: sprint-02
atualizado_em: 2026-10-10
tasks:
  - id: T-02.01
    titulo: Provider de sessao com Neon Auth
    fase: F-02.1
    status: concluida
    objetivo: Expor o estado de sessao (carregando, autenticado, anonimo) para o resto do app
    arquivos:
      cria: [src/state/auth-context.tsx, src/state/auth-context.test.tsx]
      altera: [src/routes/__root.tsx]
    teste_integracao: AuthProvider monta contra a branch de teste e useAuth comeca em carregando antes da sessao resolver
    teste_funcional: useAuth fora de AuthProvider lanca erro, dentro devolve status, usuario, entrar e sair
    criterio_aceite: useAuth dentro de AuthProvider nunca e null e expoe status carregando, autenticado ou anonimo
    origem: [D-07]
    depende_de: [T-01.02]
    paralelizavel: true
    concluida_em: 2026-10-10
    suite: verde
  - id: T-02.02
    titulo: Tela de login
    fase: F-02.1
    status: concluida
    objetivo: Permitir que um usuario existente entre com e-mail e senha
    arquivos:
      cria: [src/routes/login.tsx, src/routes/login.test.tsx]
      altera: []
    teste_integracao: Submeter credenciais validas contra a branch de teste redireciona para a tela Inicio autenticado
    teste_funcional: Submeter com e-mail invalido mostra a mensagem de erro do formulario sem chamar signIn.email
    criterio_aceite: Login com credenciais validas redireciona para a tela Inicio com a sessao autenticada
    origem: [D-01]
    depende_de: [T-02.01]
    paralelizavel: true
    concluida_em: 2026-10-10
    suite: verde
  - id: T-02.03
    titulo: Tela de cadastro
    fase: F-02.1
    status: concluida
    objetivo: Permitir que um usuario novo crie conta com e-mail e senha
    arquivos:
      cria: [src/routes/cadastro.tsx, src/routes/cadastro.test.tsx]
      altera: []
    teste_integracao: Cadastrar um e-mail novo contra a branch de teste cria o usuario e autentica a sessao
    teste_funcional: Submeter com e-mail ja cadastrado mostra erro sem quebrar a tela
    criterio_aceite: Cadastro com e-mail novo autentica a sessao e redireciona para a tela Inicio
    origem: [D-01]
    depende_de: [T-02.01]
    paralelizavel: true
    concluida_em: 2026-10-10
    suite: verde
  - id: T-02.04
    titulo: Proteger rotas e remover perfil mockado
    fase: F-02.1
    status: concluida
    objetivo: Exigir sessao autenticada em toda rota e mostrar dados reais no Perfil
    arquivos:
      cria: []
      altera: [src/routes/__root.tsx, src/routes/perfil.tsx, src/lib/perfil-mock.ts]
    teste_integracao: Acessar / sem sessao redireciona para /login; autenticado mostra TelaPerfil com nome e e-mail reais
    teste_funcional: TelaPerfil renderiza nome e e-mail do usuario autenticado, nunca Alex Pereira
    criterio_aceite: Nenhuma tela importa src/lib/perfil-mock.ts e toda rota exige sessao autenticada
    origem: [D-11]
    depende_de: [T-02.02, T-02.03]
    paralelizavel: false
    concluida_em: 2026-10-10
    suite: verde
---

# Tasks — Sprint 02

---

```yaml
id: T-02.01
titulo: Provider de sessao com Neon Auth
objetivo: Expor o estado de sessao (carregando, autenticado, anonimo) para o resto do app
arquivos:
  cria: [src/state/auth-context.tsx, src/state/auth-context.test.tsx]
  altera: [src/routes/__root.tsx]
teste_integracao: AuthProvider monta contra a branch de teste e useAuth comeca em carregando antes da sessao resolver
teste_funcional: useAuth fora de AuthProvider lanca erro, dentro devolve status, usuario, entrar e sair
criterio_aceite: useAuth dentro de AuthProvider nunca e null e expoe status carregando, autenticado ou anonimo
origem: [D-07]
depende_de: [T-01.02]
paralelizavel: true
status: concluida
concluida_em: 2026-10-10
suite: verde
resultado: 53 passed, 0 failed; getSession real da branch test respondeu
real: 0,2 h
```

---

```yaml
id: T-02.02
titulo: Tela de login
objetivo: Permitir que um usuario existente entre com e-mail e senha
arquivos:
  cria: [src/routes/login.tsx, src/routes/login.test.tsx]
  altera: []
teste_integracao: Submeter credenciais validas contra a branch de teste redireciona para a tela Inicio autenticado
teste_funcional: Submeter com e-mail invalido mostra a mensagem de erro do formulario sem chamar signIn.email
criterio_aceite: Login com credenciais validas redireciona para a tela Inicio com a sessao autenticada
origem: [D-01]
depende_de: [T-02.01]
paralelizavel: true
status: concluida
concluida_em: 2026-10-10
suite: verde
resultado: 56 passed, 0 failed; login real na branch test autenticou usuario; build e lint passaram
real: 0,3 h
```

> **Portão de design.** Tela nova com decisão visual nova: antes de escrever qualquer código
> de interface desta task, gerar o protótipo no Stitch e aguardar aprovação explícita do
> usuário (CLAUDE.md local e global — este portão vale mesmo em execução autônoma da F6 e
> não é dispensado pela regra de autonomia do ORQUESTRADOR). Só depois de aprovado, implementar
> seguindo o padrão visual já estabelecido em `src/index.css` (sem `designSystem` do Stitch
> gravado ainda neste projeto).

---

```yaml
id: T-02.03
titulo: Tela de cadastro
objetivo: Permitir que um usuario novo crie conta com e-mail e senha
arquivos:
  cria: [src/routes/cadastro.tsx, src/routes/cadastro.test.tsx]
  altera: []
teste_integracao: Cadastrar um e-mail novo contra a branch de teste cria o usuario e autentica a sessao
teste_funcional: Submeter com e-mail ja cadastrado mostra erro sem quebrar a tela
criterio_aceite: Cadastro com e-mail novo autentica a sessao e redireciona para a tela Inicio
origem: [D-01]
depende_de: [T-02.01]
paralelizavel: true
status: concluida
concluida_em: 2026-10-10
suite: verde
resultado: 59 passed, 0 failed; cadastro e rejeicao de duplicado confirmados na branch test
real: 0,2 h
```

> **Portão de design.** Mesma exigência de T-02.02: gerar o protótipo no Stitch e aguardar
> aprovação explícita do usuário antes de escrever qualquer código de interface desta task.

---

```yaml
id: T-02.04
titulo: Proteger rotas e remover perfil mockado
objetivo: Exigir sessao autenticada em toda rota e mostrar dados reais no Perfil
arquivos:
  cria: []
  altera: [src/routes/__root.tsx, src/routes/perfil.tsx, src/lib/perfil-mock.ts]
teste_integracao: Acessar / sem sessao redireciona para /login; autenticado mostra TelaPerfil com nome e e-mail reais
teste_funcional: TelaPerfil renderiza nome e e-mail do usuario autenticado, nunca Alex Pereira
criterio_aceite: Nenhuma tela importa src/lib/perfil-mock.ts e toda rota exige sessao autenticada
origem: [D-11]
depende_de: [T-02.02, T-02.03]
paralelizavel: false
status: concluida
concluida_em: 2026-10-10
suite: verde
resultado: 61 passed, 0 failed; rotas anonimas redirecionam e perfil usa sessao real; build e lint passaram
real: 0,2 h
```
