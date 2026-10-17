# Progresso do Projeto

> Detalhes de implementação ficam em CLAUDE.md. Aqui entram apenas etapas.

## 🔄 Em Andamento

_(nada no momento)_

## 📋 Próximos Passos

- [ ] (P0) Validar dashboard-extrato em produção com dados reais: golden path visual (desktop +
  mobile) da tela Início (dashboard) e da tela Extrato (busca, abas, navegação de mês), logado com
  conta real — está no ar desde hoje sem essa validação (risco residual D-18 do `FECHAMENTO.md` da
  feature, achado numa varredura de documentação, não desta tarefa)
- [ ] (P0) Implantar em `production` as rotas `PATCH`/`DELETE /lancamentos/:id` (editar/excluir
  lançamento): `npx neon deploy --env .env.local` — sem isso, o frontend chamaria rotas 404 em
  produção quando a UI do diálogo de ações for publicada
- [ ] (P1) Validar visualmente `AcoesLancamentoDialog` em navegador real (desktop + mobile): menu,
  edição, exclusão com alcance e os dois avisos (despesa paga, caixinha vinculada) — pulado duas
  vezes nesta sessão por timeout da ferramenta de automação
- [ ] (P2) Decidir sobre dark mode: os tokens completos já existem em `src/index.css` (bloco
  `.dark`), mas nada na aplicação aplica essa classe hoje — ou implementar um alternador de tema,
  ou remover o bloco morto. Decisão de produto, adiada nesta sessão a pedido do usuário.

## ✅ Concluído

- [x] Fluxo "Esqueci minha senha": link na tela de login, tela de solicitação
  (`/esqueci-senha`, mensagem genérica de sucesso sem revelar se o e-mail existe) e tela de
  redefinição (`/redefinir-senha`, lê `token` da URL — estados de link inválido/expirado,
  formulário de nova senha e confirmação). Usa `requestPasswordReset`/`resetPassword` do Neon
  Managed Auth (Better Auth), sem servidor de e-mail próprio. `esqueci-senha.test.tsx` e
  `redefinir-senha.test.tsx` cobrem validação, sucesso, token ausente/inválido e erro do servidor
  (8 testes novos, mesmo padrão de `login.test.tsx`/`cadastro.test.tsx`). Build e 356/357 testes
  verdes (a falha é achado pré-existente da rotina de pentest, sem relação com esta mudança).
  Validado ao vivo contra o Neon Auth real: link no login, pedido de recuperação com e-mail
  inexistente, link sem token, token inválido — 2026-10-17. Golden path completo (link real
  recebido por e-mail, troca de senha, login com a senha nova) confirmado pelo usuário em
  2026-10-17

- [x] Proxy reverso `/auth/*` para o Neon Auth (Cloudflare Pages Functions,
  `functions/auth/[[catchall]].js`), resolvendo sessão não persistindo em navegadores que
  bloqueiam cookie de terceiros (Brave sempre, mobile com frequência): `Set-Cookie` confirmado
  host-only via login real em Preview com a conta de teste do pentest; achado de segurança real
  (SSRF/proxy aberto na montagem da URL de destino) corrigido com testes; PR #5 revisado e
  mergeado em `master`; implantado em `production` (`NEON_AUTH_UPSTREAM_URL` e
  `VITE_NEON_AUTH_BASE_URL` configuradas no painel do Cloudflare Pages, rebuild feito, app real
  confirmado chamando o proxy — `GET /auth/get-session` 200). Build, lint e 351 testes verdes (5
  novos). Decisões e achados em `docs/sprintx/features/proxy-reverso-neon-auth/` e `DEPLOY.md` —
  2026-10-17. Login completo em produção com credenciais reais confirmado pelo usuário em
  2026-10-17: sessão permaneceu logada após fechar e reabrir a aba

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
- [x] Ícone personalizado do Conta Fácil criado e aplicado como favicon: conceito
  "C-moeda" (anel aberto em azul sólido da marca, sem gradiente), escolhido entre 3
  propostas. Build e testes verdes; validado no navegador e confirmado em produção
  (conteúdo servido correto) — 2026-10-13
