# Progresso do Projeto

> Detalhes de implementação ficam em CLAUDE.md. Aqui entram apenas etapas.

## 🔄 Em Andamento

_(nada no momento)_

## 📋 Próximos Passos

- [ ] (P1) Commitar `.gitignore`, `package.json`/`package-lock.json`, `CLAUDE.md`, `neon.ts`,
  `.claude/` e `skills-lock.json` (hoje modificados/não versionados no working tree)
- [ ] (P0) Planejar e aprovar o rollout da integração Neon em `production`, com migration,
  Function, Auth, variáveis do frontend, validação pós-deploy e rollback; até aqui a implantação
  foi feita somente na branch `test`
- [ ] (P1) Validar visualmente o golden path autenticado em desktop e mobile quando a extensão do
  Chrome deixar de bloquear a automação; login e testes automatizados foram validados nesta entrega
- [ ] (P1) Revisar os alertas do `npm audit` e atualizar dependências sem quebra antes do rollout
- [ ] (P1) Idempotência de escrita financeira: `POST /lancamentos` e `/caixinhas/:id/depositar|resgatar`
  não têm chave de idempotência — uma resposta perdida e repetida pelo cliente pode duplicar
  lançamento ou aplicar o depósito/resgate duas vezes (achado do cross-review de 2026-10-10,
  não corrigido por exigir migration de schema)
- [ ] (P2) `auth-context`/`auth-middleware` tratam qualquer falha de verificação do JWT (token
  inválido, JWKS fora do ar, rede) como "não autenticado", sem um estado de erro de sessão
  distinto com nova tentativa — achado do cross-review de 2026-10-10, não corrigido por exigir
  um novo estado no `status` de `useAuth` e nas telas que o consomem

## ✅ Concluído

- [x] Navegação inferior (Início, Parcelas, Caixinhas, Perfil), parcelamento de despesas e
  Caixinhas com meta descontando do saldo acumulado — 2026-10-08
- [x] Integração Neon concluída: Auth real, Function autenticada, Postgres para lançamentos e
  caixinhas, isolamento por usuário e estados remotos nas telas — 2026-10-10 (build e testes OK;
  Function validada na branch `test`; fluxo autenticado não validado visualmente por bloqueio da
  extensão do Chrome)
- [x] Cross-review (Codex) da integração Neon — 5 rodadas até convergir: corrigidos riscos
  críticos (branch de teste sem trava antes do reset destrutivo, scripts de integração sem
  checar `NEON_BRANCH`, vazamento de dados entre contas por resposta tardia), altos (401
  mascarando erro de rota, CORS sem allowlist, mutação sem tratamento de erro fechando
  modal como se tivesse dado certo, resgate ambíguo) e médios (parcelas, UUID/JSON, migration
  pooled) — 2026-10-10 (build, lint e 86 testes OK)
