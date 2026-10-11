---
expx_schema: 1
expx_tool: sprintx
kind: fechamento
trabalho_id: rollout-neon-production
titulo: Rollout da integracao Neon e do frontend para production
tipo_trabalho: feature
fechado_em: 2026-10-11
modulo_afetado: [raiz, docs]
arquivos_alterados: [.env.production.local.example, docs/sprintx/features/rollout-neon-production/VERIFICACAO.md, docs/sprintx/features/rollout-neon-production/CHECKLIST-GOLDEN-PATH.md, docs/sprintx/features/rollout-neon-production/ROLLBACK.md, .gitignore, PROGRESSO.md, ROADMAP.md, README.md, CHANGELOG.md, CLAUDE.md]
palavras_chave: [neon, production, rollout, migration, function, cloudflare, dns, cors, golden-path]
resumo: Conta Facil esta em producao em https://contafacil.nymbuslab.com.br — backend Neon completo (schema, Function, Auth), frontend publicado no Cloudflare Pages com dominio proprio, golden path real validado de ponta a ponta.
decisao_principal: D-07 — o criterio de pronto do rollout (backend em production + frontend publicado no dominio final + golden path validado manualmente de ponta a ponta) foi cumprido integralmente e confirmado por evidencia real, nao por relato.
risco_residual: Nenhum bloqueio aberto. Pontos observados durante a execucao, sem acao pendente: (1) o dominio confiavel do Neon Auth nao estava na lista de tasks originais e precisou ser registrado manualmente durante o golden path (documentado em CLAUDE.md); (2) o deploy do frontend e manual via wrangler, sem CI (registrado como proximo passo em PROGRESSO.md/ROADMAP.md); (3) existe uma conta de teste real em production (qa-rollout-20261011@contafacil-test.com.br) criada para validar o golden path, mantida como evidencia.
testes_adicionados: 0
---

# Fechamento — rollout-neon-production

## O que foi entregue

O Conta Fácil está em produção: `https://contafacil.nymbuslab.com.br`. A branch `production` do
Neon tem o schema de negócio (`lancamentos`, `caixinhas`) e a Function `api` implantados, com CORS
liberado para o domínio final. O frontend está publicado no Cloudflare Pages, com DNS configurado
e o build real servindo o domínio. O golden path completo — cadastro, login, despesa, receita,
caixinha e reload — foi validado via automação de browser contra o ambiente real, não só relatado.
O runbook de rollback por Instant Restore (`ROLLBACK.md`) e o harness de verificação HTTP
(`VERIFICACAO.md`) também ficaram prontos.

## Decisão principal

D-07 (`00-DECISOES.md`): o critério de pronto do rollout — backend em `production`, frontend
publicado no domínio final, golden path validado manualmente de ponta a ponta — foi cumprido
integralmente, com evidência real em cada etapa (consultas diretas ao Neon, `curl` na Function e
no domínio, automação de browser no golden path), não relato do que deveria funcionar.

## Risco residual

Nenhum bloqueio aberto (todos os B-01 a B-06 de `00-BLOQUEIOS.md` foram resolvidos). Dois pontos
observados durante a execução, sem ação pendente:

- O domínio confiável do Neon Auth (`add_auth_trusted_domain`) não estava em nenhuma task do
  plano original — sem ele o cadastro/login real falhava com 403. Corrigido durante T-04.01 e
  registrado em `CLAUDE.md` como gotcha para o próximo rollout de branch.
- Existe uma conta de teste real em `production` (`qa-rollout-20261011@contafacil-test.com.br`),
  criada para validar o golden path e mantida como evidência do teste.

**Pós-fechamento (2026-10-11, mesmo dia):** o projeto Cloudflare Pages foi conectado ao GitHub
(`nymbuslab/conta-facil`, branch `master`), fechando a pendência de deploy manual. O build padrão
do Cloudflare falhou duas vezes com um bug conhecido do `npm 10.9.2` no resolvedor de dependências
(`Cannot read properties of null (reading 'edgesOut')`, disparado pelas cadeias de override de
peer dependency do `@neondatabase/auth`); corrigido fixando `NODE_VERSION=24` nas env vars de
build do projeto Pages. Deploy via CI confirmado funcionando, registrado em `CLAUDE.md` e
`PROGRESSO.md`.

A execução também corrigiu, no caminho, um Worker avulso criado por engano pelo painel do
Cloudflare durante a configuração manual do domínio — removido depois de identificado, sem
relação com o app real.

## Onde isto mexeu

- **Módulos:** raiz, docs
- **Arquivos:** `.env.production.local.example`, `docs/sprintx/features/rollout-neon-production/VERIFICACAO.md`, `docs/sprintx/features/rollout-neon-production/CHECKLIST-GOLDEN-PATH.md`, `docs/sprintx/features/rollout-neon-production/ROLLBACK.md`, `.gitignore`, `PROGRESSO.md`, `ROADMAP.md`, `README.md`, `CHANGELOG.md`, `CLAUDE.md`
- **Infra real alterada (fora do repositório):** branch `production` do projeto Neon
  `falling-tree-35553185` (tabelas, Function, domínio confiável do Auth); projeto Cloudflare Pages
  `conta-facil` (env var, deploy, domínio customizado) no account `17c4cca27f90ce6176d517cdc2242215`
- **Testes adicionados:** 0 (feature de infraestrutura e documentação, sem código de aplicação)
