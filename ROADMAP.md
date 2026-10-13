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

- **P2** — verificar o replay de `Idempotency-Key` e o 409 por reuso direto contra a Function de
  `production`, já que a validação pós-deploy cobriu só escrita normal
- **P2** — atualizar a cadeia transitiva do Drizzle Kit quando houver correção compatível para
  os 4 alertas moderados residuais, sem `--force` ou downgrade
- **P2** — definir retenção dos registros de idempotência e automatizar o teardown de usuários e
  dados descartáveis da branch de teste
- **P2** — reforçar a trava dos scripts de teste com a identidade real da conexão e mover o log
  de execução idempotente para depois da confirmação do commit

## Fora de escopo (por ora)

- Seletor de mês na tela Início
- Múltiplos usuários em uma conta compartilhada
- Relatórios ou exportação de dados
