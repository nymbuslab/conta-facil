# Roadmap — Conta Fácil

## Visão

App mobile-first de controle financeiro pessoal com conta própria, visão do mês vigente,
caixinhas por objetivo e acompanhamento de parcelamentos.

## Onde estamos

Login e cadastro usam Neon Managed Auth. Lançamentos e caixinhas são persistidos no Neon
Postgres por uma Neon Function autenticada, com isolamento por usuário. A aplicação está em
produção: branch Neon `production` com schema de negócio e Function implantados, frontend
publicado no Cloudflare Pages em `https://contafacil.nymbuslab.com.br` com deploy contínuo a
partir do push em `master`, golden path validado de ponta a ponta. A idempotência financeira
(lançamentos, depósito e resgate) também está implantada em `production` desde 2026-10-13.

## Prioridades

- **P2** — monitorar a cadeia transitiva do Drizzle Kit: sem correção compatível disponível hoje
  para os 4 alertas moderados residuais sem recorrer a `--force` ou downgrade

## Fora de escopo (por ora)

- Seletor de mês na tela Início
- Múltiplos usuários em uma conta compartilhada
- Relatórios ou exportação de dados
