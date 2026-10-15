---
expx_schema: 1
expx_tool: sprintx
kind: orquestrador
trabalho_id: origem-deposito-caixinha
titulo: Origem do deposito na caixinha - saldo atual ou dinheiro de fora
tipo_trabalho: feature
tipo_ocorrencia: null
estagio: f6
status: concluido
criado_em: 2026-10-15
atualizado_em: 2026-10-15
concluido_em: 2026-10-15
sprints: [sprint-01, sprint-02, sprint-03]
caminho_critico: [T-01.01, T-01.02, T-02.01, T-02.02, T-02.03, T-02.04, T-02.05, T-02.06, T-03.01, T-03.02, T-03.03, T-03.04]
modulo_afetado: [db, drizzle, functions, test, hooks, state, components, types, routes]
arquivos_alterados: [src/db/schema.ts, src/db/schema.test.ts, drizzle/0003_caixinha_movimentacoes.sql, drizzle/meta/0003_snapshot.json, drizzle/meta/_journal.json, src/test/api-client-mocks.ts, src/test/api-client-mocks.test.ts, src/hooks/use-saldo-acumulado.test.tsx, src/functions/api/lancamentos-shared.ts, src/functions/api/lancamentos-shared.test.ts, src/functions/api/caixinhas.ts, src/functions/api/caixinhas.test.ts, src/test/caixinhas-setup.ts, src/types/caixinha.ts, src/types/caixinha.test.ts, src/components/movimentar-caixinha-modal.tsx, src/components/movimentar-caixinha-modal.test.tsx, src/state/caixinhas-context.tsx, src/state/caixinhas-context.test.tsx, src/routes/caixinhas.tsx, src/routes/caixinhas.test.tsx]
palavras_chave: [caixinha, deposito, resgate, origem, saldo, receita, movimentacao, idempotencia]
---

# Orquestrador — origem-deposito-caixinha

> Porta de entrada da execução. Escrito para quem abriu o repositório agora e não sabe nada. Só caminhos relativos; nunca o valor de um segredo.

## 1. Objetivo

Ao depositar numa caixinha, o usuário escolhe se o valor veio do saldo que o app já controla
("saldo atual") ou se é dinheiro novo entrando de fora ("de fora"). No segundo caso, o depósito
gera também um lançamento de receita vinculado e tem efeito líquido zero no saldo do mês no
momento do depósito; resgate sempre soma de volta ao saldo, independente da origem. Exige tabela
nova de movimentações por depósito, mudança na Function de caixinhas e um campo novo no modal de
depósito.

## 2. Mapa e ordem de leitura

1. Este arquivo (`ORQUESTRADOR.md`)
2. `00-DECISOES.md` — 7 decisões (D-01 a D-07), nenhuma pendência
3. `base/00-INDICE.md` — e os arquivos da base que ele lista (schema, Function, frontend, cálculo de saldo, idempotência, lançamentos, padrões de teste)
4. `sprint-01/sprint.md` → `fases.md` → `tasks.md`
5. `sprint-02/` e `sprint-03/`, na mesma ordem
6. `00-BLOQUEIOS.md` — bloqueios registrados durante a execução
7. `00-AUDITORIA.md` — achados MÉDIA/BAIXA que permanecem válidos (quando existir)

## 3. Rota de execução

- Sprint 01: F-01.1 ∥ F-01.2 (paralelas entre si; sequenciais internamente)
- Sprint 02: F-02.1 → F-02.2 → F-02.3 (cadeia única)
- Sprint 03: F-03.1 → F-03.2 (dentro de F-03.2, T-03.04 ∥ T-03.05, ambas dependendo só de T-03.03)

**Caminho crítico:** T-01.01 → T-01.02 → T-02.01 → T-02.02 → T-02.03 → T-02.04 → T-02.05 →
T-02.06 → T-03.01 → T-03.02 → T-03.03 → T-03.04 (empate com T-03.05 no fim, desempatado pelo id
menor).

## 4. Ferramentas

- **MCPs / SDKs:** Neon MCP só se for preciso inspecionar a branch `test` manualmente; nenhum
  outro além do padrão do projeto.
