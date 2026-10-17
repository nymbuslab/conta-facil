---
target: src/components/splash-screen.tsx
total_score: 10
max_score: 16
na_heuristics: 2,5,6,7,9,10
p0_count: 0
p1_count: 2
target_identity: "file:C:\\pasta_segura\\projetos\\conta-facil\\src\\components\\splash-screen.tsx"
target_fingerprint: "sha256:8171df60b38b501a15e77b0a060da89cf75cccb799f6b3de89fffc5c349f4053"
target_path: "C:\\pasta_segura\\projetos\\conta-facil\\src\\components\\splash-screen.tsx"
timestamp: 2026-10-17T03-07-06Z
slug: src-components-splash-screen-tsx
closed: true
---
Method: dual-agent (A: aa16579f676bd54d9 · B: ac0adcf32e1ce467f)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Spinner communicates "working", mas nada distingue de qualquer outro app; só o leitor de tela recebe o texto "Carregando sua conta" |
| 2 | Match System / Real World | n/a | sem metáfora de mundo real a avaliar numa tela de boot |
| 3 | User Control and Freedom | 3 | `pointer-events-none` no fade evita o bug de clique travado já corrigido; bloquear clique na fase opaca é correto |
| 4 | Consistency and Standards | 1 | quebra a linguagem de superfície do próprio app: toda outra tela usa `#F2F4F8`, branco é reservado a Card/Dialog; a splash vira a tela inteira branca sem borda/sombra/raio, sem o cabeçalho de marca (`TopoMarca`) |
| 5 | Error Prevention | n/a | o estado de erro aparece depois que a splash resolve, não nela |
| 6 | Recognition Rather Than Recall | n/a | nenhuma informação a lembrar nesta tela |
| 7 | Flexibility and Efficiency | n/a | fora de escopo numa tela de carregamento breve |
| 8 | Aesthetic and Minimalist Design | 3 | apropriadamente sóbria, mas lê como ausência de design, não como restrição intencional (ver Consistency e o veredito de especificidade) |
| 9 | Error Recovery | n/a | nenhum erro aparece nesta tela |
| 10 | Help and Documentation | n/a | não esperado numa tela de boot |
| **Total** | | **10/16** | **Acceptable (62,5%)** |

## Design Specificity Verdict

**Avaliação do revisor (LLM):** Esta splash não lê como autoral do Conta Fácil. Os próprios componentes vizinhos provam o que "autoral" significa neste app: `TopoMarca` renderiza uma barra sólida `bg-primary` com ícone + nome em `font-display` — um gesto de marca explícito e confiante. A splash abandona tudo isso por uma superfície `bg-white` nua, só o ícone do app e três pontos genéricos em `animate-bounce` — o padrão de "carregando..." mais comum da web, intercambiável com qualquer starter Tailwind. Dado que o próprio DESIGN.md rejeita explicitamente o visual de app de finanças gamificado (precisão em vez de decoração), a splash é a única tela do app sem nenhum traço da identidade documentada: nenhuma superfície azul confiança, nenhum wordmark, nenhuma tipografia tabular, nenhuma linguagem de movimento assinatura.

**Varredura determinística (detector):** `src/components/splash-screen.tsx` — exit code 0, 1 achado `advisory`/`slop`: regra `bounce-easing` na linha 12 (`animate-bounce` do Tailwind), descrita como "bounce/elastic easing parece datado e artificial; usar easing exponencial". O detector sinalizou só a primeira ocorrência das três `<span>` de ponto (linhas 12-14 usam a mesma classe) — possível comportamento de "uma sinalização por padrão" em vez de por linha. `src/routes/__root.tsx` — exit code 0, zero achados.

**Falso positivo identificado (Assessment B):** o achado `bounce-easing` é discutível aqui — três pontos com `animation-delay` escalonado é o padrão convencional de indicador de carregamento ("three bouncing dots"), não um bounce decorativo de transição de conteúdo, que é o que a regra parece visar pela própria descrição. Mesmo assim, a convergência entre o detector (motion genérico/datado) e o revisor (motion emprestado sem rigor documentado, P2 abaixo) reforça que vale revisar esse elemento, mesmo que a sinalização literal do detector não seja um bug nele.

