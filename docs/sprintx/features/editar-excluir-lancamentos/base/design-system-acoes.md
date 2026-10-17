# Convenções de design já estabelecidas para diálogo e ação destrutiva

## Contrato de entrada

`DESIGN.md` (lido via `impeccable context` no início desta sessão) já documenta padrões que
qualquer diálogo novo de editar/excluir precisa seguir, não decisões a inventar:
- Botão `destructive` já existe como variante no design system (`components.button-primary` e
  irmãos, `DESIGN.md`) — usa `Vermelho Saída`.
- "Ação destrutiva nomeia a consequência" é regra do projeto (`CLAUDE.md`, seção "Mentalidade
  de engenharia e UX": "ação destrutiva nomeia a consequência", vindo da skill `regras-design`).
- Modal sempre com margem lateral fixa no mobile (`w-[calc(100%-2rem)]`) — decisão já em
  `CLAUDE.md` ("Dialogs").
- Cor por sinal já é regra fechada: verde = entrada/liquidação, vermelho = saída, azul =
  guardado (`DESIGN.md`, "A Regra do Dinheiro com Sinal", citada nesta mesma sessão ao
  recomendar verde em vez de azul pro ícone de "pago").

## Contrato de saída

Não se aplica.

## Limites e cotas

Não se aplica.

## Erros conhecidos e tratamento

Não se aplica.

## Riscos para a nossa implementação

- Um botão "Excluir" sem nomear a consequência (ex.: só "Excluir" em vez de "Excluir
  lançamento — essa ação não pode ser desfeita" ou similar) quebraria a regra já fechada do
  projeto, não uma regra nova desta feature.
- Se a F3 decidir reaproveitar o mesmo `Dialog` pra pagar/editar/excluir, o botão destrutivo
  (excluir) precisa de hierarquia visual clara em relação ao botão primário (pagar) — o
  design system não documenta ainda um padrão de "três ações no mesmo rodapé de diálogo";
  isso é uma decisão nova de composição, não um precedente a seguir.

## Fonte

`DESIGN.md` (seções citadas), `CLAUDE.md` (seções "Dialogs" e "Mentalidade de engenharia e
UX") — lidos em 2026-10-17.