- **Testes:** `npm run test` (Vitest). Integração real: `npm run test:migrate` e
  `npm run test:integration:idempotencia` (branch Neon `test`, atrás de `garantirBranchDeTeste()`).
- **Lint:** `npm run lint` (oxlint).
- **Typecheck:** `npm run build` (roda `tsc -b` antes do `vite build`).
- **Segredos:** `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `NEON_BRANCH`, `NEON_AUTH_BASE_URL`,
  `NEON_AUTH_JWKS_URL` — ficam em `.env.test.local` (não versionado). NUNCA escreva o valor.

## 5. Agentes

- **Implementador** — escreve primeiro os dois testes da task, vê ambos falharem, implementa até passarem.
- **Revisor de testes** — antes de aceitar o verde, responde: este teste falharia com uma implementação errada? Se não, o teste volta.
- **Auditor de aceite** — verifica de fato o `criterio_aceite` da task antes de permitir `status: concluida`.

**Agente único:** assume os três papéis em sequência dentro de cada task, nesta ordem, tratando cada papel como um portão — não avança ao papel seguinte sem fechar o anterior.

## 6. Regras de autonomia

1. Não pergunte nada; não peça autorização para nada — **com uma exceção fixa, abaixo**.
2. O teste vem antes do código, sempre.
3. Task só é `concluida` com teste de integração E funcional passando e `criterio_aceite` verificado. Não existe "concluído com ressalva".
4. Dúvida nova ou pré-requisito faltando: registrar em `00-BLOQUEIOS.md` (`B-NN | task | bloqueio | o que destravaria`), marcar a task `bloqueada`, pular para a próxima paralelizável. Nunca parar e esperar.
5. Só rode em paralelo o que o plano declarou paralelizável; a execução nunca decide paralelismo.
6. Atualize `status` em `tasks.md` a cada transição; ao concluir, acrescente data e resultado da suíte.
7. Critério de saída de fase/sprint não atendido = não avança.
8. **Portão de design (fixo, não dispensado pela autonomia):** `T-03.02` introduz um elemento
   visual novo (o seletor de origem no modal de depósito). Antes de escrever qualquer código
   desse componente, PARE, gere o protótipo no Stitch (design system do projeto:
   `assets/4d36820163ae41f2a29bf0522f55bb24`, "Caderneta Financeira Digital") seguindo a skill
   `regras-design`, e aguarde aprovação explícita do usuário antes de implementar. Isso vem do
   `CLAUDE.md` global do usuário ("Em conflito entre 'não pergunte' e um portão daqui, o portão
   ganha") e não é uma regra desta feature — é padrão do projeto para qualquer UI nova. Nenhuma
   outra task desta feature cria ou altera elemento visual (as demais são schema, backend,
   tipos e contexto), então este é o único ponto de parada da F6.

## 7. Definição de pronto global

- `npm run test` inteiro verde, incluindo os 15 cenários novos das três sprints.
- `npm run build` sem erro.
- `npm run test:migrate` + `npm run test:integration:idempotencia` verdes contra a branch `test`,
  com o cenário `de_fora` e a limpeza de `lancamentos`/`caixinha_movimentacoes` no lugar.
- Protótipo do campo de origem aprovado pelo usuário (portão da seção 6.8) antes de `T-03.02`
  entrar em `concluida`.
- Validação visual manual do modal de depósito (desktop e mobile) com login real — mesma ressalva
  já usada em entregas anteriores deste projeto quando a ferramenta de browser não está
  disponível na sessão: declarar "build OK, UI não validada" em vez de travar a entrega.
- Convergência da F6 (regra 21 do método) conferindo as 7 decisões D-NN contra o código entregue,
  sem achado aberto de severidade alta.

## 8. Como retomar uma sessão interrompida

1. Leia este arquivo inteiro.
2. Leia o `status` de cada task em cada `sprint-NN/tasks.md`.
3. Leia `00-BLOQUEIOS.md`.
4. Continue da primeira task `pendente` ou `em_andamento` cujas dependências (`depende_de`) estão todas `concluida`. Ignore as `bloqueada` até que o bloqueio registrado seja resolvido.
