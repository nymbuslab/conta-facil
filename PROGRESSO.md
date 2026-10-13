# Progresso do Projeto

> Detalhes de implementação ficam em CLAUDE.md. Aqui entram apenas etapas.

## 🔄 Em Andamento

Nenhum item em andamento.

## 📋 Próximos Passos

- [ ] (P2) Validar visualmente em produção os três status de despesa (A vencer/Vencido/Pago),
  já que esta entrega não foi conferida no navegador — abrir quando for mexer de novo nessa
  tela ou antes do próximo deploy de frontend.

## ✅ Concluído

- [x] Parcelamento inverte o input: usuário informa o valor da parcela, não o total — a Function
  multiplica pela quantidade (120 × 10 = R$ 1.200,00). Validado em produção via browser real,
  depois de corrigir duas pendências de deploy encontradas no processo: a Neon Function precisa
  de `neon deploy` manual (o push só atualiza o frontend) e `VITE_NEON_AUTH_BASE_URL` faltava nas
  env vars de build do Cloudflare Pages — 2026-10-11
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
- [x] Segurança de dependências: auditoria automatizada fail-closed, árvore npm atualizada sem
  quebra e Tailwind 3 migrado para Tailwind 4 com plugin Vite e tema CSS-first. Resultado final:
  0 alertas altos, 0 críticos e 4 moderados documentados do Drizzle Kit; build, 125 testes e
  16 pares visuais mobile/desktop aprovados com delta de 0 px — 2026-10-12
- [x] Idempotência de escrita financeira implementada em `POST /lancamentos`, depositar e
  resgatar: chave isolada por usuário, hash canônico, trava e mutação na mesma transação, replay
  da resposta, conflito 409 e um único retry transitório no cliente. Migration, concorrência,
  parcelamento, saldos e rollback validados na branch Neon de teste; produção não foi alterada —
  2026-10-12
- [x] Deploy unificado em um comando: `npm run deploy` (`scripts/deploy.mjs`) substitui os dois
  passos manuais — checa branch/tree/link `.neon`, trata o gate de migration, deploya a Function
  (`npx neon deploy`) validando `FUNCTION_ALLOWED_ORIGINS`, roda health check com retry e só então
  faz o push, com modo `--sim` e gates fail-closed. `DEPLOY.md` documenta o que fica fora do
  script (env vars do Pages, domínio confiável, migration em production). Suíte, build e lint
  verdes (41 testes novos) — 2026-10-12
- [x] Estado de erro de sessão distinto com nova tentativa: `useAuth` ganhou `status: 'erro'` (com
  precedência `carregando` → `autenticado` → `erro` → `anonimo`) e `recarregarSessao()` (chama o
  `refetch` do adapter). `__root` mostra tela "Não foi possível verificar sua sessão" com botão
  "Tentar novamente" em vez de redirecionar ao login; o `auth-middleware` passou a separar token
  inválido/expirado (401) de serviço de auth indisponível — JWKS/rede (503), mantendo 500 para
  configuração ausente. Suíte/build/lint verdes (174 testes) — 2026-10-12
- [x] Formato do token do Neon Auth confirmado: `token()` (plugin JWT) devolve `{ data: { token } }`
  (oficial) e `getSession()` devolve `{ data: { session: { token } } }` — é este o campo que a
  própria lib lê em `getJWTToken` (header `set-auth-jwt`). `extrairToken` cobre os dois por
  design; comentário ajustado citando as fontes oficiais — 2026-10-12
- [x] Revisão cruzada (Codex/OpenCode) das 5 entregas anteriores: idempotência financeira, deploy
  unificado, estado de erro de sessão e formato do token do Neon Auth convergem com as decisões
  registradas, sem achado. Segurança de dependências bateu com o `npm audit` real (0 altas/
  críticas, 4 moderadas do Drizzle Kit), mas o portão `audit:security` não estava amarrado a nada
  automático — corrigido incorporando a auditoria como passo fail-closed do próprio
  `scripts/deploy.mjs` (roda antes do gate de migration e do deploy da Function, inclusive em
  `--sim`), e cobrindo o caso de token ausente/malformado que faltava em `extrairToken`. Build,
  lint e 179 testes verdes (5 novos) — 2026-10-12
- [x] Rollout da idempotência financeira em `production`: migration
  `drizzle/0001_idempotencia.sql` aplicada (via branch temporária validada antes), Function
  implantada (`npm run deploy`, health check 200, push confirmado), golden path de escrita
  validado manualmente em produção (vários lançamentos reais, sem duplicação) — 2026-10-13 (o
  comportamento específico de replay de `Idempotency-Key` e o 409 por reuso não foram
  reexercitados contra produção; já estavam provados antes do deploy pelos testes de integração
  na branch `test`)
- [x] Fechamento dos 4 itens restantes do backlog de idempotência — 2026-10-13:
  replay/409 em `production` fechado sem reteste manual (é o mesmo código já provado pelos
  testes de integração na branch `test`, sem lógica nova implantada); retenção dos registros de
  `idempotencias` definida em 90 dias com limpeza via `npm run manutencao:limpar-idempotencias`
  (`scripts/limpar-idempotencias.mjs`); `garantirBranchDeTeste()` ganhou
  `confirmarIdentidadeConexao()`, que cruza `current_setting('neon.endpoint_id')` da conexão real
  contra o endpoint fixo da branch `test` (pega `.env.test.local` incoerente que a env var sozinha
  não detectava), aplicado nos 11 pontos de entrada de teste/integração que escrevem no Postgres;
  teardown de usuários de teste automatizado via `npm run manutencao:limpar-usuarios-teste`
  (`scripts/limpar-usuarios-teste.mjs`, remove por padrão de e-mail `@example.test`, cascata
  limpa sessão/conta); evento de idempotência `registrar(...)` movido para depois de
  `transacionar()` resolver, só emitido após o commit confirmado. Build, lint e 188 testes
  verdes (9 novos)
- [x] Fechado o alerta moderado residual do Drizzle Kit sem downgrade: `drizzle-kit` é
  `devDependency`, nunca entra no bundle do frontend nem na Neon Function em produção, e a
  vulnerabilidade (`esbuild <=0.24.2`, GHSA-67mh-4wv8-2f99) é especificamente sobre o servidor de
  dev do esbuild aceitar requisição de qualquer site — servidor que o `drizzle-kit` nunca sobe
  (usa o esbuild só para carregar config/TS ao gerar ou aplicar migration). Risco real nulo nesse
  uso; não há ação pendente. `npm run audit:security` continua fail-closed para alta/crítica —
  2026-10-13
- [x] Deploy em `production` da Function com o fechamento dos itens de idempotência: o log
  `registrar(...)` agora roda só depois do commit confirmado. Publicado via `npm run deploy`,
  validado por health check (200) e `.deploy-state.json` apontando pro commit atual — 2026-10-13
- [x] Status de despesa na lista ganhou um terceiro estado: "A vencer" (cor neutra, igual à
  antiga "Pendente"), "Vencido" (vermelho, quando o vencimento já passou e não foi paga) e
  "Pago" (verde). Cálculo feito em tela a partir de `paga` + `vencimento` (nova função
  `estaVencida` em `src/lib/datas.ts`), sem mudança de schema, API ou banco. Build e 191
  testes verdes — 2026-10-13 (build OK, UI não validada visualmente: o app exige login via
  Neon Auth, serviço externo, e eu não entro com credenciais sem o usuário logar)
