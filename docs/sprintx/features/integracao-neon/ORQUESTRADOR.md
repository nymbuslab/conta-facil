---
expx_schema: 1
expx_tool: sprintx
kind: orquestrador
trabalho_id: integracao-neon
titulo: Integracao Neon - login real e persistencia de lancamentos e caixinhas
tipo_trabalho: feature
tipo_ocorrencia: null
estagio: f6
status: concluida
criado_em: 2026-10-10
atualizado_em: 2026-10-10
concluido_em: 2026-10-10
sprints: [sprint-01, sprint-02, sprint-03, sprint-04]
caminho_critico: [T-01.01, T-01.02, T-01.03, T-03.01, T-03.03, T-04.02, T-04.04]
modulo_afetado: [raiz, scripts, test, functions, state, routes, lib, db]
arquivos_alterados: [neon.ts, drizzle.config.ts, drizzle/0000_init.sql, src/db/schema.ts, src/functions/api/index.ts, src/functions/api/auth-middleware.ts, src/functions/api/lancamentos.ts, src/functions/api/caixinhas.ts, src/state/auth-context.tsx, src/state/lancamentos-context.tsx, src/state/caixinhas-context.tsx, src/lib/api-client.ts, src/routes/login.tsx, src/routes/cadastro.tsx, src/routes/index.tsx, src/routes/parcelas.tsx, src/routes/caixinhas.tsx, src/routes/perfil.tsx, src/components/estado-dados.tsx, package.json, vite.config.ts]
palavras_chave: [neon, auth, postgres, functions, drizzle, lancamentos, caixinhas, login]
---

# Orquestrador — integracao-neon

> Porta de entrada da execução. Escrito para quem abriu o repositório agora e não sabe nada. Só caminhos relativos; nunca o valor de um segredo.

## 1. Objetivo

Sair de dados em memória para persistência real no Neon: login/cadastro reais via Neon
Managed Auth substituem o perfil mockado "Alex Pereira", e as telas Início, Parcelas e
Caixinhas passam a ler e escrever num Postgres real através de uma Neon Function autenticada
(nunca pela Data API direto do browser). Cada usuário só vê os próprios lançamentos e
caixinhas.

## 2. Mapa e ordem de leitura

1. Este arquivo (`ORQUESTRADOR.md`)
2. `00-DECISOES.md` — 11 decisões que governam o plano
3. `base/00-INDICE.md` — e os arquivos da base que ele lista
4. `sprint-01/sprint.md` → `fases.md` → `tasks.md`
5. `sprint-02/`, `sprint-03/`, `sprint-04/` em diante, na mesma ordem
6. `00-BLOQUEIOS.md` — bloqueios registrados durante a execução
7. `00-AUDITORIA.md` — achados MÉDIA/BAIXA que permanecem válidos

## 3. Rota de execução

- Sprint 01 (capacidade de testar): F-01.1 — T-01.01 primeiro; T-01.02 depois dela (as duas
  escrevem `package.json`, não podem rodar juntas); T-01.03 e T-01.04 em paralelo entre si,
  logo depois de T-01.02.
- Sprint 02 (Neon Auth): F-02.1 — T-02.01 primeiro; T-02.02 e T-02.03 em paralelo depois;
  T-02.04 por último.
- Sprint 03 (schema e Function): F-03.1 (T-03.01) e F-03.2 (T-03.02) partem em paralelo entre
  si (dependências diferentes); T-03.03 e T-03.04 rodam em paralelo depois que T-03.01 e
  T-03.02 concluírem.
- Sprint 04 (migrar contextos): F-04.1 — T-04.01 primeiro; T-04.02 e T-04.03 em paralelo
  depois; T-04.04 por último.

**Caminho crítico:** T-01.01 → T-01.02 → T-01.03 → T-03.01 → T-03.03 → T-04.02 → T-04.04
(7 tasks).

## 4. Ferramentas

