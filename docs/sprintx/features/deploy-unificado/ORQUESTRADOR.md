---
expx_schema: 1
expx_tool: sprintx
kind: orquestrador
trabalho_id: deploy-unificado
titulo: Deploy unificado em um comando
tipo_trabalho: feature
tipo_ocorrencia: null
estagio: f6
status: concluido
criado_em: 2026-10-12
atualizado_em: 2026-10-12
concluido_em: 2026-10-12
sprints: [sprint-01, sprint-02]
caminho_critico: [T-01.01, T-01.02, T-01.03, T-02.01, T-02.02, T-02.03, T-02.04, T-02.06, T-02.05, T-02.07]
modulo_afetado: [scripts, raiz]
arquivos_alterados: [scripts/deploy.mjs, scripts/deploy.test.ts, DEPLOY.md, package.json, .gitignore]
palavras_chave: [deploy, neon, cli, cloudflare, push, function, health-check, dry-run]
---

# Orquestrador — deploy-unificado

## Objetivo

Um comando único, `npm run deploy`, substitui os dois passos manuais de deploy (push para o
frontend no Cloudflare Pages e `neon deploy` para a Function): detecta mudanças na Function e
em migrations, deploya a Function e valida o health check **antes** do push. O script falha
fechado: qualquer checagem que não passa aborta antes do push — o passo irreversível.

## Mapa e ordem de leitura

1. Este arquivo (`ORQUESTRADOR.md`)
2. `00-DECISOES.md` — as 18 decisões fechadas que o plano realiza
3. `base/00-INDICE.md` — ponteiro para a base ingerida (processo atual, CLI Neon, padrão de scripts)
4. `sprint-01/` — `sprint.md`, `fases.md`, `tasks.md` (fundação testável)
5. `sprint-02/` — `sprint.md`, `fases.md`, `tasks.md` (orquestração real e entrada)
6. `00-BLOQUEIOS.md` — bloqueios da execução, se surgirem

## Rota de execução

Sequência linear — nenhuma task corre em paralelo com outra (todas escrevem em
`scripts/deploy.mjs` + `scripts/deploy.test.ts`):

1. `sprint-01`: F-01.1 (T-01.01) → F-01.2 (T-01.02, T-01.03)
2. `sprint-02`: F-02.1 (T-02.01, T-02.02, T-02.03) → F-02.2 (T-02.04, T-02.06, T-02.05, T-02.07)

**Caminho crítico:** a cadeia inteira — T-01.01 → T-01.02 → T-01.03 → T-02.01 → T-02.02 →
T-02.03 → T-02.04 → T-02.06 → T-02.05 → T-02.07. Não há nada em paralelo; a duração total é a
soma das tasks. O health check (T-02.06) roda entre o deploy da Function e o push.

## Ferramentas

- **Testes:** `npm run test -- --run` (Vitest; o script é testado em `scripts/deploy.test.ts`)
- **Typecheck + build:** `npm run build` (roda `tsc -b` antes do Vite)
- **Lint:** `npm run lint` (oxlint)
- **CLI Neon:** linkado em `.neon` (branch `production`); `neon deploy --env .env.local`
- **Segredos (nomes e locais, nunca valores):** `.env.local` — `FUNCTION_ALLOWED_ORIGINS`
  (obrigatória para o deploy da Function), `NEON_FUNCTION_API_BASE_URL` (health check),
  `DATABASE_URL` (vars geridas pelo Neon). `.env.local` é gitignorado.
- **MCP Neon:** consultas de estado (branches, functions) quando necessário

## Agentes

Com um único agente, os três papéis são assumidos em sequência dentro de cada task:

1. **Implementador** — escreve o teste antes, o código depois (TDD)
2. **Revisor de testes** — confere que o teste falharia com implementação errada
3. **Auditor de aceite** — confere o `criterio_aceite` da task antes de marcar `concluida`

## Regras de autonomia

- Não perguntar durante a execução de task: o plano já resolveu as ambiguidades
- Teste antes do código, sempre
- Dúvida nova → registrar em `00-BLOQUEIOS.md`, pular a task, seguir para a próxima
  paralelizável (neste plano: pular para a próxima dependente livre)
- Critério de aceite não atendido = task não avança de status
- Status atualizado em `tasks.md` a cada transição de task

## Definição de pronto global

- `npm run deploy` existe no `package.json` e, com working tree sujo, termina exitCode 1 com
  mensagem única
- `npm run deploy -- --sim` imprime a sequência sem chamar nenhum executor de ação
- `DEPLOY.md` na raiz documenta os passos fora do script (env vars do painel Cloudflare Pages,
  domínio confiável do Neon Auth em branch nova, migration em production)
- Suíte, build e lint verdes

## Como retomar uma sessão interrompida

Ler este arquivo; ler os `status` em `sprint-01/tasks.md` e `sprint-02/tasks.md`; ler
`00-BLOQUEIOS.md`; continuar da primeira task `pendente` ou `em_andamento` cujas dependências
estão todas `concluida`.