- [x] Logo em destaque: telas de entrar e criar conta trocaram o cabeçalho azul
  genérico pelo ícone + nome "Conta Fácil" centralizados acima do formulário
  (componente MarcaDestaque, reusado nas duas telas); o cabeçalho das telas
  autenticadas (TopoMarca) ganhou o mesmo ícone ao lado do nome. Build, 191 testes,
  validação visual no navegador (login/cadastro) e confirmação do usuário direto na
  tela autenticada logada — 2026-10-13
- [x] Acessibilidade: 6 correções aplicadas — botão de fechar do dialogo com rótulo
  "Fechar", foco/aria-label na linha de despesa clicável, foco visível e alvo de toque
  de 44px no card de caixinha, remoção de `aria-pressed` indevido em entrar/criar conta
  e `aria-haspopup` no botão de novo lançamento. Adicionado `jest-axe` e a suíte
  `src/components/acessibilidade.test.tsx` (6 testes, violações zero). Build, lint e 197
  testes verdes — 2026-10-13
- [x] Fluxos assíncronos com feedback e resiliência: todo submit ganhou estado de envio
  e `disabled` ("Registrando...", "Criando...", "Confirmando...", "Marcando..." nos
  diálogos); skeletons fiéis ao layout por tela (Início, Caixinhas, Parcelas) no lugar
  do bloco genérico; "marcar como paga" e "excluir caixinha" agora são otimistas com
  rollback no contexto (a lista reverte e avisa se a Function falhar); `recarregar` não
  limpa mais a lista (uma recarga com dados na tela mantém o conteúdo); erro de sessão
  (401/403) mapeado para mensagem "Sua sessão expirou. Entre novamente." via
  `mensagemErroApi`; bloco `@media (prefers-reduced-motion: reduce)` no `index.css`.
  Suíte `src/components/fluxos-assincronos.test.tsx` (6 testes: rede lenta, duplo
  clique, falha de API, optimistic + rollback, movimento reduzido). Build, lint e 203
  testes verdes — 2026-10-13 (UI não validada visualmente: o app exige login via Neon
  Auth, serviço externo)
- [x] Listas por cursor e filtros no servidor: Início e Caixinhas buscam páginas de 20 (botão
  "Carregar mais") filtradas por mês/busca; o total do mês vem de `/lancamentos/resumo` e o mês
  passou a ser navegável (`FiltrosLancamentos`, "Mês anterior"/"Próximo mês"). A tela Parcelas
  consome `/lancamentos/parcelamentos` (agrupado por `parcelamento_id`) em vez de baixar cada
  parcela, com recarga por `versaoParcelamentos`. Medição: com 300 lançamentos o `GET` devolve 20
  (default `limite: 20`, provado no teste da Function), ~93% menos linhas por requisição; novos
  índices `(user_id, criado_em, id)` em `drizzle/0002_paginacao_indices.sql`. Build, lint e 213
  testes verdes — 2026-10-13 (UI não validada visualmente: exige login via Neon Auth; a migration
  de índices foi aplicada em `production` em 2026-10-13 — a branch `test` segue sem os índices, o
  que não afeta os testes de integração)
- [x] Investigação de N+1 e corte de overfetch nas listas: mapeado o caminho rota → Function →
  Drizzle → Postgres de cada tela — **não há N+1 clássico** (contagem de queries constante em N:
  Início 5, Parcelas 1, Caixinhas 2, tudo em `Promise.all`/agregação SQL; nenhum `for`/`map` com
  `await`). Corrigido o `SELECT *` de `lancamentos.listar` e `caixinhas.listar` para projeção
  explícita de colunas: a listagem deixou de devolver `userId`, `criadoEm` e `atualizadoEm`
  (nenhum usado pela tela; `criadoEm` agora só no servidor, para o cursor). Medição com dados reais
  (leitura na branch `production`): payload/página de `GET /lancamentos` 7.379 → 4.584 bytes
  (−37,9%, ~147 bytes/linha) e de `GET /caixinhas` 265 → 118 bytes; largura da linha no Postgres
  102 → 78 bytes; queries por endpoint seguem 1. Testes: shape exato da resposta + invariante
  "1 consulta por requisição" em `lancamentos.test.ts`/`caixinhas.test.ts`, e `lancamentos-setup.ts`
  passou a provar isolamento pela contagem SQL e a recusar qualquer campo interno no payload.
  Build, lint e 219 testes verdes (6 novos); integração real contra a branch `test`
  (`test:integration:lancamentos` e `test:integration:caixinhas`) passou — 2026-10-13
