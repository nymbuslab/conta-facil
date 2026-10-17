# Design system aplicável (DESIGN.md)

> Área estudada: as regras do sistema de design já documentado que esta feature precisa obedecer — sem mudança de mundo visual (ver brief de design confirmado via `/impeccable shape`, colado na ingestão desta feature).

## Contrato de entrada

NÃO SE APLICA (não é um recurso de API/código, é um guia de decisão visual).

## Contrato de saída

Regras nomeadas relevantes para os componentes novos desta feature (`DESIGN.md`):
- **Regra do Dinheiro com Sinal**: todo valor monetário carrega a direção — verde (`#139086`, `text-success`) para entrada/liquidação, vermelho (`#DC2828`, `text-destructive`) para saída, azul (`#1A5EFF`, `text-primary`) para o que está guardado. Os cards novos ("Contas vencendo", "Últimos lançamentos") devem seguir essa regra ao colorir valores de despesa/receita.
- **Cor sólida, nunca gradiente** — nenhum componente novo introduz gradiente (a única exceção documentada é o indicador de rolagem do `DataTable`).
- **Cards com `shadow-sm` fixo, cantos 4px (`rounded-lg`)** — os dois cards novos do dashboard seguem a mesma primitiva `Card`/`CardHeader`/`CardContent` já usada em `SaldoCard`, sem sombra nova no hover.
- **Ícone de linha (Lucide), sem emoji** — qualquer ícone novo (ex.: hambúrguer do "Mais", ícone de "ver mais") vem de `lucide-react`.
- **Alvo de toque mínimo 44px** — já corrigido no projeto para `Button size="icon"` (ver `PROGRESSO.md`, achado de auditoria 2026-10-17); qualquer novo botão/ícone clicável (ex.: abrir o painel "Mais") segue o mesmo padrão.
- **Container único mobile-first**: `mx-auto max-w-xl px-4`, com `pb-36` em telas com nav inferior fixa + FAB — o Extrato herda esse padrão; o Início (sem FAB) pode reavaliar o `pb-36` já que não há mais botão flutuante cobrindo o rodapé, mas isso é detalhe de implementação, não de identidade.

## Limites e cotas

NÃO SE APLICA.

## Erros conhecidos e tratamento

NÃO SE APLICA.

## Riscos para a nossa implementação

- O painel lateral "Mais" é um padrão de interação **novo** no design system do projeto (não existe hoje nenhuma documentação de "sheet"/"drawer" em `DESIGN.md`). Ao implementá-lo, `DESIGN.md` precisa ganhar uma seção nova documentando esse componente (cor de overlay — já existe o token `overlay` usado pelo `Dialog`, largura, animação de entrada/saída), para não ficar um componente de identidade visual sem registro, repetindo o padrão que o projeto já segue para `Dialog`/`Splash`/`Botão de Registrar` (componentes "assinatura" documentados em `DESIGN.md`).
- Abas (`[Receita] [Despesas]`) também são um padrão de navegação novo — `DESIGN.md` não documenta hoje nenhum componente de abas. Precisa de decisão de estilo (ex.: reusar `Button variant="ghost"`/`secondary` como alternador, ou um primitivo de `Tabs` novo) antes da F3, e registro em `DESIGN.md` depois de implementado.

## Fonte

`DESIGN.md`, `PRODUCT.md` (lidos via `impeccable context` nesta sessão) — acessado em 2026-10-17.
