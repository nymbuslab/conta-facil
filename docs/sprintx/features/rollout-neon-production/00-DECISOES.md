---
expx_schema: 1
expx_tool: sprintx
kind: decisoes
trabalho_id: rollout-neon-production
atualizado_em: 2026-10-10
decisoes:
  - id: D-01
    decisao: Escopo cobre o lado Neon (migration, Function, Auth, env vars) e tambem decidir e configurar a hospedagem do frontend
    alternativa_descartada: Escopo so no lado Neon, tratando hospedagem do frontend em feature separada
    motivo: Usuario pediu explicitamente que este rollout inclua a hospedagem do frontend
    status: fechada
    bloqueante: false
  - id: D-02
    decisao: A branch production do Neon ja existe (confirmado por consulta direta ao projeto falling-tree-35553185), e ja tem Auth e Object Storage provisionados; falta aplicar a migration de negocio e implantar a Function
    alternativa_descartada: Criar uma branch production do zero
    motivo: Consulta ao Neon (list_branches, get_default_branch, get_database_tables, get_auth, get_storage) mostrou que a branch ja existe como default/primary, com neon_auth populado mas sem tabelas lancamentos/caixinhas e sem Function implantada
    status: fechada
    bloqueante: false
  - id: D-03
    decisao: Frontend (build do Vite) e publicado no Cloudflare Pages
    alternativa_descartada: Vercel ou Netlify
    motivo: Escolha do usuario
    status: fechada
    bloqueante: false
  - id: D-04
    decisao: Dominio de producao e contafacil.nymbuslab.com.br, usado tanto para o frontend quanto como origem autorizada em FUNCTION_ALLOWED_ORIGINS
    alternativa_descartada: Dominio ainda nao definido, resolver depois
    motivo: Usuario informou o dominio final
    status: fechada
    bloqueante: false
  - id: D-05
    decisao: Rollback de migration em production via Instant Restore do Neon (restaurar a branch a um ponto no tempo anterior), sem escrever migration reversa separada
    alternativa_descartada: Escrever e testar um script de down/reversao especifico antes do rollout
    motivo: Escolha do usuario; Instant Restore ja e o mecanismo documentado pelas skills locais do Neon para recuperacao por ponto no tempo
    status: fechada
    bloqueante: false
  - id: D-06
    decisao: Validacao pos-deploy e um checklist manual do golden path real em producao (cadastro/login, criar um lancamento, criar uma caixinha, confirmar que sobrevive a reload)
    alternativa_descartada: Apenas health check automatico (GET /health e conexao ao Postgres)
    motivo: Usuario preferiu confirmar o fluxo autenticado completo, nao so a Function respondendo
    status: fechada
    bloqueante: false
  - id: D-07
    decisao: Criterio de pronto do rollout e o backend Neon em production, o frontend publicado no dominio final, e o golden path validado manualmente de ponta a ponta
    alternativa_descartada: Considerar pronto so com o lado Neon funcionando, deixando o frontend para depois
    motivo: Criterio de aceite explicito do usuario, coerente com D-01 (escopo inclui hospedagem)
    status: fechada
    bloqueante: false
  - id: D-08
    decisao: Revisar os alertas do npm audit fica fora do escopo desta feature, continua como pendencia separada no PROGRESSO.md
    alternativa_descartada: Incluir a revisao e correcao do npm audit como pre-requisito deste rollout
    motivo: Usuario preferiu nao misturar auditoria de dependencias com o plano de rollout
    status: fechada
    bloqueante: false
  - id: D-09
    decisao: A F6 executa de forma autonoma os comandos reais contra a branch production (neon deploy, drizzle-kit migrate, configuracao do Cloudflare Pages) apos o plano ser auditado e aprovado, sem pausar para aprovacao de novo em cada comando
    alternativa_descartada: Usuario executa manualmente cada comando contra production, seguindo um roteiro escrito pela IA
    motivo: Usuario autorizou execucao autonoma pos-aprovacao do plano; a aprovacao explicita do plano (F5) e a salvaguarda, nao uma pausa por comando
    status: fechada
    bloqueante: false
  - id: D-10
    decisao: VITE_NEON_FUNCTION_API_BASE_URL e as demais variaveis do build do frontend ficam configuradas como variaveis de ambiente do projeto no Cloudflare Pages, nunca commitadas
    alternativa_descartada: Deixar a decisao de onde guardar essas variaveis para depois
    motivo: Escolha do usuario
    status: fechada
    bloqueante: false
  - id: D-11
    decisao: Configurar o DNS do dominio contafacil.nymbuslab.com.br no Cloudflare para apontar ao projeto Pages faz parte do escopo deste rollout
    alternativa_descartada: Assumir que o DNS ja esta configurado e so publicar o projeto Pages
    motivo: Usuario confirmou que o DNS ainda precisa ser configurado
    status: fechada
    bloqueante: false
  - id: D-12
    decisao: A execucao autonoma (F6) assume que existe uma conta Cloudflare para nymbuslab.com.br e que um CLOUDFLARE_API_TOKEN estara disponivel no ambiente antes da F6 comecar; se nao estiver, apenas as tasks de Cloudflare ficam bloqueadas em 00-BLOQUEIOS.md, sem travar as tasks do lado Neon
    alternativa_descartada: Tratar a credencial Cloudflare como pendencia bloqueante de toda a feature
    motivo: Usuario confirmou que vai providenciar o token antes da F6; task do lado Neon nao depende dele e nao deve ficar presa por isso
    status: fechada
    bloqueante: false
