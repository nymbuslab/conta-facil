---
expx_schema: 1
expx_tool: sprintx
kind: orquestrador
trabalho_id: navegacao-inferior
titulo: Navegacao inferior com Parcelas Caixinhas e Perfil
tipo_trabalho: feature
tipo_ocorrencia: null
estagio: f6
status: concluido
criado_em: 2026-10-08
atualizado_em: 2026-10-08
concluido_em: 2026-10-08
sprints: [sprint-01, sprint-02, sprint-03, sprint-04, sprint-05]
caminho_critico: [T-01.01, T-01.02, T-01.03, T-02.02, T-02.03, T-02.04, T-02.05, T-03.01, T-03.02, T-03.03, T-03.05, T-04.01, T-04.02, T-04.04, T-04.07]
modulo_afetado: [raiz, components, routes, state, types, hooks, lib, test]
arquivos_alterados: [vite.config.ts, package.json, package-lock.json, src/test/setup.ts, src/test/test-utils.tsx, src/components/header.test.tsx, src/test/render-route.tsx, src/routes/__root.test.tsx, src/routes/__root.tsx, src/routes/index.tsx, src/router.tsx, src/routes/parcelas.tsx, src/routes/caixinhas.tsx, src/routes/perfil.tsx, src/routes/parcelas.test.tsx, src/components/bottom-nav.tsx, src/components/bottom-nav.test.tsx, src/routes/perfil.test.tsx, src/components/registrar-fab.test.tsx, src/components/registrar-fab.tsx, src/types/lancamento.test.ts, src/types/lancamento.ts, src/lib/mock-data.ts, src/lib/datas.ts, src/state/lancamentos-context.test.tsx, src/state/lancamentos-context.tsx, src/components/ui/checkbox.tsx, src/components/lancamento-modal.test.tsx, src/components/lancamento-modal.tsx, src/components/confirmar-pagamento-dialog.tsx, src/components/lista-lancamentos.test.tsx, src/components/lista-lancamentos.tsx, src/components/data-table.tsx, src/components/parcela-card.tsx, src/components/parcela-card.test.tsx, src/lib/parcelamento.ts, src/types/caixinha.ts, src/types/caixinha.test.ts, src/state/caixinhas-context.tsx, src/state/caixinhas-context.test.tsx, src/hooks/use-saldo-acumulado.ts, src/hooks/use-saldo-acumulado.test.tsx, src/components/caixinha-card.tsx, src/components/caixinha-card.test.tsx, src/components/nova-caixinha-modal.tsx, src/components/nova-caixinha-modal.test.tsx, src/components/movimentar-caixinha-modal.tsx, src/components/movimentar-caixinha-modal.test.tsx, src/routes/caixinhas.test.tsx, src/components/saldo-card.test.tsx, src/routes/index.test.tsx, src/components/saldo-card.tsx, src/lib/perfil-mock.ts]
palavras_chave: [navegacao, bottom-nav, parcelamento, caixinhas, perfil, despesa-paga, saldo-acumulado]
---

# Orquestrador — navegacao-inferior

> Porta de entrada da execução. Escrito para quem abriu o repositório agora e não sabe nada. Só caminhos relativos; nunca o valor de um segredo.

## 1. Objetivo

Adicionar uma barra de navegação inferior fixa ao Conta Fácil com 4 abas — Início (já existente), Parcelas (compras parceladas, acompanhamento), Caixinhas (reservas com meta, criar/depositar/resgatar/excluir) e Perfil (dados mockados). Inclui marcar despesas como pagas a partir da Início, o novo card "Guardado" e o saldo acumulado descontando o total guardado em Caixinhas.

## 2. Mapa e ordem de leitura

1. Este arquivo (`ORQUESTRADOR.md`)
2. `00-DECISOES.md` — decisões que governam o plano (D-01 a D-23)
3. `base/00-INDICE.md` — e os arquivos da base que ele lista
4. `sprint-01/sprint.md` → `fases.md` → `tasks.md`
5. `sprint-02/` → `sprint-03/` → `sprint-04/` → `sprint-05/`, cada uma na mesma ordem (`sprint.md` → `fases.md` → `tasks.md`)
6. `00-BLOQUEIOS.md` — bloqueios registrados durante a execução
7. `00-AUDITORIA.md` — achados MÉDIA/BAIXA que permanecem válidos

## 3. Rota de execução

