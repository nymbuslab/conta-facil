# Roadmap — Conta Fácil

## Visão

App mobile-first de controle financeiro pessoal com conta própria, visão do mês selecionado,
caixinhas por objetivo e acompanhamento de parcelamentos.

## Onde estamos

Login e cadastro usam Neon Managed Auth. Lançamentos e caixinhas são persistidos no Neon
Postgres por uma Neon Function autenticada, com isolamento por usuário. A aplicação está em
produção: branch Neon `production` com schema de negócio e Function implantados, frontend
publicado no Cloudflare Pages em `https://contafacil.nymbuslab.com.br` com deploy contínuo a
partir do push em `master`, golden path validado de ponta a ponta. A idempotência financeira
(lançamentos, depósito e resgate) também está implantada em `production` desde 2026-10-13.

As listas (Início e Caixinhas) são paginadas por cursor com filtro de mês e busca no servidor, e a
tela Início permite navegar entre os meses; os totais e os parcelamentos vêm de endpoints
agregados.

Depósitos em caixinha têm origem rastreada desde 2026-10-16 (saldo atual ou dinheiro de fora),
com lançamento de receita vinculado quando o dinheiro é de fora.

## Prioridades

_(nada no momento)_

## Fora de escopo (por ora)

- Múltiplos usuários em uma conta compartilhada
- Relatórios ou exportação de dados
