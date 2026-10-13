# Validação visual da migração para Tailwind 4

## Ambiente e dados

- Aplicação: `npm run dev -- --mode test`, origem `http://localhost:5173`.
- Viewports: 390 x 844 e 1440 x 900.
- Usuário descartável criado pela interface na branch de teste; a credencial não foi persistida.
- Respostas financeiras interceptadas no navegador para tornar o cenário determinístico: receita de R$ 6.450, despesa parcelada de R$ 500 e caixinha com R$ 1.000.
- Em cada estado autenticado, o loading terminou, o marcador esperado apareceu e não houve overflow horizontal.
- Nos diálogos, o primeiro campo recebeu foco, Tab e Shift+Tab permaneceram dentro do diálogo e Escape fechou o modal.

## Baseline Tailwind 3

| Caso | Marcador | Mobile | Desktop |
|---|---|---|---|
| Login | `Entre na sua conta` | `login-mobile.png` | `login-desktop.png` |
| Início | `R$ 4.950,00` | `inicio-mobile.png` | `inicio-desktop.png` |
| Parcelas | `Despesa parcelada` | `parcelas-mobile.png` | `parcelas-desktop.png` |
| Caixinhas | `Reserva` e `R$ 1.000,00` | `caixinhas-mobile.png` | `caixinhas-desktop.png` |
| Nova caixinha | diálogo `Nova caixinha`, foco em Nome | `dialog-nova-caixinha-mobile.png` | `dialog-nova-caixinha-desktop.png` |
| Depositar | diálogo `Depositar`, foco em Valor | `dialog-depositar-mobile.png` | `dialog-depositar-desktop.png` |
| Resgatar | diálogo `Resgatar`, foco em Valor | `dialog-resgatar-mobile.png` | `dialog-resgatar-desktop.png` |
| Nova receita | diálogo `Nova receita`, foco em Data de entrada | `dialog-nova-receita-mobile.png` | `dialog-nova-receita-desktop.png` |

As 16 imagens ficam em `evidencias/tailwind-v3/`.

### Asserções binárias por estado

| Estado e viewport | Marcador | Loading saiu | Foco inicial | Tab/Shift+Tab | Escape | Sem overflow | Console novo |
|---|---:|---:|---:|---:|---:|---:|---:|
| Login mobile | sim | sim | Body | n/a | n/a | sim | zero |
| Login desktop | sim | sim | Body | n/a | n/a | sim | zero |
| Início mobile | sim | sim | n/a | n/a | n/a | sim | zero |
| Início desktop | sim | sim | n/a | n/a | n/a | sim | zero |
| Parcelas mobile | sim | sim | n/a | n/a | n/a | sim | zero |
| Parcelas desktop | sim | sim | n/a | n/a | n/a | sim | zero |
| Caixinhas mobile | sim | sim | n/a | n/a | n/a | sim | zero |
| Caixinhas desktop | sim | sim | n/a | n/a | n/a | sim | zero |
| Nova caixinha mobile | sim | sim | Nome | sim | sim | sim | zero |
| Nova caixinha desktop | sim | sim | Nome | sim | sim | sim | zero |
| Depositar mobile | sim | sim | Valor | sim | sim | sim | zero |
| Depositar desktop | sim | sim | Valor | sim | sim | sim | zero |
| Resgatar mobile | sim | sim | Valor | sim | sim | sim | zero |
| Resgatar desktop | sim | sim | Valor | sim | sim | sim | zero |
| Nova receita mobile | sim | sim | Data de entrada | sim | sim | sim | zero |
| Nova receita desktop | sim | sim | Data de entrada | sim | sim | sim | zero |

Os erros de CORS observados antes da interceptação pertencem à tentativa inicial contra a Function implantada e não aos 16 estados capturados. Depois que as rotas determinísticas foram instaladas, as capturas não produziram erro novo no console.

## Critério de comparação Tailwind 4

Para cada par v3/v4, medir o retângulo do marcador principal e aceitar no máximo 2 px de diferença em posição ou tamanho. Cor, fundo, borda, raio, tamanho de fonte e alvo de foco devem ser iguais. Também são obrigatórios zero overflow horizontal, Escape funcional e ausência de erros novos no console.

## Resultado Tailwind 4

Os 16 estados foram repetidos em `evidencias/tailwind-v4/`. Todos os marcadores principais ficaram dentro da tolerância de 2 px em posição e tamanho; cores, fundos, bordas, raios, tipografia e alvo de foco permaneceram equivalentes ao baseline.

### Medições por par

