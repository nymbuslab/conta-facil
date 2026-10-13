---
expx_schema: 1
expx_tool: sprintx
kind: decisoes
trabalho_id: deploy-unificado
atualizado_em: 2026-10-12
decisoes:
  - id: D-01
    decisao: Comando unico `npm run deploy` orquestra o deploy inteiro na ordem Function-antes-frontend
    alternativa_descartada: Manter os dois passos manuais separados
    motivo: Esquecer o neon deploy nao da erro visivel - foi o incidente real da inversao do parcelamento
    status: fechada
    bloqueante: false
  - id: D-02
    decisao: neon deploy executado pelo script com confirmacao interativa mostrando o que mudou
    alternativa_descartada: Script apenas avisa que o deploy da Function e necessario e para
    motivo: Aviso ainda depende de memoria humana; confirmacao mata o esquecer sem perder o controle do passo sensivel
    status: fechada
    bloqueante: false
  - id: D-03
    decisao: Migration nova detectada aborta o fluxo ate confirmacao manual de que foi aplicada em production
    alternativa_descartada: Script aplica a migration via db:migrate automaticamente
    motivo: SQL em production e acao autorizada explicitamente a parte (P1 do PROGRESSO.md); o script nunca aplica
    status: fechada
    bloqueante: false
  - id: D-04
    decisao: Push do frontend executado pelo script somente depois da Function confirmada
    alternativa_descartada: Push continua manual apos o deploy da Function
    motivo: O push e irreversivel (Pages builda sozinho); toda checagem precisa acontecer antes dele
    status: fechada
    bloqueante: false
  - id: D-05
    decisao: Deteccao de mudanca via git diff entre o SHA do ultimo deploy e o HEAD em caminhos vigiados
    alternativa_descartada: Perguntar ao usuario se mudou algo na Function
    motivo: Deteccao automatica e o valor central do comando; o SHA vive em arquivo gitignorado novo
    status: fechada
    bloqueante: false
  - id: D-06
    decisao: Modo --sim dry-run que mostra o que faria sem executar nada
    alternativa_descartada: Sem flag de simulacao
    motivo: Ver o plano de deploy sem tocar em production, escolhido na entrevista
    status: fechada
    bloqueante: false
  - id: D-07
    decisao: DEPLOY.md na raiz com o checklist do que fica fora do script, incluindo o passo de migration em production
    alternativa_descartada: Somente o script, sem documento
    motivo: Passos de console externo (env vars do Pages, dominio confiavel do Auth, migration) nao sao automatizaveis e o gate de migration aborta o operador que precisa do como documentado, escolhido na entrevista
    status: fechada
    bloqueante: false
  - id: D-08
    decisao: Pos-deploy faz health check da Function com espera fixa e retry
    alternativa_descartada: Nenhuma verificacao pos-deploy
    motivo: Sem API de versao da Function, provar que responde e o melhor custo-beneficio; limitacao registrada na base (lacuna)
    status: fechada
    bloqueante: false
  - id: D-09
    decisao: Checagens fail-closed antes de qualquer acao - branch master, tree limpa, .neon apontando production, FUNCTION_ALLOWED_ORIGINS no env
    alternativa_descartada: Checagens apenas avisando e seguindo
    motivo: Deploy contra branch errada ou env incompleto e o pior resultado possivel; abortar e a unica postura segura
    status: fechada
    bloqueante: false
  - id: D-10
    decisao: Primeira execucao com estado ausente e fail-closed - considera Function e migrations pendentes e exige o fluxo completo
    alternativa_descartada: Estado ausente considera nada pendente
    motivo: O inverso recriaria o incidente de origem (frontend novo contra Function antiga sem erro); fail-closed e o padrao da casa
    status: fechada
    bloqueante: false
  - id: D-11
    decisao: Sem mudanca de Function e sem commits a pushar o comando informa nada a fazer e termina exit 0
    alternativa_descartada: Rodar health check mesmo sem acao
    motivo: Sem acao nao ha o que validar; health check e pos-deploy
    status: fechada
    bloqueante: false
  - id: D-12
    decisao: Caminhos vigiados incluem src/functions/api, neon.ts, drizzle e src/db - schema da Function conta como mudanca dela
    alternativa_descartada: Vigiar apenas src/functions/api e neon.ts
    motivo: Mudanca de schema sem migration nova tambem altera o comportamento da Function; achado ALTA da auditoria rodada 1
    status: fechada
    bloqueante: false
  - id: D-13
    decisao: Function mudou sem commits a pushar - deploya a Function, pula o push com aviso e segue ao health check
    alternativa_descartada: Abortar por nao haver push a fazer
    motivo: O deploy da Function e independente do push; push vazio nao e erro
    status: fechada
    bloqueante: false
  - id: D-14
    decisao: Ramo Function sem mudanca com commits a pushar - so push, sem deploy da Function e sem health check
    alternativa_descartada: Tratar como nada a fazer ou como fluxo completo
    motivo: Caso mais comum (deploy so de frontend); deploy da Function sem mudanca nao faz sentido; achado ALTA da auditoria rodada 2
    status: fechada
    bloqueante: false
  - id: D-15
    decisao: Health check roda somente quando a Function foi deployada; ramos sem deploy da Function nao rodam health check
    alternativa_descartada: Rodar health check em todos os ramos
    motivo: O health check valida a instancia nova da Function; sem deploy nao ha o que validar; fecha a ambiguidade D-08/D-11 (auditoria rodada 2, ALTA)
    status: fechada
    bloqueante: false
  - id: D-16
    decisao: Invocar o CLI Neon via `npx neon` (nao binario global), consistente com o rollout real
    alternativa_descartada: Assumir `neon` no PATH global
    motivo: O rollout real usou `npx neon`; evita bloqueio se o CLI nao estiver global (auditoria rodada 2, BAIXA)
    status: fechada
    bloqueante: false
  - id: D-17
    decisao: Health check roda entre o deploy da Function e o push - toda checagem acontece antes do passo irreversivel
    alternativa_descartada: Health check depois do push
    motivo: A base exige que toda checagem preceda o push irreversivel; Function que sobe quebrada deve abortar antes do frontend (auditoria rodada 3, MEDIA)
    status: fechada
    bloqueante: false
  - id: D-18
    decisao: Apos o push o comando informa que o build do Pages foi disparado e onde conferir
    alternativa_descartada: Encerrar sem mensagem pos-push
    motivo: A verificacao pos-push do Pages nao e observavel pelo script; a mensagem aponta onde conferir (lacuna da base, auditoria rodada 3, MEDIA)
    status: fechada
    bloqueante: false