**Overlays visuais:** não disponíveis. A Assessment B tentou capturar a splash ao vivo em 2 tentativas (reload + screenshot imediato) e não conseguiu — a sessão local já estava "quente" (login anterior em cache) e a verificação de auth resolve mais rápido que o tempo de resposta das ferramentas de navegador, então a janela de 250ms de fade já tinha passado quando a captura rodou. Sem controle de throttling de rede exposto nas ferramentas disponíveis, o estado transitório foi estruturalmente inalcançável com esse conjunto de ferramentas nesta rodada. A injeção de overlay (`impeccable live-server`) foi pulada por decisão própria da Assessment B, já que instrumentar a tela já carregada (não a splash) não agregaria evidência.

## Overall Impression

A splash funciona e é acessível, mas é a única tela do Conta Fácil sem nenhuma marca da identidade visual documentada em DESIGN.md. A maior oportunidade: ela é o primeiro frame que todo usuário vê, em toda sessão fria — e hoje é indistinguível de qualquer spinner padrão de qualquer app.

## What's Working

- **Semântica de acessibilidade bem composta**: `role="status"` + um único `aria-label="Carregando sua conta"` no container, com ícone e pontos marcados `aria-hidden` — o leitor de tela recebe um anúncio coerente em vez de três nós decorativos desconectados. Consistente com a postura de acessibilidade do PRODUCT.md (suíte `jest-axe`, trabalho deliberado de `aria-label`).
- **Uso correto de token onde a cor aparece**: os pontos usam `bg-primary` (Azul Confiança), não um spinner cinza arbitrário — pequeno, mas é o único lugar da splash que toca a paleta real.
- **O fix do fade em dois `useEffect` separados é um ganho real de robustez**, não só estético: o comentário no código documenta um bug real (a camada de splash "morta" engolindo clique silenciosamente via `fixed`/`z-50` mesmo em `opacity-0`) e a correção (separar a transição de estado do timer, mais `pointer-events-none` durante `saindo`) tem a forma certa pra essa classe de bug.

## Priority Issues

**[P1] Fundo foge do token documentado.** `bg-white` é usado na camada cheia da splash, mas o DESIGN.md reserva branco explicitamente para `Card`/`Dialog` ("Branco Cartão: fundo de todo Card e Dialog") — o token de fundo de página é `#F2F4F8`, usado em toda outra tela, inclusive por trás do `TopoMarca`. A splash virar a viewport inteira branca, sem forma/borda/sombra de cartão que justifique, cria um salto visível de cor (branco → `#F2F4F8`) no exato momento em que o fade termina e o conteúdo real monta — uma segunda transição não intencional, por cima do fade de 250ms deliberado.
**Fix:** troque `bg-white` por `bg-background`.
**Comando sugerido:** `$impeccable polish`

**[P1] Nenhuma identidade de marca no frame mais visto do app.** Ícone + três pontos saltitantes é o padrão genérico de spinner; nada aqui é distintivo do Conta Fácil, mesmo o DESIGN.md definindo uma "Creative North Star" e nomeando componentes-assinatura (barra de progresso, FAB) exatamente pra UI reusada não parecer templated.
**Fix:** empreste a linguagem do `TopoMarca` — no mínimo renderize o wordmark em `font-display` ao lado do ícone, ou use a superfície sólida azul-confiança, pra que o primeiro frame já leia como Conta Fácil em vez de um estado de carregamento sem marca.
**Comando sugerido:** `$impeccable delight`

