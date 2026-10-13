---
expx_schema: 1
expx_tool: sprintx
kind: orquestrador
trabalho_id: seguranca-dependencias
titulo: Seguranca de dependencias
tipo_trabalho: feature
tipo_ocorrencia: null
estagio: f6
status: concluido
criado_em: 2026-10-11
atualizado_em: 2026-10-12
concluido_em: 2026-10-12
sprints: [sprint-01, sprint-02, sprint-03]
caminho_critico: [F-01.1, F-02.1, F-02.2, F-03.1]
modulo_afetado: [scripts, test, raiz, docs]
arquivos_alterados: []
palavras_chave: [npm-audit, tailwind, vite, esbuild, drizzle-kit, seguranca]
---

# Orquestrador - seguranca-dependencias

## 1. Objetivo

Eliminar vulnerabilidades altas e críticas da árvore npm sem usar correções forçadas.
Migrar o Tailwind para v4 preservando o design atual e comprovar build, testes e interface.
Alertas moderados sem correção compatível ficam explicitamente documentados.

## 2. Mapa e ordem de leitura

1. `ORQUESTRADOR.md`
2. `00-DECISOES.md`
3. `base/00-INDICE.md` e os três arquivos listados
4. `sprint-01/sprint.md`, `fases.md`, `tasks.md`
5. `sprint-02/sprint.md`, `fases.md`, `tasks.md`
6. `sprint-03/sprint.md`, `fases.md`, `tasks.md`
7. `00-BLOQUEIOS.md`
8. `00-AUDITORIA.md`

## 3. Rota de execução

- Sprint 01: F-01.1
- Sprint 02: F-02.1 seguida de F-02.2
- Sprint 03: F-03.1, aberta pela primeira rodada de convergência
- Não há fases paralelas; T-01.01 e T-01.02 podem rodar em paralelo dentro da primeira fase.

**Caminho crítico:** F-01.1 -> F-02.1 -> F-02.2 -> F-03.1

## 4. Ferramentas

- **Documentação:** guia oficial do Tailwind 4, registro npm e skill `tailwind-v4-shadcn`
- **Testes:** `npm run test -- --run`
- **Lint:** `npm run lint`
- **Typecheck/build:** `npm run build`
- **Auditoria:** `npm run audit:security`
- **Rede:** acesso ao registro npm e obrigatorio; falha de rede no audit falha fechado
- **Segredos:** nenhuma credencial nova; variáveis existentes permanecem nos arquivos `.env.*.local` ignorados

## 5. Agentes

- **Implementador:** escreve primeiro os testes da task, confirma a falha e implementa até passarem.
- **Revisor de testes:** verifica se o teste falharia com a implementação errada.
- **Auditor de aceite:** confere o critério binário antes de concluir a task.

Com um único agente, os três papéis são assumidos nessa ordem dentro de cada task.

## 6. Regras de autonomia

1. Não perguntar nem pedir nova autorização durante a execução.
2. Escrever e executar o teste antes da implementação.
3. Concluir task somente com testes funcional e de integração verdes e aceite verificado.
4. Registrar dúvida nova em `00-BLOQUEIOS.md`, bloquear a task e seguir apenas se houver task paralelizável.
5. Não usar `npm audit fix --force` nem downgrade incompatível.
6. Atualizar o status em `tasks.md` a cada transição.
7. Não avançar se o critério de saída falhar.

## 7. Definição de pronto global

- `npm run audit:security` não encontra vulnerabilidade alta ou crítica.
- Qualquer alerta moderado residual tem origem, impacto e justificativa documentados.
- `npm run lint`, `npm run test` e `npm run build` passam.
- Login, início, caixinhas e parcelamentos preservam aparência e uso em desktop e mobile.
- Nenhum `--force`, override transitivo ou downgrade do Drizzle Kit foi aplicado.
- `VALIDACAO-VISUAL.md` registra 16 pares persistentes com rotas, diálogos, foco, teclado e overflow em dois viewports.

## 8. Como retomar uma sessão interrompida

1. Leia este arquivo inteiro.
2. Leia o `status` de cada task em cada `sprint-NN/tasks.md`.
3. Leia `00-BLOQUEIOS.md`.
4. Continue da primeira task `pendente` ou `em_andamento` cujas dependências estejam `concluida`.
