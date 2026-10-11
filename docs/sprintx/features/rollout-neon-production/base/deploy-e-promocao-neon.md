# Deploy e promoção de branch no Neon (CLI)

> Substitua todos os marcadores `{{...}}`. Se a fonte não afirma algo, escreva `NÃO DOCUMENTADO` — nunca invente. Todo número vem acompanhado da referência que o afirma.

## Contrato de entrada

- `neon deploy` (alias de `neon config apply`) aplica os serviços declarados em `neon.ts` na branch atualmente linkada pelo CLI — não existe, nos arquivos lidos, um parâmetro de "branch de destino" na própria chamada; é a branch linkada que decide (`.claude/skills/neon/SKILL.md:349-352`).
- `neon deploy --env <arquivo>` precisa de um arquivo já gitignorado (`.env` ou `.env.local`, o que `neon env pull` já escreve) contendo, além das vars geridas pelo Neon, cada chave usada em `functions.*.env` do `neon.ts` (aqui, `FUNCTION_ALLOWED_ORIGINS`) — (`.claude/skills/neon/SKILL.md:356-357`).
- `neon config plan` roda um dry-run só de leitura do que `apply`/`deploy` mudaria (`.claude/skills/neon/SKILL.md:348`).
- `neon status` imprime a configuração viva da branch, só leitura (`.claude/skills/neon/SKILL.md:347`).

## Contrato de saída

- Ao terminar, `neon deploy`/`apply` baixa as variáveis geridas pelo Neon da branch para `.env.local` local, mantendo o ambiente local sincronizado com o que foi implantado (`.claude/skills/neon/SKILL.md:352`).

## Limites e cotas

NÃO DOCUMENTADO — não há, nas skills locais do Neon lidas, um número de cota ou limite associado ao comando `deploy` em si.

## Erros conhecidos e tratamento

- `reset-from-parent` pode ficar indisponível por até 24h depois que o branch pai foi restaurado de um snapshot (`.claude/skills/neon-postgres-branches/SKILL.md:154`).
- `reset-from-parent` sempre usa o estado atual do pai; para recuperação por ponto no tempo, a skill indica usar "Instant Restore" em vez disso (`.claude/skills/neon-postgres-branches/SKILL.md:155`).
- `--preserve-under-name` em um reset mantém o estado anterior como uma branch de backup para rollback, ao custo de uma branch extra para limpar depois (`.claude/skills/neon-postgres-branches/SKILL.md:169`).

## Estado real confirmado no projeto Neon (consulta direta, 2026-10-10)

Consulta ao projeto `falling-tree-35553185` via MCP do Neon:

- A branch `production` (id `br-rapid-night-b4f7w7vu`) já existe, e é a branch `primary: true` e `default: true` do projeto (`list_branches` / `get_default_branch`).
- A branch `test` (id `br-still-glitter-b4wkvc89`) é filha de `production` (`parent_id: br-rapid-night-b4f7w7vu`), criada em 2026-10-10 a partir do estado da `production` naquele momento.
- `production` já tem Neon Managed Auth provisionado (`get_auth`: `auth_provider: better_auth`, schema `neon_auth` com as 9 tabelas padrão — `account`, `session`, `user`, `jwks`, etc.) e Object Storage habilitado (`get_storage`: `enabled: true`).
- `production` **não tem** nenhuma tabela de negócio (`lancamentos`, `caixinhas`) — `get_database_tables` só retorna as tabelas de `neon_auth`. A migration `drizzle/0000_init.sql` ainda não foi aplicada nela.
- `production` **não tem nenhuma Function implantada** (`list_functions` retorna `[]`) — a Function `api` existe hoje só na branch `test`.

Isso elimina a lacuna "existe branch production?" e muda o escopo real do rollout: não é criar a branch, é completar nela o que falta — schema de negócio e a Function.

## Riscos para a nossa implementação

- "Instant Restore"/snapshot é o mecanismo de rollback no nível do banco citado pelas skills (`.claude/skills/neon-postgres/SKILL.md:203-213`), mas a janela de histórico depende do plano Neon do projeto — NÃO DOCUMENTADO qual plano este projeto usa.
- Promover a Function e o Auth junto com o schema numa única branch de produção é o desenho que `neon.ts` já assume (não há configuração separada por ambiente dentro do arquivo); qualquer diferença de comportamento entre `test` e `production` (ex.: origens de CORS) precisa ser parametrizada por env, não por código.
- Como `production` é a branch `default`, qualquer comando do Neon CLI/MCP que resolve "branch padrão" sem `--branch` explícito cai nela — risco de rodar comando destinado à `test` contra `production` por omissão do parâmetro.

## Fonte

- `.claude/skills/neon/SKILL.md` (linhas 347-357) — acessado em 2026-10-10
- `.claude/skills/neon-postgres-branches/SKILL.md` (linhas 154-169, 180) — acessado em 2026-10-10
- `.claude/skills/neon-postgres/SKILL.md` (linhas 203-213, 278) — acessado em 2026-10-10
- MCP Neon `list_branches`, `get_default_branch`, `get_database_tables`, `get_auth`, `get_storage`, `list_functions` sobre o projeto `falling-tree-35553185` — acessado em 2026-10-10
