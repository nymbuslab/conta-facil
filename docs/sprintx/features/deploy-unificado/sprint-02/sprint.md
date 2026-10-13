---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: deploy-unificado
sprint_id: sprint-02
titulo: Orquestracao real do deploy em um comando
status: concluido
criterio_saida: npm run deploy com tree suja aborta exitCode 1 com mensagem unica e npm run deploy -- --sim imprime a sequencia sem executar acoes
fases: [F-02.1, F-02.2]
riscos: [Sem API de versao da Function o health check nao prova que a instancia nova assumiu, registrado como lacuna em base/neon-cli-deploy.md]
atualizado_em: 2026-10-12
---

# Sprint 02 — Orquestração real do deploy em um comando

## Objetivo

Executar de verdade a sequência validada na sprint-01: gates de migration e confirmação
interativa, `neon deploy --env` com validação do env, health check com retry, push com aviso do
Pages e a entrada `npm run deploy` com o `DEPLOY.md` documentando o que fica fora do script.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-02.1 | Orquestração e gates | nenhuma |
| F-02.2 | Passos reais e entrada | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

`npm run deploy` com working tree sujo termina exitCode 1 com mensagem única e
`npm run deploy -- --sim` imprime a sequência sem chamar nenhum executor de ação.

## Riscos conhecidos

- Sem API de versão da Function, o health check prova que a Function responde, não que a
  instância nova assumiu (`base/neon-cli-deploy.md`, limites; mitigação D-08).
