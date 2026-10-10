# Roadmap — Conta Fácil

## Visão

App mobile-first de controle financeiro pessoal com conta própria, visão do mês vigente,
caixinhas por objetivo e acompanhamento de parcelamentos.

## Onde estamos

Login e cadastro usam Neon Managed Auth. Lançamentos e caixinhas são persistidos no Neon
Postgres por uma Neon Function autenticada, com isolamento por usuário. A integração completa foi
validada e implantada na branch Neon `test`.

## Prioridades

- **P0** — preparar e aprovar o rollout para `production`, incluindo migration, Function, Auth,
  variáveis do frontend, validação pós-deploy e rollback
- **P1** — executar o golden path visual autenticado em desktop e mobile quando a automação do
  Chrome estiver disponível; os testes de componentes e o login visual já foram validados
- **P1** — revisar os alertas do `npm audit` e atualizar dependências sem quebra antes do rollout

## Fora de escopo (por ora)

- Seletor de mês na tela Início
- Múltiplos usuários em uma conta compartilhada
- Relatórios ou exportação de dados