**[P2] Movimento emprestado sem rigor documentado.** `animate-bounce` ×3 é o spinner padrão de pontos do Tailwind, o mesmo padrão em inúmeros apps não relacionados (e sinalizado pelo detector como convenção datada, mesmo sendo o uso convencional de "três pontos"). O DESIGN.md é preciso até o pixel/ms em todo o resto (raios de 4px/2px, `shadow-sm` fixo, `speed-dial-in` de 150ms), mas esse movimento não está registrado em lugar nenhum e não reusa nenhum vocabulário visual do próprio app (ex: o preenchimento da barra de progresso assinatura).
**Fix:** troque por um tratamento de movimento construído a partir do componente-assinatura do próprio app (ex: uma barra indeterminada fina azul-confiança, no estilo da barra de progresso já documentada) e registre no DESIGN.md.
**Comando sugerido:** `$impeccable animate`

**[P3] Sem tempo mínimo de exibição.** Numa sessão quente, `status` pode deixar `'carregando'` em bem menos de 100ms, disparando o fade de uma tela que ficou visível por quase nada — um flash em vez de uma tela intencional, agravado pelo salto de cor do P1 caindo no mesmo instante.
**Fix:** trave a saída por um tempo mínimo visível (~400ms) ou não renderize a splash quando a resolução acontece antes do primeiro paint.
**Comando sugerido:** `$impeccable polish`

**[P3] Possível lacuna no ciclo de vida (só uma via).** `splashVisivel` só vai de `true` para `false`; nada volta a `true`. Se `status` oscilar (`'erro'` → `'carregando'` de novo via `recarregarSessao()`), a splash não pode reaparecer, mesmo havendo um estado equivalente a um reload de verdade. Sinalizado, não confirmado como bug.
**Fix:** confirmar se é intencional (só no boot) ou cobrir o caso de retry com `recarregarSessao()`.
**Comando sugerido:** `$impeccable audit`

## Persona Red Flags

**Casey (usuário distraído no mobile):** um flash branco rápido, sem texto ou sinal de marca, seguido imediatamente por uma cor de fundo diferente, lê como "algo travou" em vez de "está carregando" numa conexão instável — não há âncora visual confirmando em qual app/estado a pessoa está durante uma olhada rápida.

**Riley (testador de estresse / reload rápido):** essa mesma superfície já falhou uma vez de verdade sob reload real (o bug de clique travado documentado no código); o estado de uma via só (`splashVisivel` nunca volta a `true`) é o próximo caso de borda que vale testar deliberadamente — oscilação de status de auth (retry de rede) é plausível, já que `recarregarSessao()` existe exatamente pra esse caso.

**Sam (dependente de acessibilidade):** `role="status"` (implícito `aria-live="polite"`) é um padrão razoável pra uma tela que não deveria interromper, mas nada no código sugere que essa foi uma escolha deliberada em vez de um default — vale confirmar se foi escolhido e não só herdado, já que `polite` e `assertive` têm semânticas de interrupção diferentes pra quem usa leitor de tela.

## Minor Observations

- `/favicon.svg` é reusado como logo da splash em 80×80 (`h-20 w-20`), quatro vezes o tamanho típico de favicon — provavelmente certo se o SVG foi feito para isso, mas vale checagem visual ao vivo (não verificado renderizado nesta rodada).
- O tamanho dos pontos (`h-2 w-2`, `gap-1.5`) é internamente consistente — não é problema, só confirma que a única decisão de design de fato tomada aqui foi o padrão de movimento (genérico).

## Questions to Consider

1. Se o `bg-white` aqui é deliberado e não um descuido, qual é o raciocínio por trás de usar a cor de Card numa superfície que não é um cartão — e o time está confortável com o salto de cor resultante pro `#F2F4F8` do conteúdo por baixo?
2. O DESIGN.md rejeita explicitamente clichê visual de app de finanças gamificado — um spinner de três pontos emprestado atende esse padrão pra tela que todo usuário vê primeiro, toda sessão?
3. O comportamento de "flash" sub-100ms em sessão quente já foi observado de verdade pelo time, e nesse caso um flash quase instantâneo é preferível a simplesmente não renderizar a splash?
