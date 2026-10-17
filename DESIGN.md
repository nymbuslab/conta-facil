---
name: Conta Fácil
description: Controle financeiro pessoal mobile-first, preciso e sem enfeite
colors:
  primary: "#1A5EFF"
  primary-foreground: "#F2F4F8"
  primary-hover: "#306DFE"
  success: "#139086"
  destructive: "#DC2828"
  warning: "#433ACA"
  background: "#F2F4F8"
  foreground: "#0F1829"
  card: "#FFFFFF"
  secondary: "#E2E7EE"
  muted: "#E9EDF2"
  muted-foreground: "#5D6F89"
  border: "#C8CFDA"
  overlay: "rgba(0, 0, 0, 0.8)"
typography:
  display:
    fontFamily: "Geist, Inter, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "normal"
    fontFeature: "'tnum' on, 'zero' on"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
rounded:
  lg: "4px"
  md: "2px"
  sm: "0px"
  full: "9999px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.md}"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "40px"
  badge-default:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.full}"
    padding: "2px 10px"
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: "24px"
  input:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "40px"
---

# Design System: Conta Fácil

## Overview

**Creative North Star: "O Caderninho Certo"**

Conta Fácil é o caderno de contas que não tenta ser nada além disso: cada número no lugar
certo, nada decorativo disputando atenção com o saldo. A interface é precisa e contida —
cantos quase retos (4px nas superfícies, 2px em botões e campos), cor sólida sem gradiente,
ícones de linha (Lucide) sem emoji, e sombra reservada só para o que realmente flutua sobre a
tela (modal, botão de registrar). Números monetários usam a fonte de destaque com algarismos
tabulares, para alinhar em coluna e parecer sempre comparável, nunca decorativo.

A identidade rejeita explicitamente o visual de app de finanças gamificado: sem confete, sem
emoji, sem tom infantilizado. O objetivo é confiança por precisão, não engajamento por estímulo.

**Key Characteristics:**
- Cor sólida, nunca gradiente.
- Cantos discretos (quase retos), reservando o círculo só para pílulas, progresso e o botão de
  registrar.
- Sombra como exceção (elemento flutuante), não como regra.
- Cor como sinal de direção do dinheiro, não como decoração.
- Números em algarismos tabulares na fonte de destaque.

## Colors

Paleta de poucas cores, cada uma presa a um papel semântico fixo — a cor nunca é escolhida por
decoração, só para indicar o que o número significa.

### Primary
- **Azul Confiança** (`#1A5EFF`): ação, marca e identidade — botão principal, ícone do app,
  cabeçalho das telas autenticadas, valor "Guardado" nos cartões de saldo, item ativo da
  navegação inferior.

### Secondary
- **Névoa Secundária** (`#E2E7EE`): fundo de botão secundário e de badges de contagem (ex:
  "3/10" parcelas pagas) — nunca carrega a ação principal da tela.

### Neutral
- **Branco Cartão** (`#FFFFFF`): fundo de todo `Card` e `Dialog`.
- **Grafite Texto** (`#0F1829`): texto principal, sobre fundo claro.
- **Névoa de Fundo** (`#F2F4F8`): fundo da página (`body`), por trás dos cartões.
- **Névoa Suave** (`#E9EDF2`): trilho de barra de progresso, fundo neutro de elementos inativos.
- **Chumbo Secundário** (`#5D6F89`): texto auxiliar — rótulo de card, descrição, item inativo da
  navegação.
- **Linha Hairline** (`#C8CFDA`): toda borda de 1px (card, input, divisor da navegação).
- **Véu de Fundo** (`rgba(0, 0, 0, 0.8)`): scrim atrás de `Dialog`/modal, único lugar da UI com
  preto — nunca usado como cor de superfície ou texto.

### Named Rules
**A Regra do Dinheiro com Sinal.** Toda vez que uma cor representa um valor monetário, ela
carrega a direção do dinheiro: **Verde Confirmado** (`#139086`) para entrada ou liquidação
(receita, parcela paga, progresso de caixinha); **Vermelho Saída** (`#DC2828`) para saída
(despesa); **Azul Confiança** para o que está guardado. Nunca usar uma cor neutra num valor cuja
direção importa para o usuário decidir algo.

Existe ainda um token de aviso, **Índigo-violeta** (`#433ACA`), semanticamente fora do padrão
amarelo/laranja convencional de "warning" — mantido como identidade visual deliberada do
projeto, documentado aqui como está, não como pendência a resolver por este arquivo.

