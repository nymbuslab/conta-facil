---
expx_schema: 1
expx_tool: sprintx
kind: orquestrador
trabalho_id: editar-excluir-lancamentos
titulo: Editar e excluir lancamentos
tipo_trabalho: feature
tipo_ocorrencia: null
estagio: f6
status: concluido
criado_em: 2026-10-17
atualizado_em: 2026-10-17
concluido_em: 2026-10-17
sprints: [sprint-01, sprint-02, sprint-03, sprint-04, sprint-05]
caminho_critico: [T-01.01, T-03.01, T-03.02, T-03.03, T-03.04, T-03.05, T-03.06, T-04.01, T-04.02, T-04.03]
modulo_afetado: [functions, state, components, routes, test, lib]
arquivos_alterados: [src/test/api-client-mocks.ts, src/test/api-client-mocks.test.ts, src/lib/api-client.ts, src/lib/api-client.test.ts, src/functions/api/lancamentos.ts, src/functions/api/lancamentos.test.ts, src/test/lancamentos-setup.ts, src/state/lancamentos-context.tsx, src/state/lancamentos-context.test.tsx, src/components/acoes-lancamento-dialog.tsx, src/components/acoes-lancamento-dialog.test.tsx, src/components/extrato-lista.tsx, src/components/lista-lancamentos.tsx, src/components/extrato-lista.test.tsx, src/components/lista-lancamentos.test.tsx, src/lib/colunas-lancamento.tsx, src/components/fluxos-assincronos.test.tsx, src/components/acessibilidade.test.tsx, src/routes/parcelas.test.tsx]
palavras_chave: [lancamentos, editar, excluir, extrato, parcelamento, caixinha, idempotencia, dialogo]
---

# Orquestrador — editar-excluir-lancamentos

> Porta de entrada da execução. Escrito para quem abriu o repositório agora e não sabe nada. Só caminhos relativos; nunca o valor de um segredo.

## 1. Objetivo

Permitir editar e excluir lançamentos (receita e despesa) direto do diálogo que hoje só
confirma pagamento, no Extrato. Cobre despesa já paga (com aviso), parcela de parcelamento
(com escolha de alcance) e o bloqueio de receita vinculada a um depósito em caixinha. Sem
auditoria/histórico nesta entrega.

## 2. Mapa e ordem de leitura

1. Este arquivo (`ORQUESTRADOR.md`)
2. `00-DECISOES.md` — decisões que governam o plano (D-01 a D-10)
3. `base/00-INDICE.md` — e os arquivos da base que ele lista
4. `sprint-01/sprint.md` → `fases.md` → `tasks.md`
5. `sprint-02/`, `sprint-03/`, `sprint-04/`, `sprint-05/` (convergência, rodada 1), cada um na mesma ordem (`sprint.md` → `fases.md` → `tasks.md`)
6. `00-CONVERGENCIA.md` — rodadas de convergência (achados e resultado)
7. `00-BLOQUEIOS.md` — bloqueios registrados durante a execução
8. `00-AUDITORIA.md` — achados MÉDIA/BAIXA que permanecem válidos

## 3. Rota de execução

- Sprint 01: F-01.1 (T-01.01 ∥ T-01.02, paralelas — arquivos diferentes)
- A partir daí, dois ramos correm em paralelo entre si, cada um dependendo só de uma das tasks da sprint-01:
  - **Ramo backend** (Sprint 02, depende de T-01.02): F-02.1 → F-02.2 → F-02.3
  - **Ramo frontend** (Sprints 03 e 04, depende de T-01.01): Sprint 03 F-03.1 → F-03.2, seguido de Sprint 04 F-04.1
- Nenhuma task do ramo frontend depende de uma task do ramo backend (cada camada usa mock própria — `api-client-mocks.ts` no frontend, `repositorio` fake no backend). Os dois ramos só precisam convergir de fato quando a feature for validada ponta a ponta contra o ambiente real, fora do escopo de uma task individual.

