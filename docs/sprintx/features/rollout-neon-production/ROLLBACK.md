# Rollback — rollout-neon-production

> Procedimento de recuperação por ponto no tempo (Instant Restore) para a branch `production`
> (id `br-rapid-night-b4f7w7vu`, projeto `falling-tree-35553185`), caso a migration de schema
> (T-02.01) ou o deploy da Function (T-02.02) saiam errados. Decisão D-05: sem migration reversa
> separada — o rollback é restaurar a branch a um ponto anterior.

## Quando disparar

| Sinal | Ação |
|---|---|
| `drizzle-kit migrate` (T-02.01) falha no meio, deixando schema parcial | Restaurar `production` para o ponto imediatamente anterior à migration |
| `neon deploy` (T-02.02) implanta a Function mas o `/health` não responde 200, ou o CORS não libera o domínio de produção | Reimplantar com a env corrigida primeiro (não é incidente de dado, não precisa de restore); só restaurar a branch se o deploy tiver alterado o banco além do esperado |
| O checklist do golden path (T-04.01, `CHECKLIST-GOLDEN-PATH.md`) reprova qualquer passo depois do deploy completo | Avaliar se o defeito é de dado (restaurar) ou de código/config (corrigir e reimplantar); só restaurar se dados ficaram inconsistentes |

## Procedimento — Instant Restore via MCP do Neon

> **Fonte dos nomes de tool abaixo:** schema ao vivo das tools `mcp__Neon__create_snapshot`,
> `mcp__Neon__restore_snapshot`, `mcp__Neon__list_snapshots`, `mcp__Neon__finalize_branch_restore`
> e `mcp__Neon__deploy_function`, confirmado nesta sessão via `ToolSearch` sobre o servidor MCP do
> Neon — **não** das skills locais em `.claude/skills/neon*`, que descrevem o mecanismo de Instant
> Restore em prosa genérica (`neon-postgres/SKILL.md`), sem nomear essas tools. A decisão de usar
> Instant Restore sem migration reversa é D-05; os nomes de tool específicos abaixo dependem da
> versão do servidor MCP instalado e podem mudar — revalide com um `ToolSearch` novo antes de usar
> este runbook se a versão do MCP tiver sido atualizada desde 2026-10-11.

1. **Antes de qualquer ação em `production`** (T-02.01), criar um snapshot do estado atual:
   `create_snapshot` com `branch_id: br-rapid-night-b4f7w7vu`, `name` descrevendo o momento
   (ex.: `pre-migration-rollout`). Isso garante um ponto de retorno nomeado, além da janela de
   histórico padrão da branch.
2. Se for preciso reverter, usar `restore_snapshot` com o `snapshot_id` do passo 1 (ou, para
   recuperação por ponto no tempo sem snapshot explícito, consultar `list_snapshots` e escolher
   o mais próximo do momento anterior ao problema):
   - Passar `target_branch_id: br-rapid-night-b4f7w7vu` para restaurar diretamente sobre a
     branch `production` existente, ou omitir para restaurar numa branch nova e comparar antes
     de promover.
   - `finalize: true` (padrão ao restaurar como branch nova) reatribui os computes e troca os
     nomes imediatamente — único jeito de `production` voltar a servir tráfego real com os dados
     restaurados.
3. Depois do restore, repetir `get_database_tables` e `describe_table_schema` para confirmar que
   o schema voltou ao estado esperado, e rodar de novo o checklist do golden path antes de
   reabrir o tráfego.
4. Se o rollback for do deploy da Function (não do banco), basta reimplantar a versão anterior
   via `deploy_function` ou `neon deploy` com a configuração corrigida — não precisa de restore
   de branch, porque a Function não guarda estado.

## Limite conhecido

A janela de histórico do Instant Restore depende do plano Neon do projeto —
`base/deploy-e-promocao-neon.md` registra isso como NÃO DOCUMENTADO para este projeto
especificamente. O snapshot nomeado do passo 1 existe justamente para não depender só dessa
janela.