- Sprint 01: F-01.1 (única fase, sequencial: T-01.01 → T-01.02 → T-01.03)
- Sprint 02: F-02.1 (T-02.01 e T-02.02 sem dependência entre si, ambas antes de T-02.03, que depende de T-02.02) → F-02.2 (T-02.04 → T-02.05, sequencial). Nenhuma task desta sprint está marcada `paralelizavel: true` exceto T-02.01 e T-02.02 (as únicas sem `depende_de`); a ausência de aresta entre tasks que não dependem uma da outra já aparece no diagrama de `fases.md`, sem precisar do campo `paralelizavel` em cada uma.
- Sprint 03: F-03.1 (T-03.01 → T-03.02 → T-03.03, sequencial) → F-03.2 (T-03.04, T-03.05, T-03.06 — nenhuma depende das outras, só de tasks da F-03.1 já concluída; corretamente `paralelizavel: false` cada uma, por carregarem dependência, mas sem aresta entre si no diagrama)
- Sprint 04: F-04.1 (T-04.01 → T-04.02, sequencial) → F-04.2 (T-04.03, T-04.04, T-04.05, T-04.06 — todas dependem só de T-04.02, sem aresta entre si) → F-04.3 (T-04.07 depende de T-04.04/05/06; T-04.08 depende de T-04.03 — as duas sem aresta entre si)
- Sprint 05: F-05.1 (T-05.01, isolada) — pode rodar em qualquer momento após a Sprint 02 (não compartilha arquivo nem estado com Parcelas/Caixinhas); é a única task do trabalho com `paralelizavel: true` cujo paralelismo é declarado em prosa (cruza sprint, não há campo formal para isso).

**Nota sobre o campo `paralelizavel`:** ele é `true` exclusivamente quando `depende_de: []` (a task não espera nada para começar). Tasks que não dependem *entre si*, mas carregam dependência de uma fase anterior, continuam `paralelizavel: false` individualmente — o paralelismo entre elas é visível apenas pela ausência de aresta no diagrama Mermaid de cada `fases.md`, nunca pelo campo da task.

**Caminho crítico:** T-01.01 → T-01.02 → T-01.03 → T-02.02 → T-02.03 → T-02.04 → T-02.05 → T-03.01 → T-03.02 → T-03.03 → T-03.05 → T-04.01 → T-04.02 → T-04.04 → T-04.07 (15 tasks — concatenação das cadeias mais longas de cada sprint, já que as sprints 01→02→03→04 rodam em sequência; a Sprint 05 não entra porque roda em paralelo à Sprint 04 e é mais curta que ela).

## 4. Ferramentas

- **MCPs / SDKs:** nenhum necessário para a execução de código. O portão de design (Stitch) já foi cumprido **antes** desta fase, como etapa de preparação — ver observação abaixo.
- **Testes:** `npm run test -- --run` (Vitest, configurado pela sprint-01 desta própria feature — não existia antes)
- **Lint:** `npm run lint` (oxlint)
- **Typecheck/build:** `npm run build` (`tsc -b && vite build`)
- **Segredos:** nenhum — projeto 100% frontend mockado, sem variável de ambiente nem credencial.

**Observação — portão de design do projeto (`~/.claude/CLAUDE.md`):** antes de qualquer task que escreva componente visual novo (T-02.03, T-02.04, T-03.04, T-03.05, T-03.06, T-04.04, T-04.05, T-04.06, T-04.07, T-05.01), o protótipo correspondente precisa estar aprovado no Stitch. Isso é executado uma vez, nesta preparação, cobrindo todas as telas/elementos novos da feature de uma vez, antes do início da F6 — não é responsabilidade de cada task individual re-disparar o portão.

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

- Navegar pelas 4 abas da barra inferior troca de tela, a aba ativa fica destacada, e o `RegistrarFab` continua funcionando normalmente na Início sem sobrepor a barra.
- Criar uma despesa parcelada (ex.: R$1.200 em 12x) gera 12 despesas mensais e um card correspondente em Parcelas mostrando "1/12", total, Pago/Falta e barra de progresso.
- Clicar numa despesa na Início abre o popup de confirmação; marcar como paga reflete no card de Parcelas correspondente.
- Criar uma caixinha, depositar e resgatar valor atualiza o card "Guardado" na Início e o saldo acumulado (Receita − Despesa − Guardado); excluir uma caixinha devolve o valor ao saldo.
- A tela Perfil mostra nome e e-mail fictícios, sem nenhum campo editável.
- `npm run test -- --run`, `npm run lint` e `npm run build` sem erros.

## 8. Como retomar uma sessão interrompida

1. Leia este arquivo inteiro.
2. Leia o `status` de cada task em cada `sprint-NN/tasks.md`.
3. Leia `00-BLOQUEIOS.md`.
4. Continue da primeira task `pendente` ou `em_andamento` cujas dependências (`depende_de`) estão todas `concluida`. Ignore as `bloqueada` até que o bloqueio registrado seja resolvido.
