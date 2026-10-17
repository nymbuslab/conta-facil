---
expx_schema: 1
expx_tool: sprintx
kind: orquestrador
trabalho_id: dashboard-extrato
titulo: Dashboard e Extrato
tipo_trabalho: feature
tipo_ocorrencia: null
estagio: f6
status: concluido
criado_em: 2026-10-17
atualizado_em: 2026-10-17
concluido_em: 2026-10-17
sprints: [sprint-01, sprint-02, sprint-03, sprint-04, sprint-05]
caminho_critico: [T-01.01, T-01.02, T-02.01, T-02.02, T-02.03, T-02.04, T-02.06, T-03.01, T-03.02, T-03.03, T-03.04, T-04.01, T-04.02, T-04.04, T-04.05, T-04.06, T-05.01, T-05.02, T-05.03]
modulo_afetado: [test, routes, raiz, functions, components, state]
arquivos_alterados: [src/test/api-client-mocks.ts, src/test/api-client-mocks.test.ts, src/routes/extrato.tsx, src/routes/extrato.test.tsx, src/router.tsx, src/functions/api/lancamentos.ts, src/functions/api/lancamentos.test.ts, src/test/lancamentos-setup.ts, src/components/ui/sheet.tsx, src/components/ui/sheet.test.tsx, src/components/menu-mais.tsx, src/components/menu-mais.test.tsx, src/components/bottom-nav.tsx, src/components/bottom-nav.test.tsx, src/routes/perfil.test.tsx, src/state/lancamentos-context.tsx, src/state/lancamentos-context.test.tsx, src/components/card-contas-vencendo.tsx, src/components/card-contas-vencendo.test.tsx, src/components/card-ultimos-lancamentos.tsx, src/components/card-ultimos-lancamentos.test.tsx, src/routes/index.tsx, src/routes/index.test.tsx, src/components/estado-dados.tsx, src/components/extrato-lista.tsx, src/components/extrato-lista.test.tsx]
palavras_chave: [dashboard, extrato, navegacao, menu-lateral, contas-vencendo, ultimos-lancamentos, abas, sheet]
---

# Orquestrador — dashboard-extrato

> Porta de entrada da execução. Escrito para quem abriu o repositório agora e não sabe nada.
> Só caminhos relativos; nunca o valor de um segredo.

## 1. Objetivo

A tela Início deixa de ser onde o usuário registra lançamentos e passa a ser um dashboard (4
cards de resumo, "Contas vencendo" e "Últimos lançamentos"). O registro e a consulta detalhada
de receitas/despesas migram para uma tela nova, "Extrato" (busca, navegação de mês, abas
Receita/Despesas, botão de registrar). A navegação inferior ganha um quinto item, "Mais", que
abre um painel lateral com Início/Extrato/Parcelas/Caixinhas/Perfil/Sair — Perfil sai da barra
inferior.

## 2. Mapa e ordem de leitura

1. Este arquivo (`ORQUESTRADOR.md`)
2. `00-DECISOES.md` — decisões que governam o plano (D-01 a D-18)
3. `base/00-INDICE.md` — e os 6 arquivos da base que ele lista
4. `sprint-01/sprint.md` → `fases.md` → `tasks.md`
5. `sprint-02/`, `sprint-03/`, `sprint-04/`, `sprint-05/`, cada um na mesma ordem (sprint → fases → tasks)
6. `00-BLOQUEIOS.md` — bloqueios registrados durante a execução
7. `00-AUDITORIA.md` — achados MÉDIA/BAIXA que permanecem válidos (quando existir)

## 3. Rota de execução

- Sprint 01: F-01.1 ∥ F-01.2 (paralelas)
- Sprint 02: F-02.1 → F-02.2
- Sprint 03: F-03.1 → F-03.2
- Sprint 04: F-04.1 → F-04.2
- Sprint 05: F-05.1 → F-05.2