As medições abaixo foram coletadas entre duas aplicações isoladas, depois de estabilizar os 200 ms de animação: o baseline real do commit `1ee45a9`, com o DOM original e Tailwind 3.4.17, em uma worktree descartável; e a árvore atual com Tailwind 4.3.3. As duas receberam os mesmos viewports e respostas de API interceptadas. O retângulo usa `x/y/largura/altura`, em pixels. `0` significa que a maior diferença absoluta entre os quatro valores foi zero.

| Estado | Viewport | Retângulo v3 | Retângulo v4 | Delta máximo | Propriedades computadas |
|---|---|---:|---:|---:|---|
| Login | mobile | `41/265/308/32` | `41/265/308/32` | `0` | F1 = F1 |
| Login | desktop | `553/293/334/32` | `553/293/334/32` | `0` | F1 = F1 |
| Início | mobile | `33/178/324/32` | `33/178/324/32` | `0` | F2 = F2 |
| Início | desktop | `465/178/510/32` | `465/178/510/32` | `0` | F2 = F2 |
| Parcelas | mobile | `41/155/128,25/20` | `41/155/128,25/20` | `0` | F3 = F3 |
| Parcelas | desktop | `473/155/128,25/20` | `473/155/128,25/20` | `0` | F3 = F3 |
| Caixinhas | mobile | `41/158/54,41/20` | `41/158/54,41/20` | `0` | F3 = F3 |
| Caixinhas | desktop | `473/158/54,41/20` | `473/158/54,41/20` | `0` | F3 = F3 |
| Nova caixinha | mobile | `41/297/308/18` | `41/297/308/18` | `0` | F4 = F4 |
| Nova caixinha | desktop | `553/325/334/18` | `553/325/334/18` | `0` | F4 = F4 |
| Depositar | mobile | `41/341/308/18` | `41/341/308/18` | `0` | F4 = F4 |
| Depositar | desktop | `553/369/334/18` | `553/369/334/18` | `0` | F4 = F4 |
| Resgatar | mobile | `41/341/308/18` | `41/341/308/18` | `0` | F4 = F4 |
| Resgatar | desktop | `553/369/334/18` | `553/369/334/18` | `0` | F4 = F4 |
| Nova receita | mobile | `41/253/308/18` | `41/253/308/18` | `0` | F4 = F4 |
| Nova receita | desktop | `521/281/398/18` | `521/281/398/18` | `0` | F4 = F4 |

Fingerprints completos, na ordem `cor; fundo; borda; raio; tamanho; família; peso`:

- F1: `rgb(15, 24, 41); transparente; rgb(200, 208, 218); 0px; 24px; Geist, Inter, system-ui, sans-serif; 600`.
- F2: `rgb(19, 144, 134); transparente; rgb(200, 208, 218); 0px; 24px; Geist, Inter, system-ui, sans-serif; 700`.
- F3: `rgb(15, 24, 41); transparente; rgb(200, 208, 218); 0px; 14px; Inter, system-ui, sans-serif; 500`.
- F4: `rgb(15, 24, 41); transparente; rgb(200, 208, 218); 0px; 18px; Inter, system-ui, sans-serif; 600`.

Assim, os 16 pares tiveram delta geométrico de `0 px` e igualdade em todas as sete propriedades computadas registradas.

| Estado | Mobile | Desktop | Foco/teclado | Overflow | Console |
|---|---:|---:|---:|---:|---:|
| Login | aprovado | aprovado | Body, igual ao baseline | zero | zero erro |
| Início | aprovado | aprovado | n/a | zero | zero erro |
| Parcelas | aprovado | aprovado | n/a | zero | zero erro |
| Caixinhas | aprovado | aprovado | n/a | zero | zero erro |
| Nova caixinha | aprovado | aprovado | Nome; Tab/Shift+Tab presos; Escape fecha | zero | zero erro |
| Depositar | aprovado | aprovado | Valor; Tab/Shift+Tab presos; Escape fecha | zero | zero erro |
| Resgatar | aprovado | aprovado | Valor; Tab/Shift+Tab presos; Escape fecha | zero | zero erro |
| Nova receita | aprovado | aprovado | Data de entrada; Tab/Shift+Tab presos; Escape fecha | zero | zero erro |

O Tailwind 4 mudou a implementação de `space-y-*` para margem no elemento anterior. Como `label` é inline, isso eliminava visualmente o espaço interno dos campos. A primeira tentativa com `flex flex-col gap-2` acrescentou de 5 a 15 px à altura de alguns formulários e foi rejeitada pela convergência. `FormItem` passou então a usar o seletor explícito `[&>*+*]:mt-2`, que reproduz a margem no irmão seguinte do Tailwind 3. A medição final contra o DOM original e a recaptura das 16 imagens v4 foram feitas depois da animação de 200 ms dos diálogos.

Resultado: **aprovado**.