- [x] Página das listas reduzida de 20 para 5 itens (melhor no celular): `LIMITE_PADRAO` da
  paginação por cursor passou a 5 (receitas, despesas e caixinhas); o mock dos testes passou a
  usar o mesmo `LIMITE_PADRAO` (antes fixava 20) e a asserção da Function foi ajustada. Publicado
  em produção com redeploy da Function — que ainda **não** estava implantada com a paginação (o
  `.deploy-state.json` apontava para o commit da idempotência). Build, lint e 219 testes verdes —
  2026-10-13 (build OK, UI não validada visualmente: exige login via Neon Auth)
- [x] Validação visual em produção dos três status de despesa (A vencer/Vencido/Pago): confirmado
  pelo usuário direto no app em produção — 2026-10-14
- [x] Validação visual em produção da paginação de 5 itens, navegação de mês/busca e ajustes de
  acessibilidade: confirmado pelo usuário direto no app em produção — 2026-10-14
- [x] Rotina de pentest própria (`npm run pentest`, `scripts/pentest/`): checagens passivas sem
  mutação contra `production` real (headers de segurança, CORS, erro verboso, autenticação) e
  checagens ativas (IDOR em lançamentos/caixinhas, injeção em campos, cursor forjado, audience
  do JWT) só contra a branch `test`, sempre atrás de `garantirBranchDeTeste()`. Relatório
  markdown datado em `docs/seguranca/relatorios/AAAA-MM-DD.md`, workflow semanal
  (`.github/workflows/pentest-semanal.yml`, fim de semana + disparo manual) com abertura
  automática de issue em achado alta. 19 tasks das 4 sprints concluídas, mais 2 tasks de uma
  rodada de convergência que corrigiu achados de erro de rede real sem achado (D-09) e de teste
  apagando o relatório real do dia (D-10). Suíte inteira verde (311 passed, 2 skipped
  pré-existentes, 92 testes novos), build e lint OK. A primeira execução real já encontrou e
  documentou 2 achados reais de segurança (ver Próximos Passos) e 2 de severidade média
  (cabeçalhos ausentes) — 2026-10-14 (ver `FECHAMENTO.md` de `rotina-pentest`; workflow do
  GitHub Actions validado só estaticamente, sem runner disponível nesta sessão)
- [x] Corrigidos com TDD os 2 achados reais que a rotina de pentest encontrou:
  `authMiddleware` classificava token com algoritmo não permitido (código `ERR_JOSE_ALG_NOT_ALLOWED`
  do `jose`) como 503 em vez de 401 — regex `CODIGOS_TOKEN_INVALIDO` ampliada; `jwtVerify` passou
  a validar `audience` contra o próprio `issuer` (o Neon Auth emite os dois iguais, confirmado
  contra a branch `test` real via `npm run test:integration:auth`). Também corrigidos os 2
  achados médios de cabeçalhos ausentes: Function ganhou `secureHeaders` do Hono (CSP restritiva
  `default-src: 'none'` + HSTS/nosniff/X-Frame-Options/Referrer-Policy) e o frontend ganhou
  `public/_headers` (HSTS/X-Frame-Options/X-Content-Type-Options/Referrer-Policy, sem CSP —
  decisão deliberada, ver Próximos Passos). Build, lint e 314 testes verdes (3 novos). Deployado
  em `production` via `npm run deploy` e confirmado na prática (`/lancamentos` sem token devolve
  401 com HSTS/CSP presentes) — 2026-10-14
