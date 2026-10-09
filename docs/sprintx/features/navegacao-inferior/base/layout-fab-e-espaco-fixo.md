# Layout da tela principal — elementos fixos e espaço reservado

## Contrato de entrada

NÃO DOCUMENTADO (não é um recurso com parâmetros; é layout CSS).

## Contrato de saída

`src/components/registrar-fab.tsx:19` posiciona o botão "Registrar" com `className="fixed bottom-6 right-6 ..."` — fixo no canto inferior direito da viewport, independente de scroll.

`src/routes/index.tsx:25` reserva espaço para esse botão não tampar a última linha de conteúdo: o container principal usa `className="mx-auto min-h-svh max-w-xl px-4 pb-28"` (padding-bottom de 7rem).

## Limites e cotas

NÃO DOCUMENTADO.

## Erros conhecidos e tratamento

NÃO DOCUMENTADO.

## Riscos para a nossa implementação

- Uma barra de navegação inferior fixa (`fixed bottom-0`, full-width) vai ocupar a mesma faixa de tela que o FAB (`bottom-6 right-6`). Sem ajuste, os dois se sobrepõem visualmente. A barra de navegação precisa de uma altura própria (ex. 56-64px) e o FAB precisa subir seu `bottom` para ficar acima dela (ex. `bottom-20` ou `bottom-[calc(altura-da-barra+1rem)]`).
- O `pb-28` do container também foi dimensionado só para o FAB. Com a barra de navegação fixa, o padding inferior da página precisa crescer o suficiente para a barra não cobrir a última linha das listas de Receita/Despesa.
- Nenhum dos dois ajustes acima é uma decisão de produto — são consequência direta de adicionar um elemento fixo novo na mesma região; entram no plano como task de ajuste de layout, não como pergunta ao usuário.

## Fonte

`src/components/registrar-fab.tsx:19` — acessado em 2026-10-08
`src/routes/index.tsx:25` — acessado em 2026-10-08