- **MCPs / SDKs:** Neon CLI (`neon`) para branch, deploy e Functions; `@neon/config` e
  `@neon/env` (já instalados) para `neon.ts`/`parseEnv`; `drizzle-orm` + `pg` para o schema e
  as queries da Function; `hono` para a Function; `@neondatabase/auth` para o cliente de
  sessão (D-07); `jose` para verificar o JWT na Function (D-02).
- **Testes:** `npm run test` (unitários/componentes, Vitest) e `npm run test:integration`
  (contra a branch Neon de teste, criada na T-01.01/T-01.03).
- **Lint:** `npm run lint` (oxlint).
- **Typecheck:** parte de `npm run build` (`tsc -b`).
- **Segredos:** `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `NEON_AUTH_BASE_URL`,
  `NEON_AUTH_JWKS_URL` — ficam em `.env.local` (nunca versionado, `.gitignore` cobre
  `.env.*`), preenchidos por `neon env pull`/`neon deploy`. A variável com a conexão da
  branch de teste (usada por `src/test/db-setup.ts`) fica no mesmo `.env.local`, com nome a
  definir na T-01.03 — NUNCA escrever o valor em nenhum arquivo do método.

## 5. Agentes

- **Implementador** — escreve primeiro os dois testes da task, vê ambos falharem, implementa
  até passarem.
- **Revisor de testes** — antes de aceitar o verde, responde: este teste falharia com uma
  implementação errada? Se não, o teste volta.
- **Auditor de aceite** — verifica de fato o `criterio_aceite` da task antes de permitir
  `status: concluida`.

**Agente único:** assume os três papéis em sequência dentro de cada task, nesta ordem,
tratando cada papel como um portão — não avança ao papel seguinte sem fechar o anterior.

## 6. Regras de autonomia

1. Não pergunte nada; não peça autorização para nada — **exceto o portão de design**: antes de
   escrever código de interface de uma tela nova ou de um estado visual novo (T-02.02, T-02.03,
   T-04.04), gerar o protótipo no Stitch e aguardar aprovação explícita do usuário. Em conflito
   entre "não pergunte" e esse portão, o portão ganha; a task fica `em_andamento` até a
   aprovação chegar, sem virar bloqueio.
2. O teste vem antes do código, sempre.
3. Task só é `concluida` com teste de integração E funcional passando e `criterio_aceite`
   verificado. Não existe "concluído com ressalva".
4. Dúvida nova ou pré-requisito faltando: registrar em `00-BLOQUEIOS.md`
   (`B-NN | task | bloqueio | o que destravaria`), marcar a task `bloqueada`, pular para a
   próxima paralelizável. Nunca parar e esperar.
5. Só rode em paralelo o que o plano declarou paralelizável; a execução nunca decide
   paralelismo.
6. Atualize `status` em `tasks.md` a cada transição; ao concluir, acrescente data e resultado
   da suíte.
7. Critério de saída de fase/sprint não atendido = não avança.

## 7. Definição de pronto global

Derivado de D-11 (`00-DECISOES.md`) e dos critérios de saída das quatro sprints:

- Perfil mockado "Alex Pereira" não existe mais em nenhuma tela; login e cadastro reais
  funcionam contra o Postgres do projeto.
- Início, Parcelas e Caixinhas leem e escrevem via a Neon Function, sobrevivendo a reload de
  página.
- Cada usuário só vê os próprios lançamentos e caixinhas (D-10).
- Falha de rede/Postgres mostra erro com "tentar novamente", nunca mascara com dado antigo
  (D-06).
- `npm run test` e `npm run test:integration` passam, e `npm run build` conclui sem erro de
  typecheck.

## 8. Como retomar uma sessão interrompida

1. Leia este arquivo inteiro.
2. Leia o `status` de cada task em cada `sprint-NN/tasks.md`.
3. Leia `00-BLOQUEIOS.md`.
4. Continue da primeira task `pendente` ou `em_andamento` cujas dependências (`depende_de`)
   estão todas `concluida`. Ignore as `bloqueada` até que o bloqueio registrado seja
   resolvido.