**Caminho crítico:** T-01.01 → T-03.01 → T-03.02 → T-03.03 → T-03.04 → T-03.05 → T-03.06 → T-04.01 → T-04.02 → T-04.03 (10 tasks — o ramo frontend é mais longo que o backend, que tem 7: T-01.02 → T-02.01 → T-02.02 → T-02.03 → T-02.04 → T-02.05 → T-02.06).

## 4. Ferramentas

- **MCPs / SDKs:** nenhum além do padrão. Esta feature não cria migration nova — os campos
  editados já existem em `lancamentos` (`base/schema-lancamentos.md`), e o vínculo com
  caixinha é lido de `caixinha_movimentacoes`, que também já existe.
- **Testes:** `npm run test -- --run <arquivos>` (vitest). Critério de saída de cada sprint
  lista os arquivos exatos em `sprint.md`.
- **Lint:** `npm run lint` (oxlint).
- **Typecheck:** `npm run build` (`tsc -b`, embutido no build — não existe script de typecheck isolado no projeto).
- **Segredos:** nenhum segredo novo. Esta feature não lê nem grava nenhuma env var além das já existentes (`DATABASE_URL`/`DATABASE_URL_UNPOOLED`, lidas pela Function como todo o resto de `src/functions/api/`).

## 5. Agentes

- **Implementador** — escreve primeiro os dois testes da task, vê ambos falharem, implementa até passarem.
- **Revisor de testes** — antes de aceitar o verde, responde: este teste falharia com uma implementação errada? Se não, o teste volta.
- **Auditor de aceite** — verifica de fato o `criterio_aceite` da task antes de permitir `status: concluida`.

**Agente único:** assume os três papéis em sequência dentro de cada task, nesta ordem, tratando cada papel como um portão — não avança ao papel seguinte sem fechar o anterior.

## 6. Regras de autonomia

1. Não pergunte nada; não peça autorização para nada.
2. O teste vem antes do código, sempre.
3. Task só é `concluida` com teste de integração E funcional passando e `criterio_aceite` verificado. Não existe "concluído com ressalva".
4. Dúvida nova ou pré-requisito faltando: registrar em `00-BLOQUEIOS.md` (`B-NN | task | bloqueio | o que destravaria`), marcar a task `bloqueada`, pular para a próxima paralelizável. Nunca parar e esperar.
5. Só rode em paralelo o que o plano declarou paralelizável; a execução nunca decide paralelismo.
6. Atualize `status` em `tasks.md` a cada transição; ao concluir, acrescente data e resultado da suíte.
7. Critério de saída de fase/sprint não atendido = não avança.

## 7. Definição de pronto global

- Receita e despesa abrem `AcoesLancamentoDialog` ao clicar na linha, no Extrato e em `ListaLancamentos`, incluindo despesa já paga (D-01, D-02).
- Editar e excluir funcionam de ponta a ponta (rota real, não só mock), com os cards Receita/Despesa/Total Pago do Extrato recalculando corretamente depois.
- Parcela de parcelamento pergunta o alcance (só esta ou esta e as futuras) antes de confirmar, e `totalParcelas` fica correto depois de uma exclusão (D-03).
- Receita vinculada a uma caixinha mostra o erro do backend ao tentar editar/excluir, sem desincronizar o saldo guardado (D-04).
- Exclusão sempre passa pela confirmação com botão vermelho que nomeia a consequência (D-07).
- Tela Parcelas reflete edição/exclusão de parcela nos agregados (`parcelasPagas`, `valorTotal`, `valorPago`) sem precisar de nova navegação (D-10).
- Todas as suítes dos critérios de saída de sprint (seção 3 de cada `sprint.md`) terminam com 0 failed.

## 8. Como retomar uma sessão interrompida

1. Leia este arquivo inteiro.
2. Leia o `status` de cada task em cada `sprint-NN/tasks.md`.
3. Leia `00-BLOQUEIOS.md`.
4. Continue da primeira task `pendente` ou `em_andamento` cujas dependências (`depende_de`) estão todas `concluida`. Ignore as `bloqueada` até que o bloqueio registrado seja resolvido.
