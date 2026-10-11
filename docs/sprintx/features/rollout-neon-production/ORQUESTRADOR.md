---
expx_schema: 1
expx_tool: sprintx
kind: orquestrador
trabalho_id: rollout-neon-production
titulo: Rollout da integracao Neon e do frontend para production
tipo_trabalho: feature
tipo_ocorrencia: null
estagio: f6
status: concluido
criado_em: 2026-10-10
atualizado_em: 2026-10-11
concluido_em: 2026-10-11
sprints: [sprint-01, sprint-02, sprint-03, sprint-04, sprint-05]
caminho_critico: [T-03.01, T-03.02, T-03.04, T-04.01, T-04.02]
modulo_afetado: [raiz, docs]
arquivos_alterados: [.env.production.local.example, docs/sprintx/features/rollout-neon-production/VERIFICACAO.md, docs/sprintx/features/rollout-neon-production/CHECKLIST-GOLDEN-PATH.md, docs/sprintx/features/rollout-neon-production/ROLLBACK.md, .gitignore, PROGRESSO.md, ROADMAP.md, README.md, CHANGELOG.md, CLAUDE.md]
palavras_chave: [neon, production, rollout, migration, function, cloudflare, dns, cors]
---

# Orquestrador — rollout-neon-production

> Porta de entrada da execução. Escrito para quem abriu o repositório agora e não sabe nada. Só caminhos relativos; nunca o valor de um segredo.

## 1. Objetivo

Levar a integração Neon (já validada na branch `test`) para a branch `production`, que já
existe com Auth e Object Storage provisionados mas sem schema de negócio nem Function. Aplicar
a migration, implantar a Function `api` com CORS liberado para o domínio final, publicar o
frontend no Cloudflare Pages em `contafacil.nymbuslab.com.br` com DNS configurado, e validar o
golden path de ponta a ponta em produção real antes de considerar o rollout entregue.

## 2. Mapa e ordem de leitura

1. Este arquivo (`ORQUESTRADOR.md`)
2. `00-DECISOES.md` — decisões que governam o plano
3. `base/00-INDICE.md` — e os arquivos da base que ele lista (arquitetura atual, deploy/promoção no Neon, hospedagem do frontend)
4. `sprint-01/sprint.md` → `fases.md` → `tasks.md`
5. `sprint-02/` → `sprint-03/` → `sprint-04/`, cada um na mesma ordem (`sprint.md` → `fases.md` → `tasks.md`)
6. `00-BLOQUEIOS.md` — bloqueios registrados durante a execução
7. `00-AUDITORIA.md` — achados MÉDIA/BAIXA que permanecem válidos (quando existir)

## 3. Rota de execução

- Sprint 01: F-01.1 (T-01.01 ∥ T-01.02, sem dependência entre elas)
- Sprint 02: F-02.1 ∥ F-02.2 (paralelas) — dentro de F-02.1, T-02.01 ∥ T-02.02
- Sprint 03: F-03.1 — T-03.01 → (T-03.02 ∥ T-03.03) → T-03.04
- Sprint 04: F-04.1 — T-04.01 → T-04.02

Sprint-02 e sprint-03 não dependem uma da outra para começar (T-03.01, T-03.03 não dependem de
nada do Neon), mas `T-03.02` depende de `T-02.02` (precisa da URL real da Function de
production), e `T-04.01` depende de tasks das três sprints anteriores.

**Caminho crítico:** T-03.01 → T-03.02 → T-03.04 → T-04.01 → T-04.02 (5 tasks). O lado Neon
(sprint-02) e o harness (sprint-01) correm em paralelo com o início do sprint-03 sem atrasar essa
cadeia, desde que `T-02.02` termine antes de `T-03.02` começar.

## 4. Ferramentas

- **MCPs / SDKs:** MCP do Neon (`list_branches`, `get_database_tables`, `list_functions`,
  `get_default_branch`, etc.) para verificar o estado da branch `production` antes e depois de
  cada ação; Neon CLI (`neon deploy`, `drizzle-kit migrate`) para aplicar a migration e implantar
  a Function; Wrangler CLI (`npx wrangler pages ...`) para o Cloudflare Pages. ID do projeto Neon:
  `falling-tree-35553185`; id da branch `production`: `br-rapid-night-b4f7w7vu`.
- **Testes:** `npm run test -- --run` (Vitest). Os scripts `test:function:health` e
  `test:function:deployed` (reaproveitados pela sprint-01) rodam a verificação HTTP da Function.
