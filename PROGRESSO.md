# Progresso do Projeto

> Detalhes de implementação ficam em CLAUDE.md. Aqui entram apenas etapas.

## 🔄 Em Andamento

_(nada no momento)_

## 📋 Próximos Passos

- [ ] (P1) Revisar os alertas do `npm audit` e atualizar dependências sem quebra
- [ ] (P2) Confirmar com a documentação oficial do Neon Auth (ou suporte) se `data.session.token`
  é o formato oficial do `.token()` do adapter atual, ou se há versão mais nova que devolve
  `data.token` direto — `extrairToken` (`src/state/auth-context.tsx`) hoje aceita os dois por
  segurança, mas a doc da skill (`base/neon-auth.md`) documentava só `data.token`
- [ ] (P1) Idempotência de escrita financeira: `POST /lancamentos` e `/caixinhas/:id/depositar|resgatar`
  não têm chave de idempotência — uma resposta perdida e repetida pelo cliente pode duplicar
  lançamento ou aplicar o depósito/resgate duas vezes (achado do cross-review de 2026-10-10,
  não corrigido por exigir migration de schema)
- [ ] (P2) `auth-context`/`auth-middleware` tratam qualquer falha de verificação do JWT (token
  inválido, JWKS fora do ar, rede) como "não autenticado", sem um estado de erro de sessão
  distinto com nova tentativa — achado do cross-review de 2026-10-10, não corrigido por exigir
  um novo estado no `status` de `useAuth` e nas telas que o consomem

## ✅ Concluído

- [x] Rollout para `production`: migration aplicada (`lancamentos`/`caixinhas`), Function `api`
  implantada com CORS liberado para `contafacil.nymbuslab.com.br`, frontend publicado no
  Cloudflare Pages com o domínio final no ar, e golden path real validado de ponta a ponta
  (cadastro, login, despesa, receita, caixinha, reload) — 2026-10-11 (ver `FECHAMENTO.md` de
  `rollout-neon-production`; domínio confiável do Neon Auth precisou ser registrado manualmente,
  achado durante a validação)
- [x] Deploy contínuo do frontend: projeto Cloudflare Pages conectado ao GitHub
  (`nymbuslab/conta-facil`, branch `master`) — todo push dispara build e deploy automático, sem
  precisar de `wrangler pages deploy` manual. `NODE_VERSION=24` fixado nas env vars de build
  (produção e preview) porque o `npm 10.9.2` do ambiente padrão do Cloudflare tem um bug conhecido
  no resolvedor de dependências que travava o build (`Cannot read properties of null
  (reading 'edgesOut')`) — 2026-10-11
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
- [x] Validação visual do golden path autenticado (desktop e mobile, via Playwright): cadastro,
  login, erro de senha, logout, lançamento de despesa, criação de caixinha e tela de perfil
  testados de ponta a ponta na branch `test`. Achou e corrigiu 2 bugs reais que a revisão
  estática (cross-review) não pegava: extração do token de auth quebrava toda a carga de dados
  após o login (formato real `data.session.token`, não `data.token`), e valor cortado no card
  de Despesa no mobile — 2026-10-10