**Exceção documentada: gradiente funcional de rolagem.** `DataTable` usa um gradiente de 24px
(`from-card to-transparent`) na borda direita de tabelas com rolagem horizontal, como indicador
de que há mais conteúdo fora da tela. É a única exceção à Regra de Cor Sólida no app: existe
porque comunica um estado funcional (rolagem disponível), não porque decora uma superfície —
nunca usar gradiente em botão, card ou qualquer outra superfície de conteúdo.

## Typography

**Display Font:** Geist (com Inter, system-ui como fallback)
**Body Font:** Inter (com system-ui, sans-serif como fallback)

**Character:** Geist carrega os números — valores de saldo, caixinha e parcelamento — sempre em
algarismos tabulares (`'tnum' on, 'zero' on`), para que uma coluna de valores alinhe por dígito
em vez de dançar. Inter carrega todo o resto: rótulo, descrição, texto de botão e navegação.

### Hierarchy
- **Title** (semibold, `text-2xl`/24px, leading-none): título de card de destaque (`CardTitle`).
- **Display de valor** (semibold, `text-xl`/20px ou `text-sm`→`text-xl` responsivo, fonte
  display): valor monetário em destaque num cartão (saldo, caixinha, parcelamento).
- **Body** (regular, `text-sm`/14px): texto padrão de card, descrição, diálogo.
- **Label** (medium/semibold, `text-xs`/12px): badge, rótulo de navegação inferior, contagem de
  parcelas.

### Named Rules
**A Regra do Algarismo Tabular.** Todo valor monetário usa a fonte display com `'tnum' on`.
Nenhum número de dinheiro aparece na fonte de corpo (Inter) sem esse recurso tipográfico.

## Layout

Container único, mobile-first: `mx-auto max-w-xl px-4`, com `pb-36` nas telas que têm navegação
inferior fixa e botão de registrar flutuante (espaço reservado para não cobrir conteúdo). Seções
dentro da tela seguem ritmo vertical de `gap-4`/`mt-6` (16px/24px); o grid de resumo do mês
(Receita/Despesa/Guardado) é `grid-cols-3 gap-3` (12px), sempre as três categorias juntas, nunca
isoladas. Cartões internos usam `p-6` (24px) quando têm cabeçalho + conteúdo, ou `p-3` (12px) nas
variantes compactas (os três cartões de saldo do topo). Sem breakpoint largo dedicado — a mesma
coluna única escala até o tablet; o grid de 3 colunas é o único lugar que responde com
`sm:text-xl` para crescer o valor numérico em telas maiores.

## Elevation & Depth

Sistema plano por padrão: um `Card` em repouso tem só `shadow-sm`, discreto o bastante para não
competir com o conteúdo. Sombra maior é reservada para o que está literalmente flutuando sobre a
tela — `Dialog` (`shadow-lg`) e o botão de registrar / speed dial (`shadow-md`/`shadow-sm`).
Nada ganha sombra nova ao receber hover; o sistema não "levanta" elementos como recompensa de
interação.

### Shadow Vocabulary
- **Repouso** (`shadow-sm`): todo `Card` parado na tela.
- **Flutuante** (`shadow-md`): botão de registrar (FAB) e seus atalhos de speed dial.
- **Sobreposição** (`shadow-lg`): `Dialog`/modal, a única camada que bloqueia o resto da tela.

### Named Rules
**A Regra do Plano por Padrão.** Superfícies são planas em repouso. Sombra aparece só como
resposta a estar sobre o resto da interface (modal, botão flutuante) — nunca como decoração de
hover ou de destaque.

## Shapes

Cantos quase retos como regra: 4px nas superfícies maiores (`Card`, `Dialog`) e 2px em botão e
campo de formulário — nada chega a ser "arredondado" de verdade, é só o suficiente pra não ser
um retângulo afiado. O círculo total (`rounded-full`) é reservado para um conjunto específico de
elementos: badge de contagem, trilho e preenchimento de barra de progresso, e o botão de
registrar (FAB). Borda hairline de 1px (`#C8CFDA`) em card, input e divisor da navegação — nunca
borda grossa ou dupla.

## Components

### Buttons
- **Shape:** cantos de 2px (`rounded-md`), quase reto.
- **Primary:** `Azul Confiança` de fundo, texto sobre fundo claro, altura 40px (`h-10`),
  padding horizontal 16px. Variante `lg` sobe para 44px com padding 32px; `sm` desce a 36px.
- **Hover / Focus:** hover escurece para `#306DFE` (90% de opacidade sobre o fundo da página);
  foco usa anel de 2px na cor `ring` com 2px de offset — nunca só a mudança de cor.
