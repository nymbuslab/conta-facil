---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: deploy-unificado
sprint_id: sprint-01
titulo: Fundacao testavel do script de deploy
status: concluido
criterio_saida: Suite verde com deploy.mjs lendo estado e classificando mudancas sem executar git ou neon reais fora do diretorio temporario
fases: [F-01.1, F-01.2]
riscos: [Spawn de git e neon no Windows pode exigir ComSpec em vez de spawn direto, registrado em base/scripts-padrao-projeto.md]
atualizado_em: 2026-10-12
---

# Sprint 01 — Fundação testável do script de deploy

## Objetivo

Entregar a capacidade de testar o `npm run deploy`: o módulo `scripts/deploy.mjs` com executores
injetáveis (padrão de `base/scripts-padrao-projeto.md`), o harness de teste com diretório temporário,
a leitura do estado de deploy e a classificação de mudanças — sem executar nenhum passo real
de deploy.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-01.1 | Fundação do módulo testável | nenhuma |
| F-01.2 | Estado e classificação | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

A suíte (`npm run test -- --run`) termina verde com `scripts/deploy.test.ts` cobrindo módulo,
estado e classificação, sem nenhum executor tocando no repositório real ou na rede.

## Riscos conhecidos

- Spawn de `git` e `neon` no Windows pode exigir `ComSpec` em vez de spawn direto do binário
  (`base/scripts-padrao-projeto.md`, "Riscos para a nossa implementação").