---

# Decisões — deploy-unificado

| ID | Decisão | Alternativa descartada | Motivo |
|---|---|---|---|
| D-01 | Comando único `npm run deploy` orquestra o deploy inteiro na ordem Function-antes-frontend | Manter os dois passos manuais separados | Esquecer o `neon deploy` não dá erro visível — incidente real da inversão do parcelamento |
| D-02 | `neon deploy` executado pelo script com confirmação interativa mostrando o que mudou | Script apenas avisa e para | Aviso ainda depende de memória; confirmação mata o esquecer sem perder controle do passo sensível |
| D-03 | Migration nova detectada aborta o fluxo até confirmação manual de aplicada em `production` | Script aplica via `db:migrate` sozinho | SQL em `production` é ação autorizada à parte (P1); o script nunca aplica |
| D-04 | Push do frontend executado pelo script somente depois da Function confirmada | Push continua manual | O push é irreversível (Pages builda sozinho); toda checagem antes dele |
| D-05 | Detecção de mudança via `git diff` entre SHA do último deploy e HEAD, em caminhos vigiados | Perguntar ao usuário se mudou algo | Detecção automática é o valor central; SHA em arquivo gitignorado novo |
| D-06 | Modo `--sim` dry-run mostra o que faria sem executar | Sem flag | Escolhido na entrevista |
| D-07 | `DEPLOY.md` na raiz com checklist do que fica fora do script | Só o script | Passos de console externo não são automatizáveis; escolhido na entrevista |
| D-08 | Pós-deploy faz health check da Function com espera fixa e retry | Nenhuma verificação | Sem API de versão, "responde" é o melhor custo-benefício; limitação registrada na base |
| D-09 | Checagens fail-closed antes de qualquer ação (branch, tree, link, env) | Checagens só avisando | Deploy contra branch errada ou env incompleto é o pior resultado; abortar é a postura segura |
| D-10 | Primeira execução com estado ausente é fail-closed: considera Function e migrations pendentes e exige o fluxo completo | Estado ausente considera nada pendente | O inverso recriaria o incidente de origem; fail-closed é o padrão da casa (auditoria rodada 1, ALTA) |
| D-11 | Sem mudança de Function e sem commits a pushar, informa "nada a fazer" e termina exit 0 | Rodar health check mesmo sem ação | Sem ação não há o que validar; health check é pós-deploy |
| D-12 | Caminhos vigiados: `src/functions/api/**`, `neon.ts`, `drizzle/**` e `src/db/**` | Vigiar só `src/functions/api` e `neon.ts` | Mudança de schema sem migration nova também altera a Function (auditoria rodada 1, ALTA) |
| D-13 | Function mudou sem commits a pushar: deploya a Function, pula o push com aviso | Abortar por não haver push | Deploy da Function é independente do push; push vazio não é erro |
| D-14 | Function sem mudança com commits a pushar: só push, sem deploy da Function e sem health check | Tratar como nada a fazer ou fluxo completo | Caso mais comum (só frontend); deploy sem mudança não faz sentido (auditoria rodada 2, ALTA) |
| D-15 | Health check só quando a Function foi deployada; ramos sem deploy não rodam health check | Rodar health check em todos os ramos | Health check valida a instância nova; sem deploy não há o que validar (fecha D-08/D-11) |
| D-16 | Invocar o CLI Neon via `npx neon` (não binário global) | Assumir `neon` no PATH | O rollout real usou `npx neon`; evita bloqueio se o CLI não for global (auditoria rodada 2, BAIXA) |
| D-17 | Health check entre o deploy da Function e o push — toda checagem antes do passo irreversível | Health check depois do push | A base exige checagem antes do push; Function que sobe quebrada deve abortar antes do frontend (auditoria rodada 3, MÉDIA) |
| D-18 | Após o push, informa que o build do Pages foi disparado e onde conferir | Encerrar sem mensagem pós-push | A verificação pós-push do Pages não é observável pelo script; a mensagem aponta onde conferir (auditoria rodada 3, MÉDIA) |

Nenhuma pendência bloqueante. Decisões fechadas: D-01 a D-18. A matriz `functionMudou × commitsAPushar` fica: F+C+ fluxo completo; F+C− deploya Function, pula push com aviso, health check; F−C+ só push (D-14); F−C− nada a fazer exit 0 (D-11). A verificação pós-push do Pages é coberta pela mensagem de D-18 (T-02.05). Lacunas da F1 tratadas com mitigação: verificação de instância nova (D-08, limitação documentada), leitura do `.neon` direto (D-09), pós-push do Pages informado no comando (D-11) e migrations pendentes detectadas por `git diff` (D-05).