Nenhuma sprint foi declarada paralela com outra sprint — a ordem 01 → 02 → 03 → 04 → 05 é
sequencial (sprint-02 depende dos endpoints de backend; sprint-03 e sprint-04 dependem do
scaffold da rota `/extrato` da sprint-01 e dos endpoints da sprint-02; sprint-05 fecha a
composição da rota que a sprint-01 só escalonou).

**Caminho crítico:** T-01.01 → T-01.02 → T-02.01 → T-02.02 → T-02.03 → T-02.04 → T-02.06 →
T-03.01 → T-03.02 → T-03.03 → T-03.04 → T-04.01 → T-04.02 → T-04.04 → T-04.05 → T-04.06 →
T-05.01 → T-05.02 → T-05.03 (19 tasks — a cadeia mais longa dentro de cada sprint, seguida em
sequência porque nenhuma sprint foi declarada paralela com outra).

## 4. Ferramentas

- **MCPs / SDKs:** nenhum além do padrão do projeto (Neon MCP se precisar inspecionar a branch
  `test` durante a integração da sprint-02; não é obrigatório, `lancamentos-setup.ts` já conecta
  direto via `DATABASE_URL_UNPOOLED`).
- **Testes:** `npm run test -- --run` (unitário/componente); `npm run test:integration:lancamentos`
  (integração real contra a branch Neon `test`, sprint-02).
- **Lint:** `npm run lint` (oxlint)
- **Typecheck:** `npm run build` (roda `tsc -b` antes do build Vite)
- **Segredos:** `DATABASE_URL_UNPOOLED` e `NEON_AUTH_BASE_URL` — ficam em `.env.test.local`
  (local, não versionado), já configurados para a branch `test` pelas sprints anteriores do
  projeto. Esta feature não introduz segredo novo (D-17).

## 5. Agentes

- **Implementador** — escreve primeiro os dois testes da task, vê ambos falharem, implementa
  até passarem.
- **Revisor de testes** — antes de aceitar o verde, responde: este teste falharia com uma
  implementação errada? Se não, o teste volta.
- **Auditor de aceite** — verifica de fato o `criterio_aceite` da task antes de permitir
  `status: concluida`.

**Agente único:** assume os três papéis em sequência dentro de cada task, nesta ordem, tratando
cada papel como um portão — não avança ao papel seguinte sem fechar o anterior.

## 6. Regras de autonomia

1. Não pergunte nada; não peça autorização para nada.
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

- `npm run build` passa (typecheck incluso).
- `npm run test -- --run` passa, sem falha nova (a falha pré-existente do achado de pentest em
  `checar-cursor-forjado.test.ts` não é desta feature e não bloqueia).
- `npm run test:integration:lancamentos` passa cobrindo `/lancamentos/vencendo` e
  `/lancamentos/recentes` contra a branch Neon `test` real (D-06, D-07).
- `npm run lint` passa.
- Validação visual no navegador (desktop e mobile) das duas telas — Início (dashboard) e Extrato
  (D-18).
- Validação real em produção com dados reais da conta do usuário: "Contas vencendo" e "Últimos
  lançamentos" mostrando dados reais, não só fixture de teste (D-18) — depende de deploy manual
  da Function (`npm run deploy`) após a F6, fora do escopo das tasks em si.
- `DESIGN.md` documenta o `Sheet`/painel "Mais" e as abas do Extrato como componentes novos do
  design system — não existe task própria para isso (documentação sem teste verificável não
  cabe no contrato de task do método); é um ajuste de documentação a fazer no fechamento (F6) ou
  pela skill `concluir-tarefa`, igual às demais features do projeto.

## 8. Como retomar uma sessão interrompida

1. Leia este arquivo inteiro.
2. Leia o `status` de cada task em cada `sprint-NN/tasks.md`.
3. Leia `00-BLOQUEIOS.md`.
4. Continue da primeira task `pendente` ou `em_andamento` cujas dependências (`depende_de`)
   estão todas `concluida`. Ignore as `bloqueada` até que o bloqueio registrado seja resolvido.
