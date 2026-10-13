# Auditoria — deploy-unificado

Data: 2026-10-12 (rodada 4)

## ALTA da rodada anterior

| achado anterior | tratado em | como |
|---|---|---|
| Rodada 1 — Semântica da detecção (D-05) sem ramo pinado (cold-start sem fail-closed, ramos "nada mudou/nada a pushar" sem teste) e caminhos vigiados sem `src/db` | D-10, D-11, D-12 + T-01.03, T-02.01, T-02.02 | Estado ausente virou D-10 e está pinado em T-02.01/T-02.02; F−C− virou D-11 (exit 0); `src/db/**` entrou nos caminhos vigiados (D-12) e está pinado em T-01.03 |
| Rodada 2 — Matriz `functionMudou × commitsAPushar` pinada em só 2 de 4 células; D-08/D-11 sem definir se o health check roda sem deploy da Function | D-13, D-14, D-15 + T-02.01, T-02.06 | T-02.01 pina as 4 células com executores falsos; D-14 fixa F−C+; D-15 restringe o health check aos ramos com deploy |

## Achados

| severidade | arquivo | problema | correção sugerida |
|---|---|---|---|
| MÉDIA | sprint-02/sprint.md (Objetivo); sprint-02/fases.md (F-02.1 Objetivo) | Prosa da sequência ainda punha o push antes do health check, contradizendo D-17, T-02.05/T-02.06, o grafo de F-02.2 e o ORQUESTRADOR | Atualizar as duas frases para "deploy → health check → push" (aplicado) |
| BAIXA | sprint-02/tasks.md (T-02.07) | Teste misturava árvore suja e `--sim` sem pinar que o `--sim` roda em árvore limpa nem a ordem impressa | Explicitar `--sim` em árvore limpa pós-`finally` e asserir a sequência impressa (aplicado) |
| BAIXA | sprint-01/tasks.md (T-01.01) | `origem: [capacidade-teste]` não correspondia a decisão nem ao índice | Apontar para `base:scripts-padrao-projeto` (aplicado) |
| BAIXA | 00-AUDITORIA.md | Rodada 3 (SIM + MÉDIAs) não registrada; cabeçalho preso na rodada 2 | Registrar a rodada 3 e avançar o cabeçalho (aplicado) |

VEREDITO: SIM — o plano está pronto para execução autônoma.

## Histórico

### Rodada 1 (2026-10-12)

| severidade | arquivo | problema |
|---|---|---|
| ALTA | sprint-02/tasks.md (T-02.01, T-02.02); sprint-01/tasks.md (T-01.02) | Semântica da detecção (D-05) sem ramo pinado; caminhos vigiados sem `src/db` |
| MÉDIA | sprint-02/tasks.md (T-02.03) | D-02 exige confirmação mostrando o que mudou, sem asserção da exibição |
| MÉDIA | base/00-INDICE.md | Índice ↔ diretório: arquivos órfãos fora da rota de leitura |
| MÉDIA | sprint-01/tasks.md (T-01.03) | Teste fraco: `treeSuja`/`branchErrada`/`commitsAPushar` sem positivo |
| BAIXA | sprint-02/tasks.md (T-02.04) | Invocação real do `neon` via ComSpec não exercitada |
| BAIXA | sprint-02/tasks.md (T-02.07) | Tree suja não determinística; DEPLOY.md sem asserção de conteúdo; `--sim` não coberto |
| BAIXA | sprint-02/tasks.md (T-02.01) | Abort em `branchErrada`/`.neon`≠production sem teste de fluxo |
| BAIXA | sprint-02/tasks.md (T-02.07, DEPLOY.md) | Checklist sem conferir/repor `FUNCTION_ALLOWED_ORIGINS` pós-deploy |

VEREDITO rodada 1: NÃO.

### Rodada 2 (2026-10-12)

| severidade | arquivo | problema |
|---|---|---|
| ALTA | sprint-02/tasks.md (T-02.01); fases.md (F-02.1); 00-DECISOES.md | Matriz `functionMudou × commitsAPushar` pinada em só 2 de 4 células; health check sem deploy não definido |
| MÉDIA | sprint-02/tasks.md (T-02.03) | Negativo da confirmação não asseverado por ordem de chamadas |
| MÉDIA | sprint-02/tasks.md (T-02.04) | Expoente vazio/whitespace de `FUNCTION_ALLOWED_ORIGINS` sem teste |
| MÉDIA | sprint-02/tasks.md (T-02.07); 00-DECISOES.md (D-03/D-07) | DEPLOY.md sem seção de migration em production |
| BAIXA | sprint-01/sprint.md; sprint-02/sprint.md | Referências quebradas (`base/scripts-e-testes.md`, `base/cli-neon-deploy.md`) |
| BAIXA | sprint-02/tasks.md (T-02.04); ORQUESTRADOR.md | Forma de invocação do CLI (`neon` vs `npx neon`) não fixada |
| BAIXA | sprint-02/tasks.md (T-02.07) | Temporário de teste não declarado nem limpo em `finally` |

VEREDITO rodada 2: NÃO.

### Rodada 3 (2026-10-12)

| severidade | arquivo | problema |
|---|---|---|
| MÉDIA | sprint-02/tasks.md (T-02.06, T-02.05); ORQUESTRADOR.md | Health check depois do push, contra a base ("toda checagem antes do push") |
| MÉDIA | sprint-01/tasks.md (T-01.02) | `.gitignore` alterado sem teste da entrada |
| MÉDIA | sprint-02/tasks.md (T-02.01) | Dry-run com executores reais não prova a não-invocação |
| MÉDIA | sprint-02/tasks.md (T-02.07) | Teste no repositório real não discrimina o motivo do abort |
| MÉDIA | sprint-02/tasks.md (T-02.05); 00-DECISOES.md (D-11) | Lacuna do Pages mal mapeada; mensagem pós-push sem pino |
| BAIXA | sprint-02/tasks.md (T-02.07) | Texto das mensagens de abort/nada-a-fazer não asseverado |

VEREDITO rodada 3: SIM (MÉDIAs/BAIXAs registradas, corrigidas antes da execução).

### Rodada 4 (2026-10-12)

Veredito SIM. Achados apenas documentais (MÉDIA da prosa da sequência + 3 BAIXAS de rótulo/registro), todos aplicados. Nenhum ALTA novo.
