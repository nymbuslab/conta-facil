# Changelog

Marcos entregues do Conta Fácil, em ordem cronológica.

## 2026-10-13 — Listas com 5 itens por vez

- As listas de receitas, despesas e caixinhas passam a mostrar 5 itens por vez, com o botão
  "Carregar mais" trazendo o restante — cabe melhor na tela do celular.

## 2026-10-13 — Listas trafegam só o necessário

- As listas de lançamentos e caixinhas agora enviam pela rede apenas os campos que a tela usa: cada
  página ficou cerca de 38% menor e o identificador interno da conta deixou de acompanhar cada item.

## 2026-10-13 — Listas mais leves e filtros de mês e busca

- As listas de receitas, despesas e caixinhas agora carregam aos poucos (botão "Carregar mais"),
  então abrir a tela continua rápido mesmo com muitos lançamentos.
- Dá para navegar entre os meses e buscar por descrição na tela Início.
- Os totais do mês vêm do servidor, e a tela Parcelas mostra o resumo de cada parcelamento sem
  precisar baixar todas as parcelas.

## 2026-10-13 — Interface mais responsiva e acessível

- Ações que dependem da rede agora dão sinal claro de que estão acontecendo: o botão desabilita e
  muda o texto ("Registrando...", "Criando...", "Confirmando...") enquanto a operação não termina,
  e o mesmo toque repetido não cria lançamento duplicado.
- Marcar uma despesa como paga e excluir uma caixinha aparecem na hora; se a operação falhar, a
  tela volta ao estado anterior e avisa o que aconteceu, sem perder o que você digitou.
- Ao recarregar os dados, o que já está na tela continua visível em vez de sumir; as telas agora
  mostram um esqueleto com o formato do conteúdo enquanto a primeira carga não chega.
- Ajustes de acessibilidade em toda a interface (rótulos, foco visível, área de toque e contraste)
  e respeito à preferência "reduzir movimento" do sistema: as animações são desligadas.

## 2026-10-13 — Ícone e logo próprios do Conta Fácil

- Novo ícone do app (aba do navegador e atalho de celular), com a identidade visual do Conta Fácil.
- As telas de entrar e criar conta agora mostram a logo em destaque, no lugar do cabeçalho genérico.
- O cabeçalho das telas principais também ganhou o ícone ao lado do nome do app.

## 2026-10-13 — Status de despesa com data de vencimento

- A lista de despesas agora distingue "A vencer" de "Vencido" (vermelho), além de "Pago"
  (verde) — antes só existia "Pendente"/"Pago".

## 2026-10-13 — Idempotência na escrita financeira em produção

- Lançamentos, depósitos e resgates agora podem ser repetidos com segurança: em caso de
  falha de rede, a mesma operação não gera duplicata.

## 2026-10-11 — Conta Fácil no ar

- O app está em produção em `https://contafacil.nymbuslab.com.br`, com os mesmos dados reais e
  contas de usuário de antes, agora servidos pelo ambiente final.

## 2026-10-10 — Correção: dados não carregavam após o login

- Corrigido um bug que fazia o app mostrar "Não foi possível carregar seus dados" para todo
  mundo logo após entrar ou criar conta — login funcionava, mas nada aparecia.
- Corrigido o valor cortado no card de Despesa da tela Início, no celular.

## 2026-10-10 — Contas reais e dados persistidos

- Login e cadastro agora usam Neon Managed Auth; o perfil mostra a conta autenticada.
- Lançamentos, parcelas e caixinhas ficam salvos no Neon Postgres e sobrevivem ao recarregamento.
- Cada conta acessa somente os próprios dados.
- As telas mostram carregamento, falha com nova tentativa e estado vazio sem mascarar erros.

## 2026-10-08 — Navegação inferior, parcelamento e caixinhas

- Barra de navegação inferior com quatro abas: Início, Parcelas, Caixinhas e Perfil.
- Despesas podem ser parceladas (geração automática de parcelas mensais) e marcadas como pagas
  direto na lista da Início.
- Caixinhas: criar reserva com meta, depositar, resgatar e excluir — o saldo da Início passa a
  descontar o total guardado nelas.
- Tela de perfil com nome e e-mail (dados fictícios, somente leitura).

## Anteriores

- Correções de responsividade mobile, nome do app no cabeçalho, máscara de valor monetário em
  padrão texto livre pt-BR e simplificação das datas dos lançamentos (remoção da data de emissão
  da despesa).
- Protótipo inicial da tela principal do Conta Fácil.