- [x] Senha das contas de teste do pentest trocada de timestamp previsível para CSPRNG
  (`randomBytes(24)`); contas antigas removidas via `npm run manutencao:limpar-usuarios-teste` e
  recriadas com a senha nova — achado de revisão automática de segurança, corrigido com TDD — 2026-10-14
- [x] P0 do pentest concluído: os 10 secrets (`DATABASE_URL`, `DATABASE_URL_UNPOOLED`,
  `NEON_BRANCH`, `NEON_AUTH_BASE_URL`, `NEON_AUTH_JWKS_URL`, `NEON_FUNCTION_API_BASE_URL`,
  `PENTEST_CONTA_A_EMAIL`/`_SENHA`, `PENTEST_CONTA_B_EMAIL`/`_SENHA`) cadastrados no GitHub
  Actions e o workflow `pentest-semanal.yml` disparado manualmente (`workflow_dispatch`) com
  sucesso de ponta a ponta: rodou a rotina, comitou `docs/seguranca/relatorios/2026-10-14.md`
  (13 achados) e pulou corretamente a abertura de issue (nenhum achado de severidade alta,
  diferente da primeira execução) — 2026-10-14
- [x] P2 concluído: Content-Security-Policy do frontend implementada. `dist/_headers` passou a
  ser gerado no build (plugin Vite `headersDeProducao`, conteúdo de
  `scripts/gerar-headers-producao.mjs`) em vez de estático, porque a CSP precisa da origem real
  da Function e do Neon Auth, que só existem no momento do build. `public/_headers` removido
  (substituído pela geração). Validado servindo `dist/` com os headers reais via Playwright:
  página de login carrega, fontes do Google Fonts carregam e o fetch de login chega ao Neon
  Auth sem bloqueio de CSP (401 da credencial falsa de teste, não da CSP). Build, lint e 319
  testes verdes (4 novos) — 2026-10-14
- [x] Origem do depósito na caixinha: ao depositar, o usuário escolhe se o valor veio do saldo
  atual (desconta do saldo do mês, como sempre) ou é dinheiro de fora (não desconta e gera um
  lançamento de receita vinculado automaticamente, com efeito líquido zero no saldo no momento
  do depósito); resgate sempre soma de volta ao saldo, independente da origem. Tabela nova
  `caixinha_movimentacoes` registra cada depósito/resgate. Build, lint e 344 testes verdes (25
  novos). Implantado em `production`: migration aplicada e Function publicada, health check OK
  — 2026-10-16 (UI não validada visualmente: exige login via Neon Auth)
- [x] Causa raiz do `drizzle.__drizzle_migrations` vazio em `production`: as 4 migrations
  aplicadas até aqui sempre foram por SQL direto (MCP do Neon ou SQL Editor), nunca por
  `drizzle-kit migrate` — só o próprio `drizzle-kit` grava a tabela de controle, então ela nunca
  foi populada, mesmo com as tabelas certas no lugar. Corrigido inserindo as 4 linhas de controle
  em `production` (hash + timestamp iguais aos já provados em `test`, onde `drizzle-kit migrate`
  roda de verdade a cada `npm run test:migrate`). Confirmado por leitura: hashes de `production`
  batem com os de `test`. Ver `DEPLOY.md` para o procedimento caso aconteça de novo — 2026-10-16
- [x] Validação visual do campo de origem no modal de depósito (desktop 1280px e mobile 375px),
  logado de verdade com a conta de teste do pentest na branch `test`: os dois estados do
  `radiogroup` ("Saldo atual" / "Dinheiro de fora") alternam corretamente, o modal respeita a
  margem lateral no mobile e o fluxo completo foi exercitado de ponta a ponta — depósito
  "Dinheiro de fora" gerou a receita vinculada "Depósito em caixinha" e manteve a sobra prevista
  em R$ 0,00 (efeito líquido zero), confirmando o comportamento documentado. Achado à parte: a
  Function publicada em `test` estava parada em 2026-10-10 (antes da idempotência, paginação e da
  própria feature de origem), causando 404 em `/lancamentos/resumo` — corrigida com
  `npx neon deploy --branch test`, sem tocar em `production`. `FUNCTION_ALLOWED_ORIGINS` do
  `test` ganhou `http://localhost:5173` em `.env.test.local` para permitir esse tipo de validação
  local no futuro — 2026-10-16