- **Secondary / Outline / Ghost / Destructive / Link:** mesma forma e altura do primário, troca
  só a cor de fundo/texto — `secondary` usa `Névoa Secundária`, `outline` fica transparente com
  borda hairline, `ghost` só reage no hover, `destructive` usa `Vermelho Saída`.

### Badges
- **Style:** pílula (`rounded-full`), fundo sólido por variante, texto `text-xs font-semibold`.
- **Uso real:** contagem de parcelas pagas (ex: "3/10"), sempre em `secondary` — nunca a cor de
  ação principal.

### Cards / Containers
- **Corner Style:** 4px (`rounded-lg`).
- **Background:** `Branco Cartão`, texto `Grafite Texto`.
- **Shadow Strategy:** `shadow-sm` fixo (ver Elevation & Depth); não muda com hover.
- **Border:** hairline opcional conforme o `className` do card (a primitiva já inclui `border`).
- **Internal Padding:** 24px (`p-6`) nos cards de conteúdo (caixinha, parcelamento); 12px (`p-3`)
  nos três cartões compactos de resumo do mês.

### Inputs / Fields
- **Style:** altura 40px, borda hairline, fundo igual ao da página, cantos de 2px.
- **Focus:** anel de 2px na cor `ring` com 2px de offset, sem mudança de borda.
- **Disabled:** opacidade 50%, cursor bloqueado.

### Navigation
- **Barra inferior fixa:** ícone (20px) + rótulo (`text-xs`) por item, cor `Chumbo Secundário`
  inativo e `Azul Confiança` no item ativo; sem preenchimento de fundo no item ativo, só a cor do
  ícone e do texto muda.
- **Cabeçalho de marca:** barra sólida `Azul Confiança` com ícone + nome do app em texto branco
  centralizados, presente em toda tela autenticada.

### Splash / Tela de Boot (componente assinatura)
Única superfície do app em `Azul Confiança` cheio, em vez de `Névoa de Fundo` — reservada para o
primeiro frame que todo usuário vê. Ícone + wordmark "Conta Fácil" (`font-display`) centralizados,
seguidos de uma barra indeterminada fina (trilho a 25% de opacidade sobre `primary-foreground`,
preenchimento sólido deslizando) no lugar de um spinner genérico — mesma lógica da Barra de
Progresso, adaptada para quando não há percentual real a mostrar. Fecha com o mesmo fade de 250ms
de opacidade das demais transições de estado do app.

### Barra de Progresso (componente assinatura)
Trilho `Névoa Suave` de 8px de altura, totalmente arredondado (`rounded-full`), preenchido em
`Verde Confirmado` proporcional ao percentual alcançado (parcela paga, meta da caixinha). Nunca
muda de cor por faixa de progresso — o verde é fixo, o que muda é só a largura do preenchimento.

### Botão de Registrar / Speed Dial (componente assinatura)
Círculo de 56px (`size-14`) em `Azul Confiança` com `shadow-md`, fixo no canto inferior direito.
Ao abrir, revela dois botões secundários (Receita/Despesa) com animação de entrada
(`speed-dial-in`, 150ms) e ícone colorido pelo sinal do lançamento (verde para receita, vermelho
para despesa) — a única leitura de cor dentro de um componente `secondary`.

## Do's and Don'ts

### Do:
- **Do** usar cor sólida sempre, nunca gradiente, em qualquer superfície ou botão — a única
  exceção é o indicador funcional de rolagem do `DataTable` (ver **Exceção documentada** em
  Colors), nunca decoração.
- **Do** colorir todo valor monetário pelo sinal: verde para entrada/liquidação, vermelho para
  saída, azul para o que está guardado (ver **A Regra do Dinheiro com Sinal**).
- **Do** usar algarismos tabulares (`'tnum' on`) em qualquer número monetário, na fonte display.
- **Do** manter o modal com margem lateral fixa no mobile (`w-[calc(100%-2rem)]`) — nunca
  encostar nas bordas da tela.
- **Do** reservar sombra para o que está flutuando sobre a interface (modal, FAB); cards ficam
  com `shadow-sm` fixo, sem variação por hover.
- **Do** usar ícone de linha (Lucide) para qualquer pictograma de interface.

### Don't:
- **Don't** usar emoji em nenhum texto ou estado da interface.
- **Don't** usar travessão como conector no texto de UI.
- **Don't** aumentar a sombra de um card ao passar o mouse — o sistema é plano por padrão, não
  "levanta" elemento como recompensa de interação.
- **Don't** usar cor neutra num valor monetário cuja direção (entrada/saída) importa para a
  decisão do usuário.
- **Don't** adicionar gamificação (confete, emblema, tom infantilizado) — anti-referência
  confirmada do produto.
