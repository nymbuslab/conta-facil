# Design system — tokens de cor e biblioteca de ícones disponíveis

## Contrato de entrada

NÃO DOCUMENTADO (não é um recurso parametrizável; são tokens CSS e uma lib de ícones já instalada).

## Contrato de saída

Tokens de cor disponíveis via Tailwind, definidos como CSS vars HSL em `src/index.css:6-44` (claro) e `:47-84` (`.dark`, hoje sem toggle ligado na UI): `background`, `foreground`, `card`, `popover`, `primary` (azul `222 100% 55%`), `secondary`, `muted` (+ `muted-foreground`, usado hoje para texto inativo em `src/components/saldo-acumulado-bar.tsx`), `accent`, `destructive`, `success`, `warning`, `info`, `border`, `input`, `ring`. Mapeados em `tailwind.config.ts` como classes `bg-primary`, `text-muted-foreground` etc.

Biblioteca de ícones: `lucide-react` (`package.json`, `^1.53.0`), já usada em `src/components/registrar-fab.tsx:2` (`ArrowDownRight`, `ArrowUpRight`, `Plus`, `X`) e `src/components/saldo-card.tsx` (`ArrowDownRight`, `ArrowUpRight`). Qualquer ícone novo para as abas da navegação deve vir desta mesma lib, para manter consistência visual.

## Limites e cotas

NÃO DOCUMENTADO.

## Erros conhecidos e tratamento

NÃO DOCUMENTADO.

## Riscos para a nossa implementação

- O padrão visual do projeto usa `text-primary` para estado "ativo/destacado" (ex. ícones de seta nos cards de saldo) e `text-muted-foreground` para rótulos secundários (`src/components/saldo-card.tsx`, `src/components/saldo-acumulado-bar.tsx`). Uma barra de navegação nova deveria seguir o mesmo par (aba ativa em `text-primary`, abas inativas em `text-muted-foreground`) para não introduzir um padrão visual novo sem necessidade.
- Raio de borda do projeto é propositalmente pequeno (`--radius: 0.25rem`, estética "ficha/extrato") — a barra de navegação não deveria usar cantos arredondados grandes nem sombra pesada, para não destoar dos cards e do modal já existentes.

## Fonte

`src/index.css:1-103` — acessado em 2026-10-08
`src/components/registrar-fab.tsx` — acessado em 2026-10-08
`src/components/saldo-card.tsx` — acessado em 2026-10-08
`package.json` (`lucide-react: ^1.53.0`) — acessado em 2026-10-08