- [x] Sistema de design documentado e auditado: `PRODUCT.md` e `DESIGN.md` gerados a partir do
  código real (tokens, componentes, regras nomeadas). Splash screen corrigida: saiu do fundo
  branco genérico para superfície sólida Azul Confiança com wordmark e barra indeterminada,
  ganhou tempo mínimo de exibição (~400ms) e passou a reaparecer corretamente num retry de sessão
  (bug real corrigido, não só melhoria). Auditoria de conformidade visual rodada duas vezes em
  toda a `src/`: 2 achados reais corrigidos na origem (alvo de toque 40px→44px em
  `Button size="icon"`, sombra `shadow-md`→`shadow-sm` nos Cards de login/cadastro) e 2 exceções
  documentadas no `DESIGN.md` (gradiente de scroll do `DataTable`, token `overlay` do `Dialog`).
  Polimento adicional: hint "Mínimo de 8 caracteres" no campo de senha do cadastro, link "Esqueci
  minha senha" reposicionado para baixo do campo (convenção mais discreta). Build, lint e detector
  limpos; 356/357 testes verdes (a falha é o mesmo achado pré-existente da rotina de pentest, sem
  relação); validado visualmente no navegador em cada etapa — 2026-10-17
- [x] Golden path de login em produção confirmado com conta real: sessão permaneceu logada após
  fechar e reabrir a aba — 2026-10-17
- [x] Golden path completo de redefinição de senha confirmado em produção com link real recebido
  por e-mail: usuário trocou a senha com sucesso — 2026-10-17

- [x] Dev local voltou a carregar dados reais de produção: causa raiz era CORS — a Function de
  `production` só liberava `contafacil.nymbuslab.com.br`, e `npm run dev` fala direto com ela (não
  existe Function local). Porta do Vite fixada (`server.port: 5173, strictPort: true` em
  `vite.config.ts`) para a origem nunca variar; `FUNCTION_ALLOWED_ORIGINS` de `production` passou a
  incluir também `http://localhost:5173`, publicado com `npx neon deploy --env .env.local`. Build e
  394/397 testes verdes (1 falha pré-existente do pentest, sem relação) — 2026-10-17 (UI não
  revalidada nesta rodada)

- [x] Achado durante a varredura de documentação: o `neon deploy` acima publicou em produção TODO o
  código atual da Function — inclusive os dois endpoints novos da feature dashboard-extrato
  (`GET /lancamentos/vencendo`, `GET /lancamentos/recentes`), que `FECHAMENTO.md` da feature listava
  como pendentes de "deploy manual da Function". O frontend dessa mesma feature já estava publicado
  (push em `master` já sincronizado com `origin/master`). Ou seja, a partir de hoje a feature
  dashboard-extrato está inteira no ar (frontend + backend) — mas a validação visual e a validação
  com dados reais que o risco residual do `FECHAMENTO.md` (D-18) pedia continuam pendentes — 2026-10-17

- [x] Editar e excluir lançamentos (receita e despesa) direto do diálogo de ações do Extrato e de
  Parcelas: `AcoesLancamentoDialog` substitui o antigo `ConfirmarPagamentoDialog`, com escolha de
  alcance em parcelamento (só esta parcela ou esta e as futuras) e aviso quando a despesa já foi
  paga. Receita vinculada a um depósito "de fora" em caixinha é bloqueada ao editar/excluir (409).
  `PATCH`/`DELETE /lancamentos/:id` seguem o mesmo padrão de idempotência da criação. Build e 426
  testes verdes (35 novos; 1 falha pré-existente do pentest, sem relação). Decisões em
  `docs/sprintx/features/editar-excluir-lancamentos/` — 2026-10-17 (rotas de backend testadas na
  branch `test`; ainda não implantadas em `production`; UI não validada em navegador real por
  timeout repetido da ferramenta)