---

# Decisões — rollout-neon-production

> Uma linha por decisão tomada no planejamento (F2 e, excepcionalmente, F3). Formato fixo. Não apague decisões: uma decisão revertida ganha nova linha que cita a anterior.

## Decisões

```
D-01 | Escopo cobre o lado Neon (migration, Function, Auth, env vars) e também decidir e configurar a hospedagem do frontend | Escopo só no lado Neon, tratando hospedagem do frontend em feature separada | Usuário pediu explicitamente que este rollout inclua a hospedagem do frontend
D-02 | A branch `production` do Neon já existe (confirmado por consulta direta ao projeto `falling-tree-35553185`), e já tem Auth e Object Storage provisionados; falta aplicar a migration de negócio e implantar a Function | Criar uma branch `production` do zero | Consulta ao Neon mostrou que a branch já existe como `default`/`primary`, com `neon_auth` populado mas sem tabelas `lancamentos`/`caixinhas` e sem Function implantada
D-03 | Frontend (build do Vite) é publicado no Cloudflare Pages | Vercel ou Netlify | Escolha do usuário
D-04 | Domínio de produção é `contafacil.nymbuslab.com.br`, usado tanto para o frontend quanto como origem autorizada em `FUNCTION_ALLOWED_ORIGINS` | Domínio ainda não definido, resolver depois | Usuário informou o domínio final
D-05 | Rollback de migration em `production` via Instant Restore do Neon, sem escrever migration reversa separada | Escrever e testar um script de down/reversão específico antes do rollout | Escolha do usuário; Instant Restore já é o mecanismo documentado pelas skills locais do Neon para recuperação por ponto no tempo
D-06 | Validação pós-deploy é um checklist manual do golden path real em produção (cadastro/login, criar um lançamento, criar uma caixinha, confirmar que sobrevive a reload) | Apenas health check automático (GET /health e conexão ao Postgres) | Usuário preferiu confirmar o fluxo autenticado completo, não só a Function respondendo
D-07 | Critério de pronto do rollout é o backend Neon em `production`, o frontend publicado no domínio final, e o golden path validado manualmente de ponta a ponta | Considerar pronto só com o lado Neon funcionando, deixando o frontend para depois | Critério de aceite explícito do usuário, coerente com D-01
D-08 | Revisar os alertas do `npm audit` fica fora do escopo desta feature, continua como pendência separada no `PROGRESSO.md` | Incluir a revisão e correção do `npm audit` como pré-requisito deste rollout | Usuário preferiu não misturar auditoria de dependências com o plano de rollout
D-09 | A F6 executa de forma autônoma os comandos reais contra a branch `production` (`neon deploy`, `drizzle-kit migrate`, configuração do Cloudflare Pages) após o plano ser auditado e aprovado, sem pausar para aprovação de novo em cada comando | Usuário executa manualmente cada comando contra `production`, seguindo um roteiro escrito pela IA | Usuário autorizou execução autônoma pós-aprovação do plano; a aprovação explícita do plano (F5) é a salvaguarda, não uma pausa por comando
D-10 | `VITE_NEON_FUNCTION_API_BASE_URL` e as demais variáveis do build do frontend ficam configuradas como variáveis de ambiente do projeto no Cloudflare Pages, nunca commitadas | Deixar a decisão de onde guardar essas variáveis para depois | Escolha do usuário
D-11 | Configurar o DNS do domínio `contafacil.nymbuslab.com.br` no Cloudflare para apontar ao projeto Pages faz parte do escopo deste rollout | Assumir que o DNS já está configurado e só publicar o projeto Pages | Usuário confirmou que o DNS ainda precisa ser configurado
D-12 | A execução autônoma (F6) assume que existe conta Cloudflare para `nymbuslab.com.br` e que um `CLOUDFLARE_API_TOKEN` estará disponível no ambiente antes da F6 começar; sem ele, só as tasks de Cloudflare ficam bloqueadas em `00-BLOQUEIOS.md`, sem travar as tasks do lado Neon | Tratar a credencial Cloudflare como pendência bloqueante de toda a feature | Usuário confirmou que vai providenciar o token antes da F6; a task do lado Neon não depende dele
```

## Pendências

Nenhuma pendência.