- **Lint:** `npm run lint` (oxlint).
- **Typecheck:** `npm run build` (`tsc -b && vite build`) — o build já inclui o typecheck.
- **Segredos:**
  - `DATABASE_URL_UNPOOLED` da branch `production` — obtido via `neon env pull` ou console do
    Neon, usado só localmente para rodar a migration.
  - `FUNCTION_ALLOWED_ORIGINS` — definido como env da Function em `neon.ts` no momento do
    `neon deploy --env <arquivo>`, nunca commitado com valor.
  - `CLOUDFLARE_API_TOKEN` — variável de ambiente local/CI para o Wrangler CLI; precisa existir
    antes da T-03.01 (D-12, `00-DECISOES.md`).
  - `VITE_NEON_FUNCTION_API_BASE_URL` — variável de ambiente do projeto no Cloudflare Pages
    (painel/config do projeto), nunca commitada no repositório.

## 5. Agentes

- **Implementador** — executa a task (comando de infraestrutura, configuração ou documento) e
  prepara a evidência que prova o `teste_integracao` e o `teste_funcional`.
- **Revisor de testes** — antes de aceitar o resultado, responde: essa evidência provaria o
  mesmo se a task tivesse sido feita errado (ex.: Function implantada mas com CORS errado)? Se
  sim, a evidência é insuficiente e a task volta.
- **Auditor de aceite** — verifica o `criterio_aceite` da task diretamente contra o estado real
  (consulta ao Neon, ao Cloudflare ou ao domínio), não contra o que o implementador relatou,
  antes de permitir `status: concluida`.

**Agente único:** assume os três papéis em sequência dentro de cada task, nesta ordem, tratando
cada papel como um portão — não avança ao papel seguinte sem fechar o anterior.

## 6. Regras de autonomia

1. Não pergunte nada; não peça autorização para nada — o plano já foi aprovado na F5.
2. A evidência (consulta ao Neon/Cloudflare, resposta HTTP) vem antes de marcar qualquer task como concluída.
3. Task só é `concluida` com `teste_integracao` E `teste_funcional` confirmados e `criterio_aceite` verificado. Não existe "concluído com ressalva".
4. Dúvida nova ou pré-requisito faltando (ex.: `CLOUDFLARE_API_TOKEN` ausente): registrar em `00-BLOQUEIOS.md` (`B-NN | task | bloqueio | o que destravaria`), marcar a task `bloqueada`, pular para a próxima paralelizável. Nunca parar e esperar.
5. Só rode em paralelo o que o plano declarou paralelizável (seção 3); a execução nunca decide paralelismo.
6. Atualize `status` em `tasks.md` a cada transição; ao concluir, acrescente data e resultado da suíte.
7. Critério de saída de fase/sprint não atendido = não avança.
8. Nenhum comando destrutivo fora do declarado nas tasks (nada de `drop table`, reset de branch, exclusão de projeto) sem essa ação estar explicitamente numa task.

## 7. Definição de pronto global

- As tabelas `lancamentos` e `caixinhas` existem na branch `production` com o schema do Drizzle (D-02).
- A Function `api` está implantada em `production`, responde 200 em `/health`, e o CORS libera `https://contafacil.nymbuslab.com.br` (D-02, D-04).
- `ROLLBACK.md` documenta o procedimento de Instant Restore para `production` (D-05).
- O projeto Cloudflare Pages existe, publica o build do Vite, a variável `VITE_NEON_FUNCTION_API_BASE_URL` aponta para a Function real de `production`, e o domínio `contafacil.nymbuslab.com.br` resolve para ele (D-03, D-10, D-11).
- O checklist do golden path (`CHECKLIST-GOLDEN-PATH.md`) passa inteiro contra o domínio de produção real (D-06, D-07).
- `PROGRESSO.md`, `ROADMAP.md`, `README.md`, `CHANGELOG.md` e `CLAUDE.md` refletem o rollout concluído, sem frase desatualizada sobre "promoção para production" pendente (D-07).

## 8. Como retomar uma sessão interrompida

1. Leia este arquivo inteiro.
2. Leia o `status` de cada task em cada `sprint-NN/tasks.md`.
3. Leia `00-BLOQUEIOS.md`.
4. Continue da primeira task `pendente` ou `em_andamento` cujas dependências (`depende_de`) estão todas `concluida`. Ignore as `bloqueada` até que o bloqueio registrado seja resolvido.
