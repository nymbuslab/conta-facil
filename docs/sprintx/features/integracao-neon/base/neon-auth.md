# Neon Auth (Managed Better Auth)

## Contrato de entrada

- Ativação: `auth: true` dentro de `defineConfig` em `neon.ts` — já presente no projeto
  (`neon.ts:4`). Aplicado com `neon deploy` (alias de `neon config apply`).
- Cliente: pacote `@neondatabase/auth` (auth isolado) ou `@neondatabase/neon-js/auth` (SDK
  combinado) — NÃO DOCUMENTADO se algum dos dois já está instalado no projeto; `package.json`
  hoje não lista nenhum dos dois (`package.json:14-32`), só `@neon/config` e `@neon/env`.
  — Fonte: `.claude/skills/neon-auth/SKILL.md:27-28,55`.
- Métodos de login seguem o conjunto do Better Auth: `signIn.email`, `signUp.email`,
  `signIn.social` (Google/GitHub/Vercel), `emailOtp.sendVerificationOtp` + `signIn.emailOtp`,
  `signIn.magicLink` (desligado por padrão, precisa ser ativado na branch).
  — Fonte: `.claude/skills/neon-auth/SKILL.md:107-123`.
- Pré-requisito: projeto em região AWS, sem IP Allow nem Private Networking habilitados — Auth
  gerenciado não pode ser ativado nessas condições.
  — Fonte: `.claude/skills/neon-auth/SKILL.md:46,60`.

## Contrato de saída

- Usuários e sessões vivem no schema `neon_auth` do próprio Postgres da branch, consultável via
  SQL e compatível com RLS.
- Variáveis já injetadas no `.env.local` do projeto (confirmadas pelos nomes, sem ler valor):
  `NEON_AUTH_BASE_URL`, `NEON_AUTH_JWKS_URL` — `CLAUDE.md` (local) tabela de env vars.
- Token JWT: EdDSA (Ed25519), expira em 15 minutos, sem claims customizadas. Acesso via
  `.token()` → `data.token` no cliente padrão.
  — Fonte: `.claude/skills/neon-auth/SKILL.md:121,153`.

## Limites e cotas

- Plugins fixos do cliente Managed: não aceita a opção `plugins`. MFA/2FA, Passkey, API Key,
  Generic OAuth, SSO/SAML e Multi Session **não são expostos** pelo SDK/UI gerenciado — exigem
  self-managed Better Auth se forem necessários.
  — Fonte: `.claude/skills/neon-auth/SKILL.md:56,107-127`.
- Organização (times/convites) está em Partial/Beta — sem roles customizadas.
- Emails de autenticação usam SMTP compartilhado (`auth@mail.myneon.app`) para começar; produção
  exige SMTP próprio.
  — Fonte: `.claude/skills/neon-auth/SKILL.md:53`.

## Erros conhecidos e tratamento

- `invalid domain`: origem do app ausente na allowlist de redirecionamento. Resolver com
  `neon neon-auth domain add <url>` (sem protocolo trailing slash).
  — Fonte: `.claude/skills/neon-auth/SKILL.md:134-143`.
- Um token válido não é permissão para ler linhas de outro usuário — autorização ainda precisa
  ser verificada em cada camada que consulta dados (RLS ou checagem equivalente).
  — Fonte: `.claude/skills/neon-auth/SKILL.md:153`.

## Riscos para a nossa implementação

- O app hoje é 100% SPA sem nenhuma camada de servidor própria (Vite + React Router client-side,
  sem Neon Functions, sem rota de API). A skill `neon-auth` não aponta nenhum bloqueio para
  autenticar direto do browser via `@neondatabase/auth` — isso é compatível com o cenário atual.
  O ponto de atenção real está em como os DADOS (lançamentos/caixinhas) serão lidos depois do
  login: ver `neon-data-api-e-postgres.md`, que é onde a arquitetura declarada no `CLAUDE.md`
  local diverge da recomendação oficial.
- `perfilMock` (`src/lib/perfil-mock.ts`) hoje é o único "usuário" do app — qualquer decisão de
  login precisa decidir o que acontece com nome/e-mail reais vindos da sessão Better Auth no
  lugar desse mock.

## Fonte

`.claude/skills/neon-auth/SKILL.md` (local ao projeto) — acessado em 2026-10-10.
`CLAUDE.md` (raiz do projeto) — acessado em 2026-10-10.
