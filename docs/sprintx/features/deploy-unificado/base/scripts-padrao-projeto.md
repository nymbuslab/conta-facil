# Padrões de script do projeto

> Convenções que o script/checklist de deploy novo precisa seguir para nascer no padrão do repositório.

## Contrato de entrada

- Scripts de manutenção vivem em `scripts/`: shell bash com `set -euo pipefail` para operações Neon (`scripts/neon-test-reset.sh:1-3`) e Node `.mjs` para lógica testável (`scripts/auditar-dependencias.mjs`).
- Script Node com lógica pura exporta funções e tem teste Vitest ao lado (`scripts/auditar-dependencias.test.ts`) — TDD é regra do método (sprintx, regra inviolável 3).
- Padrão de testabilidade do `scripts/auditar-dependencias.mjs`: função pura exportada para avaliação (`avaliarRelatorioAudit`, linhas 4-23) + executor real injetável como parâmetro default (`executarAuditoria(executar = executarNpmAudit)`, linhas 42-54) — o teste injeta executores falsos e nunca roda o comando real — e guard de main via `process.argv[1]` comparado com `import.meta.url` (linha 56) para só executar quando chamado direto.
- npm scripts no `package.json` encapsulam as chamadas; no Windows, o bash é invocado via spawn explícito (`C:/Program Files/Git/bin/bash.exe` em `package.json:13`, `test:db:reset`; padrão win32 com `process.env.ComSpec` em `scripts/auditar-dependencias.mjs:27-32`).
- Scripts que escrevem no Postgres de teste passam obrigatoriamente por `garantirBranchDeTeste()` (`src/test/guardar-branch-teste.ts`), que recusa qualquer branch fora de `test`/`test-*` — padrão nunca configurável por env (CLAUDE.md, segurança de teste de integração).

## Contrato de saída

- `scripts/auditar-dependencias.mjs` devolve aprovação binária e falha (exit ≠ 0) com alerta alto/crítico ou erro de rede — fail-closed (`package.json:12`, `audit:security`; PROGRESSO.md, item concluído de segurança de dependências).

## Limites e cotas

NÃO DOCUMENTADO.

## Erros conhecidos e tratamento

- `scripts/neon-test-reset.sh` recusa rodar se a branch não é exatamente `test` ou `test-*`, com mensagem explícita e exit 1 (`scripts/neon-test-reset.sh:10-13`).

## Riscos para a nossa implementação

- O script de deploy é o **inverso** da guarda de teste: ele existe para escrever em `production` de propósito. A guarda equivalente aqui é confirmar a branch linkada (`production`) antes de qualquer comando — e cruzar com a identidade real da conexão é pendência aberta do projeto (PROGRESSO.md, P2 "Reforçar `garantirBranchDeTeste()` cruzando `NEON_BRANCH` com a identidade real da conexão").
- Fail-closed é o padrão da casa: verificação do fluxo que falhar deve abortar com mensagem clara, nunca seguir (padrão do `audit:security`).
- O ambiente é Windows (PowerShell 5.1) com Git Bash disponível; script que mistura bash e node usa spawn explícito, nunca assume bash no PATH.

## Fonte

`scripts/auditar-dependencias.mjs` (linhas 1–40) e `scripts/auditar-dependencias.test.ts` — acessados em 2026-10-12; `scripts/neon-test-reset.sh` (linhas 1–30) — acessado em 2026-10-12; `package.json` (scripts) — acessado em 2026-10-12; CLAUDE.md (segurança de teste de integração) — acessado em 2026-10-12; PROGRESSO.md (pendências P2) — acessado em 2026-10-12.
