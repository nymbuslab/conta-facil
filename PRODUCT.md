# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Pessoa física controlando as próprias finanças pessoais no dia a dia: consulta o saldo do mês
selecionado, registra receitas e despesas, acompanha parcelamentos e guarda dinheiro em caixinhas
(poupança por objetivo). Hoje o uso real é do próprio criador do produto, mas o projeto é tratado
como protótipo em evolução para um produto real aberto a outras pessoas — decisões de dado e
arquitetura já consideram isso, mesmo sem usuários externos confirmados ainda.

## Product Purpose

Controle financeiro pessoal simplificado: visão do mês selecionado (saldo, receitas, despesas),
parcelamentos acompanhados ao longo do tempo e caixinhas com saldo corrido separado do caixa do
mês. Sucesso é o usuário conseguir registrar e entender sua situação financeira sem fricção, em
sessões curtas e no celular.

## Positioning

Simplicidade deliberada em vez da flexibilidade genérica de apps de finanças prontos (Mobills,
Organizze, planilha): menos campo e menos decisão em cada fluxo (despesa só tem vencimento, não
emissão; parcelamento é informado pelo valor da parcela, não pelo total). Os dados financeiros são
100% do usuário, sem terceiro lendo ou processando essas informações. Caixinhas com origem de
depósito rastreada (saldo atual vs. dinheiro de fora) mantêm o efeito líquido no saldo sempre
correto — mecanismo que os concorrentes prontos não oferecem.

## Operating Context

Uso mobile-first, no navegador, em sessões curtas (registrar uma despesa, conferir o saldo do mês,
depositar numa caixinha). Login e cadastro via Neon Managed Auth; cada conta vê somente os próprios
dados, isolados por usuário.

## Capabilities and Constraints

- Lançamentos: receitas e despesas; despesa não tem data de emissão, só vencimento.
- Parcelamentos: o usuário informa o valor de cada parcela, não o total.
- Caixinhas: poupança por objetivo, saldo corrido (não entra no filtro de mês), com origem do
  depósito rastreada (saldo atual ou dinheiro de fora).
- Toda mutação financeira (lançamento, depósito, resgate) é idempotente.
- Fora de escopo por ora: múltiplos usuários numa conta compartilhada; relatórios ou exportação de
  dados.
- Plataforma: web, mobile-first (não é wrapper nativo).

## Brand Commitments

Nome "Conta Fácil". Ícone "C-moeda" (anel aberto em azul sólido da marca, sem gradiente). Paleta e
tipografia definidas em `src/index.css` (cores HSL, azul primário sólido, `--radius: 0.25rem`).
Segue as regras do projeto contra cara de interface gerada por IA: cores sólidas sem gradiente, sem
emoji na UI, sem travessão como conector.

## Evidence on Hand

Nenhum depoimento, caso de uso ou dado de terceiro documentado até aqui — não inventar nenhum
desses até existir evidência real.

## Product Principles

1. Menos campo e menos decisão vence flexibilidade genérica — cada simplificação (ex: despesa sem
   emissão) é deliberada, não lacuna a corrigir depois.
2. O dado financeiro é do usuário; nenhuma feature depende de terceiro lendo ou processando esses
   dados.
3. Toda ação de dinheiro é auditável e sem duplicação — confiança vem antes de conveniência.
4. Mobile é o caso de uso real, não um responsivo de desktop.
5. Serve um usuário só hoje, mas decisões de dado e arquitetura já pensam em abrir para outras
   pessoas no futuro.

## Accessibility & Inclusion

Suíte de acessibilidade com `jest-axe` e correções já aplicadas (foco visível, `aria-label`, alvo
de toque mínimo de 44px, `prefers-reduced-motion`). Nenhum requisito adicional confirmado além
disso.
