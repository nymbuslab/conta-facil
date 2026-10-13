# Changelog

Marcos entregues do Conta Fácil, em ordem cronológica.

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
