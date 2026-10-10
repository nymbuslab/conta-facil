---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: integracao-neon
sprint_id: sprint-02
titulo: Neon Auth
status: concluido
criterio_saida: Login e cadastro reais funcionam contra a branch de teste e nenhuma tela importa src/lib/perfil-mock.ts
fases: [F-02.1]
riscos: [Projeto precisa estar em regiao AWS sem IP Allow nem Private Networking para Managed Auth funcionar]
atualizado_em: 2026-10-10
---

# Sprint 02 — Neon Auth

## Objetivo

Substituir o perfil mockado "Alex Pereira" por login e cadastro reais via Neon Managed Auth
(`@neondatabase/auth`), com rotas protegidas por sessão.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-02.1 | Autenticacao real | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

Login com credenciais válidas e cadastro com e-mail novo autenticam a sessão contra a branch de
teste, e nenhum arquivo do projeto importa `src/lib/perfil-mock.ts`.

## Riscos conhecidos

- Managed Auth não pode ser ativado em projeto com IP Allow ou Private Networking —
  `.claude/skills/neon-auth/SKILL.md:46,60`. Confirmar antes de T-02.01.
- Verificação de e-mail e magic link dependem de SMTP compartilhado em ambiente de
  desenvolvimento; produção exige SMTP próprio (fora do escopo desta sprint).
