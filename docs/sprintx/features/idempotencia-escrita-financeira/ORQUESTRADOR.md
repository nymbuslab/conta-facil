---
expx_schema: 1
expx_tool: sprintx
kind: orquestrador
trabalho_id: idempotencia-escrita-financeira
titulo: Idempotencia de escrita financeira
tipo_trabalho: feature
tipo_ocorrencia: null
estagio: f6
status: concluido
criado_em: 2026-10-11
atualizado_em: 2026-10-12
concluido_em: 2026-10-12
sprints: [sprint-01, sprint-02]
caminho_critico: [T-01.01, T-02.01, T-02.02, T-02.03, T-02.04, T-02.05, T-02.06, T-02.07]
modulo_afetado: [test, db, functions, lib, state, raiz]
arquivos_alterados: []
palavras_chave: [idempotencia, lancamentos, caixinhas, postgres, transacao, retry, migration]
---

# Orquestrador - idempotencia-escrita-financeira

## 1. Objetivo

Impedir que resposta perdida ou repetição concorrente duplique lançamentos, depósitos ou resgates.
A chave fica isolada por usuário, a mutação ocorre em transação curta e o cliente repete somente falhas transitórias.
Esta entrega valida tudo na branch Neon de teste e não altera produção.

## 2. Mapa e ordem de leitura

1. `ORQUESTRADOR.md`
2. `00-DECISOES.md`
3. `base/00-INDICE.md` e os cinco arquivos listados
4. `sprint-01/sprint.md`, `fases.md`, `tasks.md`
5. `sprint-02/sprint.md`, `fases.md`, `tasks.md`
6. `00-BLOQUEIOS.md`
7. `00-AUDITORIA.md`

## 3. Rota de execução

- Sprint 01: F-01.1
- Sprint 02: F-02.1 -> F-02.2 -> F-02.3
- Não há fases ou tasks paralelas declaradas.

**Caminho crítico:** T-01.01 -> T-02.01 -> T-02.02 -> T-02.03 -> T-02.04 -> T-02.05 -> T-02.06 -> T-02.07

## 4. Ferramentas

- **Documentação:** PostgreSQL oficial, Drizzle transactions e skill `supabase-postgres-best-practices`
- **Testes:** `npm run test -- --run`
- **Lint:** `npm run lint`
- **Typecheck/build:** `npm run build`
- **Integração:** `npm run test:integration:schema`, `npm run test:integration:idempotencia`, `npm run test:integration:lancamentos`, `npm run test:integration:caixinhas`
- **Migrations:** `npm run db:generate` e `npm run test:migrate`; o segundo carrega `.env.test.local` e chama `garantirBranchDeTeste()` antes do DDL
- **Segredos:** `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `NEON_BRANCH`, `NEON_AUTH_BASE_URL` e `NEON_FUNCTION_API_BASE_URL` ficam em `.env.test.local`; nunca registrar valores

## 5. Agentes

- **Implementador:** escreve primeiro os testes da task, confirma a falha e implementa até passarem.
- **Revisor de testes:** verifica se o teste falharia com duplicidade ou concorrência incorreta.
- **Auditor de aceite:** confere o critério binário antes de concluir a task.

Com um único agente, os três papéis são assumidos nessa ordem dentro de cada task.

## 6. Regras de autonomia

1. Não perguntar nem pedir nova autorização durante a execução.
2. Escrever e executar o teste antes da implementação.
3. Concluir task somente com testes funcional e de integração verdes e aceite verificado.
4. Registrar dúvida nova em `00-BLOQUEIOS.md`, bloquear a task e seguir apenas se houver task paralelizável.
5. Nunca rodar migration fora de branch `test` ou `test-*` nesta entrega.
6. Não registrar payload, descrição ou valor financeiro em logs.
7. Atualizar o status em `tasks.md` a cada transição e não avançar com aceite vermelho.

## 7. Definição de pronto global

- A migration cria a tabela e a unicidade por usuário na branch Neon de teste.
- Mesma chave e mesmo pedido devolvem a resposta original sem repetir a mutação.
- Mesma chave com operação ou payload diferente retorna 409.
- Requisições concorrentes produzem um único efeito financeiro.
- O cliente repete uma vez apenas falha de rede ou 502, 503 e 504 usando a mesma chave.
- Testes unitários, integração, lint e build passam; produção permanece inalterada.

## 8. Como retomar uma sessão interrompida

1. Leia este arquivo inteiro.
2. Leia o `status` de cada task em cada `sprint-NN/tasks.md`.
3. Leia `00-BLOQUEIOS.md`.
4. Continue da primeira task `pendente` ou `em_andamento` cujas dependências estejam `concluida`.
